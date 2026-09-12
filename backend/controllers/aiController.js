const { AI_RISK_PREDICTIONS, VILLAGES_DATABASE } = require('../services/gramSwasthyaData');
const { calculateHES, calculateHealthcareGap, mapRiskLevel } = require('../services/analyticsEngine');

/**
 * GET /api/risk-predictions
 * Early warning signals and village prediction
 */
const getRiskPredictions = (req, res) => {
  try {
    const { villageId } = req.query;
    let selectedVillage = null;
    if (villageId) {
      selectedVillage = VILLAGES_DATABASE.find(v => v.id.toLowerCase() === villageId.toLowerCase());
    }

    let villageData = null;
    if (selectedVillage) {
      const hes = calculateHES(selectedVillage.scores || {});
      const gap = calculateHealthcareGap(hes.infrastructureScore, hes.healthcareEffectivenessScore, selectedVillage.topGap, selectedVillage.majorGaps);
      villageData = {
        villageId: selectedVillage.id,
        villageName: selectedVillage.name,
        riskScore: selectedVillage.riskScore,
        riskLevel: selectedVillage.riskLevel?.toUpperCase() || mapRiskLevel(selectedVillage.riskScore),
        aiExplanation: selectedVillage.aiExplanation,
        shapFactors: selectedVillage.shapFactors,
        anomaly: selectedVillage.anomaly,
        clusterArchetype: selectedVillage.clusterArchetype,
        healthcareEffectiveness: hes,
        healthcareGap: gap
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        earlyWarnings: AI_RISK_PREDICTIONS,
        villagePrediction: villageData
      },
      // Backwards-compatibility fields for OverviewDashboard.jsx:
      earlyWarnings: AI_RISK_PREDICTIONS,
      villagePrediction: villageData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'RISK_PREDICTIONS_ERROR',
        message: 'Failed to fetch AI risk predictions',
        details: error.message
      }
    });
  }
};

module.exports = {
  getRiskPredictions
};
