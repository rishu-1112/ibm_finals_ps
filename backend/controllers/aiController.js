const { AI_RISK_PREDICTIONS, VILLAGES_DATABASE } = require('../services/gramSwasthyaData');

const getRiskPredictions = (req, res) => {
  try {
    const { villageId } = req.query;
    let selectedVillage = null;
    if (villageId) {
      selectedVillage = VILLAGES_DATABASE.find(v => v.id === villageId);
    }

    return res.status(200).json({
      success: true,
      earlyWarnings: AI_RISK_PREDICTIONS,
      villagePrediction: selectedVillage ? {
        villageId: selectedVillage.id,
        villageName: selectedVillage.name,
        riskScore: selectedVillage.riskScore,
        riskLevel: selectedVillage.riskLevel,
        aiExplanation: selectedVillage.aiExplanation,
        shapFactors: selectedVillage.shapFactors,
        anomaly: selectedVillage.anomaly,
        clusterArchetype: selectedVillage.clusterArchetype
      } : null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AI risk predictions',
      error: error.message
    });
  }
};

module.exports = {
  getRiskPredictions
};
