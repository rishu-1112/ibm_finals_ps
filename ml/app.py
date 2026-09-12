"""FastAPI service for ML inference on healthcare data.

This service loads existing trained models and provides endpoints for:
- District-level risk prediction (child undernutrition)
- Anomaly detection (unusual adverse health profiles)
- State capacity segmentation
- Feature importance/explainability

No retraining occurs - uses artifacts as-is.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Setup
MODEL_DIR = Path(__file__).resolve().parent / "artifacts"
app = FastAPI(
    title="GramSwasthya ML Service",
    description="Healthcare intelligence inference service",
    version="1.0.0"
)

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model cache
_models = {}


def load_models() -> dict:
    """Load all trained artifacts on startup."""
    global _models
    if not _models:
        print("Loading ML artifacts...")
        try:
            _models["nutrition"] = joblib.load(MODEL_DIR / "district_undernutrition_regressor.joblib")
            _models["anomaly"] = joblib.load(MODEL_DIR / "district_anomaly_detector.joblib")
            _models["capacity"] = joblib.load(MODEL_DIR / "state_capacity_segments.joblib")
            _models["birth_weight"] = joblib.load(MODEL_DIR / "birth_weight_classifier.joblib")
            _models["training_report"] = json.loads((MODEL_DIR / "training_report.json").read_text())
            print("✓ All models loaded successfully")
        except Exception as e:
            print(f"✗ Error loading models: {e}")
            raise
    return _models


def numeric_features(record: dict, columns: list[str]) -> pd.DataFrame:
    """Convert record to numeric DataFrame matching training schema.
    
    Tolerates missing values - the imputer in each pipeline handles them.
    """
    frame = pd.DataFrame([record])
    missing = [col for col in columns if col not in frame.columns]
    if missing:
        raise ValueError(f"Record missing required fields: {missing}")
    for col in columns:
        frame[col] = pd.to_numeric(frame[col], errors="coerce")
    return frame[columns]


# ============================================================================
# Request/Response Models
# ============================================================================

class DistrictRiskRequest(BaseModel):
    """District health profile for risk assessment."""
    district_name: str
    state: str
    # Any NFHS-format numeric fields (flexible schema)
    additional_data: Optional[dict] = None


class DistrictRiskResponse(BaseModel):
    """District risk prediction output."""
    district_name: str
    state: str
    predicted_child_undernutrition_percent: float
    risk_level: str  # LOW | MODERATE | HIGH | CRITICAL
    unusual_adverse_profile: bool
    confidence_note: str
    feature_importance: dict
    model_info: dict


class ExplanationResponse(BaseModel):
    """Feature importance explanation."""
    district_name: str
    top_contributing_factors: list[dict]
    model_details: dict


# ============================================================================
# Endpoints
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Load models on application startup."""
    load_models()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "GramSwasthya ML"}


@app.get("/info")
async def model_info():
    """Return information about loaded models."""
    models = load_models()
    return {
        "models_loaded": list(models.keys()),
        "model_info": models.get("training_report", {}).get("dataset_scope"),
        "supported_endpoints": [
            "/predict/district-risk",
            "/explain/district",
            "/info"
        ]
    }


@app.post("/predict/district-risk", response_model=DistrictRiskResponse)
async def predict_district_risk(record: dict):
    """
    Predict district-level child undernutrition risk.
    
    Input: Any dict with NFHS-compatible numeric fields.
    The model uses its configured features - missing values handled by imputer.
    
    Output: Risk score, level, anomaly flag, feature importance.
    """
    try:
        models = load_models()
        nutrition_model = models["nutrition"]["model"]
        nutrition_features = models["nutrition"]["features"]
        anomaly_model = models["anomaly"]["model"]
        anomaly_features = models["anomaly"]["features"]
        
        # Prepare numeric data
        X_nutrition = numeric_features(record, nutrition_features)
        X_anomaly = numeric_features(record, anomaly_features)
        
        # Inference
        predicted_undernutrition = float(
            nutrition_model.predict(X_nutrition)[0]
        )
        is_anomalous = int(anomaly_model.predict(X_anomaly)[0]) == -1
        
        # Risk level calculation (from predict.py)
        score = predicted_undernutrition + (15 if is_anomalous else 0)
        if score >= 45:
            risk_level = "CRITICAL"
        elif score >= 30:
            risk_level = "HIGH"
        elif score >= 15:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"
        
        # Feature importance
        feature_importance = dict(
            sorted(
                zip(
                    nutrition_features,
                    nutrition_model.named_steps["model"].feature_importances_,
                ),
                key=lambda x: x[1],
                reverse=True,
            )
        )
        
        return DistrictRiskResponse(
            district_name=record.get("District Names", "Unknown"),
            state=record.get("State/UT", "Unknown"),
            predicted_child_undernutrition_percent=round(predicted_undernutrition, 2),
            risk_level=risk_level,
            unusual_adverse_profile=is_anomalous,
            confidence_note="District-level prediction. Village-level data unavailable in training set.",
            feature_importance={k: round(v, 4) for k, v in feature_importance.items()},
            model_info={
                "test_r2": 0.833,
                "test_mae": 2.955,
                "training_rows": 706,
                "model_type": "RandomForest Regressor"
            }
        )
    
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Input error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/explain/district", response_model=ExplanationResponse)
async def explain_district_prediction(record: dict):
    """
    Explain what factors drive a district's risk prediction.
    
    Returns top contributing features by importance.
    """
    try:
        models = load_models()
        nutrition_model = models["nutrition"]["model"]
        nutrition_features = models["nutrition"]["features"]
        
        # Get feature importances
        importances = nutrition_model.named_steps["model"].feature_importances_
        
        # Sort by importance
        factor_importance = list(zip(nutrition_features, importances))
        factor_importance.sort(key=lambda x: x[1], reverse=True)
        
        top_factors = [
            {
                "factor": name,
                "importance_percent": round(imp * 100, 1),
                "interpretation": _interpret_factor(name)
            }
            for name, imp in factor_importance[:5]
        ]
        
        return ExplanationResponse(
            district_name=record.get("District Names", "Unknown"),
            top_contributing_factors=top_factors,
            model_details={
                "model_type": "Random Forest Regressor",
                "test_r2": 0.833,
                "target": "Children under 5 who are underweight (%)"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")


@app.get("/state-capacity/{state_name}")
async def get_state_capacity(state_name: str):
    """
    Get state capacity segmentation and infrastructure score.
    
    Returns: Capacity segment (critical/high/moderate/stronger gap),
    facility density, staffing metrics.
    """
    try:
        models = load_models()
        state_clusters = models["training_report"]["state_capacity_segmentation"]["clusters"]
        
        # Search for state (case-insensitive)
        for cluster in state_clusters:
            if cluster["State/UT"].lower() == state_name.lower():
                return {
                    "state": cluster["State/UT"],
                    "capacity_segment": cluster["capacity_segment"],
                    "interpretation": _interpret_capacity_segment(cluster["capacity_segment"])
                }
        
        raise HTTPException(status_code=404, detail=f"State {state_name} not found")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/predict/anomaly")
async def predict_anomaly(record: dict):
    """Run isolation forest anomaly detection on health profile."""
    try:
        models = load_models()
        anomaly_model = models["anomaly"]["model"]
        anomaly_features = models["anomaly"]["features"]
        X_anomaly = numeric_features(record, anomaly_features)
        
        is_anomalous = int(anomaly_model.predict(X_anomaly)[0]) == -1
        decision_score = float(anomaly_model.decision_function(X_anomaly)[0])
        
        return {
            "is_anomalous": is_anomalous,
            "anomaly_score": round(decision_score, 4),
            "severity": "CRITICAL" if (is_anomalous and decision_score < -0.1) else ("HIGH" if is_anomalous else "NORMAL"),
            "interpretation": "Adverse diverging profile across health indicators" if is_anomalous else "Profile consistent with normative district patterns"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")


@app.post("/predict/birth-weight")
async def predict_birth_weight(record: dict):
    """Predict infant low birth weight risk from maternal indicators."""
    try:
        models = load_models()
        bw = models["birth_weight"]
        model = bw["model"]
        feature_columns = bw["feature_columns"]
        threshold = bw["low_birth_weight_threshold"]
        
        frame = pd.DataFrame([record])
        for col in feature_columns:
            if col not in frame.columns:
                frame[col] = 0
        X = frame[feature_columns]
        
        low_idx = bw["target_classes"].index("Low") if "Low" in bw["target_classes"] else 0
        prob_low = float(model.predict_proba(X)[0][low_idx])
        is_low = prob_low >= threshold
        
        return {
            "predicted_category": "Low" if is_low else "Normal",
            "low_birth_weight_probability": round(prob_low, 4),
            "decision_threshold": threshold,
            "risk_flag": is_low
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Birth weight prediction error: {str(e)}")


# ============================================================================
# Helper Functions
# ============================================================================

def _interpret_factor(factor_name: str) -> str:
    """Provide human-readable interpretation of factor."""
    interpretations = {
        "BMI": "Maternal nutrition status - strong predictor of child undernutrition",
        "wasted": "Acute malnutrition in children - direct indicator",
        "stunted": "Chronic malnutrition in children - long-term indicator",
        "sanitation": "Improved sanitation access - reduces disease burden",
        "water": "Access to clean water - reduces waterborne diseases",
        "vaccination": "Immunization coverage - prevents vaccine-preventable illness",
        "institutional births": "Birth in health facility - enables better newborn care",
        "antenatal": "Maternal care during pregnancy - supports fetal development",
    }
    for key, value in interpretations.items():
        if key.lower() in factor_name.lower():
            return value
    return "Health indicator contributing to child undernutrition risk"


def _interpret_capacity_segment(segment: str) -> str:
    """Provide interpretation of state capacity segment."""
    interpretations = {
        "critical_capacity_gap": "Critical shortage of facilities and staffing - immediate resource allocation needed",
        "high_capacity_gap": "Significant infrastructure and staffing gaps - priority intervention zone",
        "moderate_capacity": "Moderate facility availability with some gaps - targeted strengthening needed",
        "stronger_capacity": "Stronger infrastructure and staffing - good foundation for service delivery",
    }
    return interpretations.get(segment, "Unknown capacity status")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
