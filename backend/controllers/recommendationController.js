const { VILLAGES_DATABASE } = require('../services/gramSwasthyaData');

const getRecommendations = (req, res) => {
  try {
    const { villageId = 'VIL-CHANDIPUR' } = req.query;
    const village = VILLAGES_DATABASE.find(v => v.id === villageId) || VILLAGES_DATABASE[0];

    return res.status(200).json({
      success: true,
      villageId: village.id,
      villageName: village.name,
      recommendedInterventions: village.recommendedInterventions,
      whyRecommendations: village.whyRecommendations,
      interventions: village.interventions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations
};
