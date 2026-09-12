const { VILLAGES_DATABASE } = require('../services/gramSwasthyaData');
const { generateRecommendations } = require('../services/analyticsEngine');

/**
 * GET /api/villages/:villageId/recommendations and GET /api/recommendations
 * Generates gap-driven interventions for a village
 */
const getRecommendations = (req, res) => {
  try {
    const villageIdParam = req.params.villageId || req.params.id || req.query.villageId || 'VIL-CHANDIPUR';
    const village = VILLAGES_DATABASE.find(v => v.id.toLowerCase() === villageIdParam.toLowerCase()) || VILLAGES_DATABASE[0];

    if (!village) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VILLAGE_NOT_FOUND',
          message: `Village with ID '${villageIdParam}' not found`
        }
      });
    }

    // Generate dynamic interventions from detected gaps using analyticsEngine
    const recommendations = generateRecommendations(village);

    return res.status(200).json({
      success: true,
      villageId: village.id,
      villageName: village.name,
      data: recommendations,
      // Backwards-compatibility fields for existing frontend AIInterventionEngine:
      recommendedInterventions: village.recommendedInterventions || [],
      whyRecommendations: village.whyRecommendations || [],
      interventions: village.interventions || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'RECOMMENDATIONS_ERROR',
        message: 'Failed to generate recommendations',
        details: error.message
      }
    });
  }
};

module.exports = {
  getRecommendations
};
