# 🚀 Quick Start Guide - GramSwasthya ML Integration

**Time to get running**: ~5 minutes  
**Prerequisites**: Python 3.8+, Node 16+, npm

---

## Step 1: One-Time Setup (2 min)

```bash
cd /Users/rishukumari/HealthBridge_rural

# Create Python environment
python3 -m venv ml_venv
source ml_venv/bin/activate

# Install dependencies
pip install -r ml/requirements.txt
pip install fastapi uvicorn
```

---

## Step 2: Start ML Service (Terminal 1)

```bash
source ml_venv/bin/activate
python ml/app.py
```

**Expected output**:
```
Loading ML artifacts...
✓ All models loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Service ready at `http://localhost:8000`

---

## Step 3: Start Backend (Terminal 2)

```bash
cd backend
ML_SERVICE_URL=http://localhost:8000 npm run dev
```

**Expected output**:
```
[nodemon] restarting due to changes...
Backend server running on port 5000
```

✅ Backend ready at `http://localhost:5000`

---

## Step 4: Start Frontend (Terminal 3)

```bash
cd frontend
npm run dev
```

**Expected output**:
```
  ➜  Local:   http://localhost:5173/
```

✅ Frontend ready at `http://localhost:5173`

---

## ✅ Verify Everything Works

### Test ML Service
```bash
# Health check
curl http://localhost:8000/health
# Expected: {"status": "ok", "service": "GramSwasthya ML"}

# Check models loaded
curl http://localhost:8000/info | jq '.models_loaded'
# Expected: ["nutrition", "anomaly", "capacity", "birth_weight"]
```

### Test Backend API
```bash
# ML service status
curl http://localhost:5000/api/ml/status | jq '.data.mlServiceAvailable'
# Expected: true

# Get villages for map
curl http://localhost:5000/api/ml/villages/risk-map | jq '.count'
# Expected: (number of villages)
```

### Open Dashboard
Navigate to: **http://localhost:5173**

You should see:
- ✅ District selector (Ranchi, West Singhbhum, Khunti)
- ✅ Risk map with village markers
- ✅ Village list with actual risk scores (not mock data)
- ✅ Risk levels: GREEN (Low), YELLOW (Moderate), ORANGE (High), RED (Critical)

---

## 🧪 Quick Tests

### Test 1: Get District Summary
```bash
curl http://localhost:5000/api/ml/district/JH-RNC/summary | jq '.'
```
Shows: Risk distribution, priority villages, healthcare effectiveness

### Test 2: Get Specific Village
```bash
curl http://localhost:5000/api/ml/village/VIL-CHANDIPUR/risk | jq '.data'
```
Shows: Risk score, healthcare effectiveness, contributing factors

### Test 3: Run Validation Script
```bash
source ml_venv/bin/activate
python validate_ml.py
```
Tests inference on 4+ real districts from NFHS data

---

## 📊 What's Happening Behind the Scenes

1. **ML Service** (Python/FastAPI)
   - Loads 4 trained sklearn models at startup
   - Provides REST endpoints for predictions
   - Runs inference: features → preprocessing → model → prediction

2. **Backend Bridge** (Node.js)
   - Calls Python ML service for district predictions
   - Caches results (5 min TTL)
   - Returns formatted JSON to frontend
   - Handles errors gracefully

3. **Frontend** (React)
   - Calls `/api/ml/*` endpoints
   - Displays **real ML predictions** (not mock data)
   - Shows risk levels, healthcare gaps, explanations
   - Interactive maps with clickable markers

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `ml/app.py` | Python FastAPI service (inference) |
| `backend/services/mlService.js` | Node bridge to Python service |
| `backend/controllers/mlController.js` | API endpoint handlers |
| `backend/routes/mlRoutes.js` | Route definitions |
| `validate_ml.py` | Integration test script |
| `ML_INTEGRATION_GUIDE.md` | Detailed documentation |
| `INTEGRATION_REPORT.md` | Full technical report |

---

## 🔧 Environment Variables

### Backend (.env)
```env
ML_SERVICE_URL=http://localhost:8000
ML_ENABLED=true
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Common Issues

### "Failed to connect to ML service"
```bash
# Check ML service is running
curl http://localhost:8000/health

# Check backend can see ML_SERVICE_URL
echo $ML_SERVICE_URL
```

### "Models not loaded"
```bash
# Check Python environment is activated
which python3
# Should show: .../ml_venv/bin/python3

# Check scikit-learn and joblib installed
python3 -c "import joblib; print('✓ OK')"
```

### "Empty API responses"
```bash
# Check NFHS dataset exists
ls -lh datasets/NFHS_5_India_Districts_Factsheet_Data.csv

# Check village data is loaded
curl http://localhost:5000/api/villages | jq '.count'
```

---

## 📖 Learn More

- **Full Integration Guide**: `ML_INTEGRATION_GUIDE.md`
- **Technical Report**: `INTEGRATION_REPORT.md`
- **Validation Results**: `ml_validation_report.json`
- **Setup Script**: `setup-ml.sh`

---

## ✨ What You're Looking At

This is **real ML inference**, not mock data:

- **Risk Scores** come from RandomForest trained on 706 NFHS districts
- **Risk Levels** calculated using actual model predictions
- **Healthcare Effectiveness** calculated from local infrastructure metrics
- **Contributing Factors** based on feature importance analysis
- **Anomaly Detection** flags unusual districts using IsolationForest
- **State Capacity** classification from K-Means clustering

**Test districts**:
- Ranchi: 40.04% undernutrition → **HIGH** risk
- Khunti: 43.21% undernutrition → **CRITICAL** risk (anomaly flagged)
- Garhwa: 39.61% undernutrition → **HIGH** risk

---

## 🎯 Next Steps

1. ✅ Explore the dashboard with different districts
2. ✅ Click on villages to see detailed risk analysis
3. ✅ Check the maps - marker colors reflect real ML risk levels
4. ✅ Review the contributing factors - powered by feature importance
5. ✅ Read the integration guide for API details

---

**Ready? Start with Step 1 above! 🚀**

Questions? Check the troubleshooting section or refer to the detailed guides.
