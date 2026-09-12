const express = require('express');
const router = express.Router();

const { getLocations } = require('../controllers/locationController');
const {
  getDashboardMetrics,
  getVillages,
  getVillageById,
  getPriorities,
  getTrends
} = require('../controllers/healthRecordController');
const { getRecommendations } = require('../controllers/recommendationController');
const { getRiskPredictions } = require('../controllers/aiController');

// Location hierarchy
router.get('/locations', getLocations);

// Dashboard summary
router.get('/dashboard', getDashboardMetrics);

// Village endpoints
router.get('/villages', getVillages);
router.get('/villages/:id', getVillageById);

// Risk predictions
router.get('/risk-predictions', getRiskPredictions);

// Recommendations
router.get('/recommendations', getRecommendations);

// Priority ranking
router.get('/priorities', getPriorities);

// Trends & Forecast
router.get('/trends', getTrends);

module.exports = router;
