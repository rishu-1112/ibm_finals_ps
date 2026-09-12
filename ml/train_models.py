"""Train reproducible health-intelligence models from the supplied CSV files.

This project contains NFHS data at *district* level and RHS data at *state*
level.  The artifacts therefore make district/state predictions only; village
records can be scored after they are collected in the same feature schema.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import TransformedTargetRegressor
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, confusion_matrix, fbeta_score, mean_absolute_error, r2_score, silhouette_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "datasets"
MODEL_DIR = Path(__file__).resolve().parent / "artifacts"
RANDOM_STATE = 42


def column_matching(columns: pd.Index, required_terms: list[str]) -> str:
    """Find one column containing every requested phrase (case-insensitive)."""
    for column in columns:
        normalized = re.sub(r"\s+", " ", str(column).lower())
        if all(term.lower() in normalized for term in required_terms):
            return str(column)
    raise KeyError(f"No column matching {required_terms!r}")


def percentage_columns(frame: pd.DataFrame) -> list[str]:
    columns = []
    for column in frame.columns:
        name = str(column).lower()
        if "(%)" in name or "percent" in name or "%" in name:
            converted = pd.to_numeric(frame[column], errors="coerce")
            if converted.notna().mean() >= 0.65:
                frame[column] = converted
                columns.append(str(column))
    return columns


def build_district_models() -> dict:
    raw = pd.read_csv(DATA_DIR / "NFHS_5_India_Districts_Factsheet_Data.csv")
    district_column = "District Names"
    state_column = "State/UT"
    numeric_columns = percentage_columns(raw)

    target = column_matching(raw.columns, ["children under 5 years", "underweight"])
    # Maternal, care-access and living-condition predictors; the target is never
    # included as a feature, avoiding direct leakage.
    desired_features = [
        ["improved sanitation"],
        ["improved drinking-water"],
        ["health insurance"],
        ["at least 4 antenatal"],
        ["institutional births"],
        ["fully vaccinated"],
        ["children under 5 years", "stunted"],
        ["children under 5 years", "wasted"],
        ["children age 6-59 months", "anaemic"],
        ["women", "BMI", "below normal"],
    ]
    features = []
    for terms in desired_features:
        try:
            found = column_matching(raw.columns, terms)
            if found != target and found not in features:
                features.append(found)
        except KeyError:
            continue
    if len(features) < 4:
        raise ValueError("NFHS schema did not provide enough nutrition predictors.")

    usable = raw[[district_column, state_column, target, *features]].copy()
    usable[target] = pd.to_numeric(usable[target], errors="coerce")
    usable = usable.dropna(subset=[target])
    X, y = usable[features], usable[target]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )
    nutrition_model = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("model", RandomForestRegressor(
            n_estimators=400, min_samples_leaf=3, random_state=RANDOM_STATE, n_jobs=-1
        )),
    ])
    nutrition_model.fit(X_train, y_train)
    predictions = nutrition_model.predict(X_test)

    # Isolation Forest is deliberately separate from the outcome model. It flags
    # districts with an unusual adverse combination of indicators, even where an
    # outcome label is absent.
    risk_features = [target, *features]
    anomaly_model = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("model", IsolationForest(contamination=0.12, random_state=RANDOM_STATE)),
    ])
    anomaly_model.fit(usable[risk_features])

    joblib.dump({
        "model": nutrition_model,
        "features": features,
        "target": target,
        "district_column": district_column,
        "state_column": state_column,
    }, MODEL_DIR / "district_undernutrition_regressor.joblib")
    joblib.dump({"model": anomaly_model, "features": risk_features}, MODEL_DIR / "district_anomaly_detector.joblib")

    importances = nutrition_model.named_steps["model"].feature_importances_
    return {
        "rows": len(usable),
        "target": target,
        "features": features,
        "test_mae_percentage_points": round(mean_absolute_error(y_test, predictions), 3),
        "test_r2": round(r2_score(y_test, predictions), 3),
        "feature_importance": dict(sorted(
            zip(features, map(lambda value: round(float(value), 4), importances)),
            key=lambda item: item[1], reverse=True,
        )),
    }


def build_birth_weight_model() -> dict:
    raw = pd.read_csv(DATA_DIR / "birth_weight_dataset.csv")
    target = "birth_weight_category"
    if target not in raw:
        raise KeyError(f"{target} is missing from birth-weight data")
    X = raw.drop(columns=[target]).copy()
    categorical = X.select_dtypes(include="object").columns.tolist()
    # One-hot encoding keeps the model inference-safe for categorical inputs.
    X = pd.get_dummies(X, columns=categorical, dummy_na=True)
    encoder = LabelEncoder()
    y = encoder.fit_transform(raw[target].astype(str))
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    # The clinically important class is Low birth weight.  We select a decision
    # threshold using only the training partition to favour recall (F2), rather
    # than allowing the much larger Normal class to dominate accuracy.
    low_class = int(encoder.transform(["Low"])[0]) if "Low" in encoder.classes_ else 0
    model = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("model", RandomForestClassifier(
            n_estimators=500, min_samples_leaf=1, class_weight={low_class: 5, 1 - low_class: 1},
            random_state=RANDOM_STATE, n_jobs=-1
        )),
    ])
    folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    oof_probabilities = cross_val_predict(
        model, X_train, y_train, cv=folds, method="predict_proba", n_jobs=-1
    )
    low_probability_index = list(model.fit(X_train, y_train).named_steps["model"].classes_).index(low_class)
    candidate_thresholds = np.arange(0.15, 0.71, 0.05)
    threshold = max(
        candidate_thresholds,
        key=lambda candidate: fbeta_score(
            y_train, np.where(oof_probabilities[:, low_probability_index] >= candidate, low_class, 1 - low_class),
            beta=2, pos_label=low_class, zero_division=0,
        ),
    )
    model.fit(X_train, y_train)
    probabilities = model.predict_proba(X_test)[:, low_probability_index]
    predicted = np.where(probabilities >= threshold, low_class, 1 - low_class)
    joblib.dump({
        "model": model,
        "feature_columns": X.columns.tolist(),
        "target_classes": encoder.classes_.tolist(),
        "low_birth_weight_threshold": round(float(threshold), 2),
    }, MODEL_DIR / "birth_weight_classifier.joblib")
    return {
        "rows": len(raw),
        "classes": encoder.classes_.tolist(),
        "low_birth_weight_threshold": round(float(threshold), 2),
        "test_confusion_matrix": confusion_matrix(y_test, predicted).tolist(),
        "test_report": classification_report(y_test, predicted, target_names=encoder.classes_, output_dict=True),
    }


def clean_count(series: pd.Series) -> pd.Series:
    """Convert RHS counts containing commas, dashes or footnotes to numeric."""
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False), errors="coerce")


def normalized_state_name(value: object) -> str:
    name = re.sub(r"\*+", "", str(value)).replace("\n", " ").strip()
    name = re.sub(r"\s+", " ", name)
    aliases = {
        "A& N Islands": "Andaman & Nicobar Islands",
        "Andaman & Nicobar Islands": "Andaman & Nicobar Islands",
        "Dadra & Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
        "Daman & Diu": "Dadra and Nagar Haveli and Daman and Diu",
        "D & N Haveli": "Dadra and Nagar Haveli and Daman and Diu",
        "D & N Haveli and Daman & Diu": "Dadra and Nagar Haveli and Daman and Diu",
        "All India Total": "All India",
    }
    return aliases.get(name, name)


def build_state_capacity_model() -> dict:
    """Segment states by rural primary-care capacity and staffing gaps."""
    rhs = pd.read_csv(DATA_DIR / "rhs_2020.csv")
    shortages = pd.read_csv(DATA_DIR / "rhs_2020_vacancies_shortfalls.csv")
    population = pd.read_csv(DATA_DIR / "rhs_population_density.csv")
    state_key = "State/UT"
    needed = ["SubCenters", "PHCs", "CHCs", "Doctors", "NursingStaff", "Doctors_Vacent", "Doctors_Shortfall", "Rural_Population"]
    for source in (rhs, shortages, population):
        source["_state"] = source[state_key].map(normalized_state_name)
    for source, columns in (
        (rhs, ["SubCenters", "PHCs", "CHCs", "Doctors", "NursingStaff"]),
        (shortages, ["Doctors_Vacent", "Doctors_Shortfall"]),
        (population, ["Rural_Population"]),
    ):
        for column in columns:
            source[column] = clean_count(source[column])
    rhs = rhs.groupby("_state", as_index=False)[["SubCenters", "PHCs", "CHCs", "Doctors", "NursingStaff"]].sum(min_count=1)
    shortages = shortages.groupby("_state", as_index=False)[["Doctors_Vacent", "Doctors_Shortfall"]].sum(min_count=1)
    population = population.groupby("_state", as_index=False)[["Rural_Population"]].sum(min_count=1)
    frame = rhs.merge(shortages, on="_state", how="inner").merge(population, on="_state", how="inner")
    frame = frame[frame["_state"] != "All India"].copy()
    # Vacancy/shortfall cells are absent for many states.  Keep states with the
    # core facility/population measures and let the fitted imputer handle only
    # those missing staffing-gap values during clustering.
    frame = frame.dropna(subset=["SubCenters", "PHCs", "CHCs", "Doctors", "NursingStaff", "Rural_Population"])
    denominator = frame["Rural_Population"].clip(lower=1)
    frame["facilities_per_100k_rural"] = (
        frame["SubCenters"] + frame["PHCs"] + frame["CHCs"]
    ) / denominator * 100_000
    frame["doctors_per_100k_rural"] = frame["Doctors"] / denominator * 100_000
    frame["nursing_per_100k_rural"] = frame["NursingStaff"] / denominator * 100_000
    frame["doctor_vacancy_rate"] = frame["Doctors_Vacent"] / (frame["Doctors"] + frame["Doctors_Vacent"]).clip(lower=1)
    frame["doctor_shortfall_per_100k_rural"] = frame["Doctors_Shortfall"] / denominator * 100_000
    features = [
        "facilities_per_100k_rural", "doctors_per_100k_rural", "nursing_per_100k_rural",
        "doctor_vacancy_rate", "doctor_shortfall_per_100k_rural",
    ]
    prepared = SimpleImputer(strategy="median").fit_transform(frame[features])
    scaled = StandardScaler().fit_transform(prepared)
    kmeans = KMeans(n_clusters=4, n_init=30, random_state=RANDOM_STATE)
    clusters = kmeans.fit_predict(scaled)
    # Higher availability and lower vacancy/shortfall indicate better capacity.
    direction = np.array([1, 1, 1, -1, -1])
    cluster_strength = (kmeans.cluster_centers_ * direction).mean(axis=1)
    ordered = np.argsort(cluster_strength)
    names = ["critical_capacity_gap", "high_capacity_gap", "moderate_capacity", "stronger_capacity"]
    label_map = {int(cluster): names[rank] for rank, cluster in enumerate(ordered)}
    artifact = {
        "imputer": SimpleImputer(strategy="median").fit(frame[features]),
        "scaler": StandardScaler().fit(prepared),
        "model": kmeans,
        "features": features,
        "cluster_labels": label_map,
    }
    joblib.dump(artifact, MODEL_DIR / "state_capacity_segments.joblib")
    frame["capacity_segment"] = [label_map[int(cluster)] for cluster in clusters]
    return {
        "rows": len(frame),
        "features": features,
        "clusters": frame[["_state", "capacity_segment"]].rename(columns={"_state": state_key}).sort_values(state_key).to_dict(orient="records"),
        "silhouette_score": round(float(silhouette_score(scaled, clusters)), 3),
    }


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "dataset_scope": {
            "NFHS-5": "district-level cross-sectional indicators",
            "RHS": "state-level infrastructure counts",
            "birth_weight_dataset": "individual pregnancy/birth records",
            "important_limit": "No supplied file has village-level time-series outcome labels.",
        },
        "district_undernutrition_model": build_district_models(),
        "state_capacity_segmentation": build_state_capacity_model(),
        "birth_weight_model": build_birth_weight_model(),
    }
    (MODEL_DIR / "training_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
