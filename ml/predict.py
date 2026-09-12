"""Load trained artifacts and score one district record from JSON input."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd

MODEL_DIR = Path(__file__).resolve().parent / "artifacts"


def numeric_features(record: dict, columns: list[str]) -> pd.DataFrame:
    """Match training's tolerant conversion of NFHS percentage fields.

    NFHS cells sometimes contain publication annotations such as ``(64.2)``.
    They are intentionally coerced to missing values here and then handled by
    the imputer inside each saved pipeline.
    """
    frame = pd.DataFrame([record])
    missing = [column for column in columns if column not in frame.columns]
    if missing:
        raise ValueError(f"Record is missing required model fields: {missing}")
    for column in columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    return frame[columns]


def risk_band(predicted_undernutrition: float, anomaly: bool) -> str:
    score = predicted_undernutrition + (15 if anomaly else 0)
    if score >= 45:
        return "CRITICAL"
    if score >= 30:
        return "HIGH"
    if score >= 15:
        return "MODERATE"
    return "LOW"


def predict_district(record: dict) -> dict:
    nutrition = joblib.load(MODEL_DIR / "district_undernutrition_regressor.joblib")
    anomaly = joblib.load(MODEL_DIR / "district_anomaly_detector.joblib")
    predicted = float(nutrition["model"].predict(numeric_features(record, nutrition["features"]))[0])
    # IsolationForest returns -1 for unusual profiles and 1 for typical ones.
    is_anomalous = int(anomaly["model"].predict(numeric_features(record, anomaly["features"]))[0]) == -1
    return {
        "predicted_child_undernutrition_percent": round(predicted, 2),
        "unusual_adverse_profile": is_anomalous,
        "risk_level": risk_band(predicted, is_anomalous),
        "model_scope": "district",
        "note": "Use this decision-support output with public-health review; it is not a clinical diagnosis.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("record", type=Path, help="JSON file holding an NFHS-compatible district record")
    args = parser.parse_args()
    print(json.dumps(predict_district(json.loads(args.record.read_text(encoding="utf-8"))), indent=2))


if __name__ == "__main__":
    main()
