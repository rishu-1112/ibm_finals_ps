const express = require('express');
const router = express.Router();

const {
  getLocations,
  getStates,
  getDistricts,
  getBlocks,
  getVillagesInLocation
} = require('../controllers/locationController');

const {
  getDashboardMetrics,
  getVillages,
  getVillageById,
  getPriorities,
  getTrends,
  getVillageGaps,
  getVillageInterventions
} = require('../controllers/healthRecordController');

const { getRecommendations } = require('../controllers/recommendationController');
const { getRiskPredictions } = require('../controllers/aiController');
const { getRiskMap } = require('../controllers/mlController');
const mlRoutes = require('./mlRoutes');

// ============================================================================
// 1. LOCATION APIs
// ============================================================================
router.get('/locations/states', getStates);
router.get('/locations/districts', getDistricts);
router.get('/locations/blocks', getBlocks);
router.get('/locations/villages', getVillagesInLocation);
router.get('/locations', getLocations); // Backwards-compatibility

// ============================================================================
// 2. DISTRICT DASHBOARD API
// ============================================================================
router.get('/dashboard/district/:districtId', getDashboardMetrics);
router.get('/dashboard', getDashboardMetrics); // Backwards-compatibility

// ============================================================================
// 3. VILLAGE APIs
// ============================================================================
router.get('/villages', getVillages);
router.get('/villages/:villageId/trends', getTrends);
router.get('/villages/:villageId/recommendations', getRecommendations);
router.get('/villages/:villageId/gaps', getVillageGaps);
router.get('/villages/:villageId/interventions', getVillageInterventions);
router.get('/villages/:villageId', getVillageById);

// ============================================================================
// 4. PRIORITY RANKING & RECOMMENDATIONS
// ============================================================================
router.get('/priorities', getPriorities);
router.get('/recommendations', getRecommendations);

// ============================================================================
// 5. TRENDS & RISK PREDICTIONS
// ============================================================================
router.get('/trends', getTrends);
router.get('/risk-predictions', getRiskPredictions);

// ============================================================================
// 6. RISK MAP API
// ============================================================================
router.get('/map/risk', getRiskMap);

// ============================================================================
// 7. ML SERVICE ROUTES
// ============================================================================
router.use('/ml', mlRoutes);

module.exports = router;
