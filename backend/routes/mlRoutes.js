const express = require('express');
const router = express.Router();

const {
  getMLServiceStatus,
  getVillageCompositeRisk,
  getVillageExplanation,
  getVillageAnomaly,
  getVillageCluster,
  getDistrictRiskPrediction,
  getDistrictExplanation,
  getRiskMap
} = require('../controllers/mlController');

// ML Service status
router.get('/status', getMLServiceStatus);

// Village-level ML intelligence
router.get('/village/:villageId/risk', getVillageCompositeRisk);
router.get('/village/:villageId/explanation', getVillageExplanation);
router.get('/village/:villageId/anomaly', getVillageAnomaly);
router.get('/village/:villageId/cluster', getVillageCluster);

// District-level predictions
router.get('/district/risk', getDistrictRiskPrediction);
router.get('/district/:districtId/risk', getDistrictRiskPrediction);
router.get('/district/:districtId/explanation', getDistrictExplanation);
router.get('/district/:districtId/summary', getDistrictRiskPrediction);

// Risk Map for spatial rendering
router.get('/villages/risk-map', getRiskMap);

module.exports = router;
