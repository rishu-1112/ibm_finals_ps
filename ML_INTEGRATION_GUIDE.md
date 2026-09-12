# GramSwasthya ML Integration Guide

**Version**: 1.0  
**Date**: September 2026  
**Status**: ML artifacts loaded, FastAPI service created, Backend API endpoints created

---

## 📊 ML System Overview

This integration connects existing trained ML models to the GramSwasthya AI dashboard WITHOUT retraining or modifying the models.

### Architecture
```
┌─ Trained ML Artifacts ────────────┐
│  (sklearn, RandomForest, etc.)    │
├─────────────────────────────────┤
│  ml/app.py (FastAPI Service)     │  → Port 8000
├─────────────────────────────────┤
│  backend/services/mlService.js   │
│  backend/controllers/mlController│  → Port 5000
├─────────────────────────────────┤
│  React Frontend                   │  → Port 5173
│  (Dashboard, Maps, Reports)       │
└─────────────────────────────────┘
```

---

## 🎯 ML Models Discovered

### 1. District Undernutrition Regressor
- **Type**: RandomForest Regressor (Pipeline)
- **Training Data**: 706 NFHS district records
- **Target**: Children under 5 who are underweight (%)
- **Features**: 10 health indicators (sanitation, water, vaccination, nutrition, etc.)
- **Performance**: R² = 0.833, MAE = 2.955%
- **Output**: Predicted undernutrition percentage (float)

**Feature Importance (Top 3)**:
1. Women with below-normal BMI: 43.4%
2. Children wasted: 28.06%
3. Children stunted: 22.31%

### 2. District Anomaly Detector
- **Type**: IsolationForest (Pipeline)
- **Purpose**: Flag unusual adverse health profiles
- **Features**: All 10 nutrition predictors + target
- **Output**: 1 (normal) or -1 (anomalous)

### 3. State Capacity Segmentation
- **Type**: K-Means Clustering (4 clusters)
- **Training Data**: 35 Indian states/UTs
- **Features**: Infrastructure/staffing metrics per 100k rural population
- **Segments**:
  - `critical_capacity_gap` - Critical resource shortage
  - `high_capacity_gap` - Significant infrastructure gaps
  - `moderate_capacity` - Moderate facility availability
  - `stronger_capacity` - Strong infrastructure

**Jharkhand**: Classified as `high_capacity_gap`

### 4. Birth Weight Classifier
- **Type**: RandomForest Classifier (Pipeline)
- **Training Data**: 200 individual records
- **Classes**: Low, Normal
- **Threshold**: 0.15 (optimized for recall)

---

## 🔴 CRITICAL LIMITATION (From ML README)

**No village-level outcome data exists in the dataset.**

- Models trained on **DISTRICT-level** data only
- RHS data at **STATE level**
- Birth weight model at **INDIVIDUAL level**

### What This Means:
✅ Can predict district undernutrition risk  
✅ Can detect anomalies at district level  
✅ Can segment states by capacity  
❌ Cannot make direct village-level predictions without village outcome data

### Recommendation:
1. Use **local infrastructure/service scores** for village-level calculations
2. Use **district model as contextual reference** (district-level risk alert)
3. Mark village predictions as **"Insufficient historical data"** in dashboard
4. Future: Collect village-level outcome data for time-series modeling

---

## 🚀 Getting Started

### Prerequisites
```bash
# Python 3.8+
python3 --version

# Node.js 16+
node --version
npm --version
```

### Step 1: Setup ML Environment
```bash
cd /Users/rishukumari/HealthBridge_rural

# Create virtual environment
python3 -m venv ml_venv
source ml_venv/bin/activate

# Install dependencies
pip install -r ml/requirements.txt
pip install fastapi uvicorn  # For the API service
```

### Step 2: Start ML Service (Terminal 1)
```bash
source ml_venv/bin/activate
cd ml
python app.py
```
Expected output:
```
Loading ML artifacts...
✓ All models loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start Backend API (Terminal 2)
```bash
cd backend
ML_SERVICE_URL=http://localhost:8000 npm run dev
```

### Step 4: Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```

---

## 📡 API Endpoints

### ML Service (FastAPI, Port 8000)

**Health & Info**
```
GET /health                    → Service status
GET /info                      → Loaded models and endpoints
```

**Predictions**
```
POST /predict/district-risk    → District undernutrition prediction
  Input: { district_name, state, ...NFHS fields }
  Output: {
    predicted_child_undernutrition_percent: 40.04,
    risk_level: "HIGH",
    unusual_adverse_profile: false,
    feature_importance: {...},
    model_info: {...}
  }
```

**Explanations**
```
POST /explain/district         → Feature importance explanation
GET  /state-capacity/{state}   → State capacity segment
```

### Backend API (Node/Express, Port 5000)

**ML Service Status**
```
GET /api/ml/status
```
Response:
```json
{
  "mlServiceAvailable": true,
  "mlEnabled": true,
  "features": [...],
  "limitation": "Models trained on district/state level..."
}
```

**District Analysis**
```
GET /api/ml/district/:districtId/summary
  → Risk distribution, effectiveness metrics, priority villages

GET /api/ml/district/risk?districtId=JH-RNC
  → District-level risk context
```

**Village Analysis**
```
GET /api/ml/village/:villageId/risk
  → Composite risk with infrastructure + ML context

GET /api/ml/village/:villageId/explanation
  → Contributing factors, gaps, anomalies
```

**Spatial Data (Maps)**
```
GET /api/ml/villages/risk-map?districtId=JH-RNC
  → All villages with coordinates and risk levels
  → Used for Leaflet map markers
```

---

## 🧪 Testing

### Test 1: ML Service Health
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok", "service": "GramSwasthya ML"}
```

### Test 2: Load Models
```bash
curl http://localhost:8000/info
# Expected: List of loaded models
```

### Test 3: Predict District Risk (Real Data)
```bash
# Get Ranchi NFHS data and predict
curl -X POST http://localhost:8000/predict/district-risk \
  -H "Content-Type: application/json" \
  -d @/tmp/ranchi_record.json
```

Expected output:
```json
{
  "district_name": "Ranchi",
  "state": "Jharkhand",
  "predicted_child_undernutrition_percent": 40.04,
  "risk_level": "HIGH",
  "unusual_adverse_profile": false,
  "feature_importance": {
    "Women BMI below normal": 0.434,
    "Children wasted": 0.2806,
    "Children stunted": 0.2231,
    ...
  }
}
```

### Test 4: Backend API
```bash
# Check ML service is connected
curl http://localhost:5000/api/ml/status

# Get all villages with risk levels
curl http://localhost:5000/api/ml/villages/risk-map

# Get specific village analysis
curl http://localhost:5000/api/ml/village/VIL-CHANDIPUR/risk
```

### Test 5: Dashboard Integration
Navigate to `http://localhost:5173` and verify:
- [ ] District selection populates ML risk data
- [ ] Village list shows actual risk scores (not mock)
- [ ] Map markers color by risk level (green/yellow/orange/red)
- [ ] Village detail panel shows healthcare effectiveness scores
- [ ] SHAP factors displayed as contributing factors

---

## 📁 Integration Code Structure

### New Files Created

**ML Service Layer (Python)**
```
ml/app.py                          FastAPI inference service
```

**Backend Integration (Node.js)**
```
backend/services/mlService.js      Bridge to Python ML service
backend/controllers/mlController.js ML-based API handlers
backend/routes/mlRoutes.js         ML endpoints routing
```

### Modified Files

**Backend**
```
backend/routes/apiRoutes.js        Added ML routes
```

---

## 🔌 Integration Points

### 1. Data Flow: Districts
```
NFHS Dataset → Extract district record → Send to ML Service
                                      ↓
                                 Predict risk
                                      ↓
                                 Backend caches
                                      ↓
                                 Frontend displays
```

### 2. Data Flow: Villages
```
Local Infrastructure Data → Calculate scores (infrastructure, utilization, etc.)
                                      ↓
                                 Add district risk as context
                                      ↓
                                 Backend returns composite
                                      ↓
                                 Frontend displays with caveat
                                 "Village data from local indicators"
```

### 3. Data Consistency
- **Village IDs**: Stable across dataset → inference → backend → frontend
- **District IDs**: Map to NFHS names during lookup
- **State Names**: Normalized (see `normalized_state_name` in train_models.py)

---

## 📊 Dashboard Components Connected

### Risk Map
- Fetches: `GET /api/ml/villages/risk-map?districtId=...`
- Displays: Markers with risk colors (LOW/MODERATE/HIGH/CRITICAL)
- Click marker → Opens village intelligence

### District Dashboard
- Aggregates: `GET /api/ml/district/:id/summary`
- Shows: Risk distribution, effectiveness, priority villages

### Village Intelligence
- Fetches: `GET /api/ml/village/:id/risk` + `GET /api/ml/village/:id/explanation`
- Displays:
  - Risk score & level
  - Healthcare effectiveness breakdown
  - Top contributing factors (SHAP-like)
  - Anomaly flags
  - Recommended interventions

### Healthcare Gaps
- Uses: `majorGaps` from village data
- Connects: To intervention recommendations

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
ML_SERVICE_URL=http://localhost:8000
ML_ENABLED=true
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### ML Service won't start
```bash
# Check Python environment
python3 -c "import joblib; print('✓ joblib OK')"
python3 -c "import fastapi; print('✓ fastapi OK')"

# Check artifacts exist
ls ml/artifacts/
```

### Backend can't connect to ML Service
```bash
# Test connectivity
curl http://localhost:8000/health

# Check backend logs for errors
# Ensure ML_SERVICE_URL is set correctly
```

### Model version warnings
```
InconsistentVersionWarning: Trying to unpickle estimator...
```
This is expected - sklearn versions differ. Models still work but may need retraining for production.

---

## 📈 Performance Notes

- **Model Loading**: ~2-3 seconds on startup (happens once)
- **Inference Time**: ~10-100ms per district prediction
- **Caching**: 5-minute TTL on ML predictions (configurable)
- **Batch Processing**: Future optimization for multiple districts

---

## 🔮 Future Enhancements

1. **Village-Level Data Collection**
   - Implement village outcome tracking (immunization %, malnutrition %, service utilization)
   - Retrain models at village level with time-series data
   - Enable true village-level predictions

2. **Real-Time Updates**
   - Stream HMIS/POSHAN data to update village metrics
   - Continuous anomaly detection

3. **Advanced Explanations**
   - SHAP values for individual predictions
   - Counterfactual explanations ("If immunization was 85%, risk would be...")
   - Feature interaction analysis

4. **Model Versioning**
   - Multiple model versions for A/B testing
   - Automatic retraining pipeline

5. **ML Operations**
   - Model monitoring dashboard
   - Performance tracking
   - Drift detection

---

## 📚 References

- **ML Training**: [ml/train_models.py](ml/train_models.py)
- **ML Inference**: [ml/predict.py](ml/predict.py)
- **Training Report**: [ml/artifacts/training_report.json](ml/artifacts/training_report.json)
- **Datasets**: [datasets/](datasets/) (NFHS, RHS, birth weight)

---

## ✅ Integration Checklist

- [x] ML artifacts loaded and tested
- [x] FastAPI service created
- [x] Backend ML handlers created
- [x] API routes configured
- [x] CORS enabled for cross-origin
- [x] Error handling implemented
- [x] Caching configured (5 min TTL)
- [x] Environment variables documented
- [ ] Frontend connected to new endpoints
- [ ] Dashboard validated with real predictions
- [ ] Performance tested
- [ ] Production deployment ready

---

**Last Updated**: September 2026  
**Maintained By**: GramSwasthya AI Team
