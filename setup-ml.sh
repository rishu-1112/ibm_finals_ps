#!/bin/bash
# GramSwasthya ML Integration - Setup & Run Script

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ML_VENV="$PROJECT_ROOT/ml_venv"
ML_PORT=${ML_PORT:-8000}
BACKEND_PORT=${BACKEND_PORT:-5000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo "🏥 GramSwasthya ML Integration Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if venv exists
if [ ! -d "$ML_VENV" ]; then
    echo -e "${BLUE}📦 Creating Python virtual environment...${NC}"
    python3 -m venv "$ML_VENV"
    source "$ML_VENV/bin/activate"
    pip install -q -r ml/requirements.txt
    pip install -q fastapi uvicorn
    echo -e "${GREEN}✓ Virtual environment ready${NC}"
else
    source "$ML_VENV/bin/activate"
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
fi

echo ""
echo -e "${BLUE}📋 Available commands:${NC}"
echo ""
echo -e "${GREEN}  1. Start ML Service:${NC}"
echo "     source ml_venv/bin/activate && python ml/app.py"
echo ""
echo -e "${GREEN}  2. Start Backend (in another terminal):${NC}"
echo "     cd backend && ML_SERVICE_URL=http://localhost:8000 npm run dev"
echo ""
echo -e "${GREEN}  3. Start Frontend (in another terminal):${NC}"
echo "     cd frontend && npm run dev"
echo ""
echo -e "${YELLOW}ℹ️  ML Service will run on http://localhost:${ML_PORT}${NC}"
echo -e "${YELLOW}ℹ️  Backend API will run on http://localhost:${BACKEND_PORT}${NC}"
echo -e "${YELLOW}ℹ️  Frontend will run on http://localhost:${FRONTEND_PORT}${NC}"
echo ""
echo -e "${BLUE}🧪 Test ML Service (after starting):${NC}"
echo ""
echo "  curl http://localhost:${ML_PORT}/health"
echo "  curl http://localhost:${ML_PORT}/info"
echo ""
echo -e "${BLUE}🧪 Test Backend (after starting):${NC}"
echo ""
echo "  curl http://localhost:${BACKEND_PORT}/api/ml/status"
echo "  curl http://localhost:${BACKEND_PORT}/api/villages"
echo "  curl http://localhost:${BACKEND_PORT}/api/ml/villages/risk-map"
echo ""
echo -e "${BLUE}📖 ML Integration Documentation:${NC}"
echo ""
echo "  - ML Models: ml/train_models.py, ml/predict.py"
echo "  - ML Service: ml/app.py (FastAPI)"
echo "  - Backend Integration: backend/services/mlService.js"
echo "  - ML Controllers: backend/controllers/mlController.js"
echo "  - ML Routes: backend/routes/mlRoutes.js"
echo ""
echo -e "${GREEN}Ready to start! 🚀${NC}"
echo ""
