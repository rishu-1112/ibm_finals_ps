const {
  STATES,
  DISTRICT_KPI_DATABASE,
  VILLAGES_DATABASE,
  DISTRICT_HEALTH_GAPS,
  INFRA_VS_EFFECTIVENESS_DATA,
  TREND_DATA_MAP
} = require('../services/gramSwasthyaData');
const {
  calculateHES,
  calculateHealthcareGap,
  calculatePriorityRanking,
  generateRecommendations,
  mapRiskLevel
} = require('../services/analyticsEngine');
const {
  getStateRHSRecord,
  getStateAreaCoverage,
  getDistrictNFHSRecord,
  parseCleanNumber
} = require('../services/datasetLoader');

/**
 * Helper to build rich PRD village profile
 */
function buildVillageProfile(village, rankInfo = null) {
  const hes = calculateHES(village.scores || {});
  const gap = calculateHealthcareGap(
    hes.infrastructureScore,
    hes.healthcareEffectivenessScore,
    village.topGap,
    village.majorGaps
  );
  const recommendations = generateRecommendations(village);

  const priorityData = rankInfo || {
    rank: 1,
    priority: village.riskLevel === 'Critical' ? 'CRITICAL' : village.riskLevel === 'High' ? 'HIGH' : 'MODERATE',
    urgency: village.riskLevel === 'Critical' ? 'Immediate (Within 7 Days)' : 'Within 14 Days'
  };

  const contributingFactors = (village.shapFactors || []).map(sf => ({
    factor: sf.factor,
    contribution: sf.impact,
    direction: sf.type || 'negative',
    interpretation: `${sf.factor} contributing to overall rural health vulnerability.`
  }));

  // PRD Structured Village Profile
  return {
    // 1. Core Village Identity
    village: {
      id: village.id,
      name: village.name,
      population: village.population || null,
      under5Count: village.under5Count || null,
      pregnantMothers: village.pregnantMothers || null
    },

    // 2. Geographic Granularity
    location: {
      state: village.stateName,
      stateId: village.stateId,
      district: village.districtName,
      districtId: village.districtId,
      block: village.block,
      coordinates: {
        latitude: village.lat,
        longitude: village.lng
      }
    },

    // 3. Infrastructure Component
    infrastructure: {
      phcFacility: village.infrastructureDetails?.phc || 'PHC Accessible',
      doctorsOnDuty: village.infrastructureDetails?.doctors || 'Staffed',
      subCentreStatus: village.infrastructureDetails?.subCentre || 'Operational Sub-Centre',
      anganwadiCentres: village.infrastructureDetails?.anganwadi || 'Operational Anganwadi',
      score: hes.infrastructureScore
    },

    // 4. Services Component
    services: {
      medicineAvailabilityPercent: village.scores?.serviceAvailability || 50,
      coldChainStatus: village.anomaly?.flagged ? 'Cold Chain Lapses Flagged' : 'Functional',
      diagnosticAvailability: 'Essential Maternal & Child Diagnostics',
      score: hes.serviceAvailabilityScore
    },

    // 5. Utilization Component
    utilization: {
      opdFootfallPercent: village.scores?.utilization || 40,
      ancCoveragePercent: Math.min(100, (village.scores?.utilization || 40) + 8),
      institutionalDeliveriesPercent: 72,
      score: hes.utilizationScore
    },

    // 6. Health Outcomes Component
    healthOutcomes: {
      childMalnutritionRate: village.trends?.[2]?.malnutrition || 18,
      immunizationCoverageRate: village.trends?.[2]?.immunization || 63,
      maternalAnemiaPrevalence: 58,
      score: hes.healthOutcomeScore
    },

    // 7. Healthcare Effectiveness Score (HES)
    healthcareEffectiveness: hes,

    // 8. Healthcare Gap Analysis
    healthcareGap: {
      healthcareGapScore: gap.healthcareGapScore,
      gapLevel: gap.gapLevel,
      mainGap: gap.mainGap,
      isGapHidden: gap.isGapHidden,
      majorGaps: village.majorGaps || []
    },

    // 9. Risk Prediction
    risk: {
      riskScore: village.riskScore,
      riskLevel: village.riskLevel?.toUpperCase() || mapRiskLevel(village.riskScore),
      predictedRisk: village.trends?.[3]?.malnutrition || 24.0,
      contributingFactors
    },

    // 10. Historical & Forecast Trends
    trends: village.trends || [],

    // 11. Recommendations
    recommendations: recommendations.map(r => ({
      intervention: r.intervention,
      identifiedGap: r.identifiedGap,
      reason: r.reason,
      priority: r.priority,
      urgency: r.urgency
    })),

    // 12. Priority Ranking Info
    priority: {
      rank: priorityData.rank,
      priority: priorityData.priority,
      urgency: priorityData.urgency
    },

    // Top-level backwards compatibility fields for existing frontend components:
    id: village.id,
    name: village.name,
    districtId: village.districtId,
    districtName: village.districtName,
    stateId: village.stateId,
    stateName: village.stateName,
    block: village.block,
    lat: village.lat,
    lng: village.lng,
    population: village.population,
    under5Count: village.under5Count,
    pregnantMothers: village.pregnantMothers,
    riskScore: village.riskScore,
    riskLevel: village.riskLevel,
    topGap: gap.mainGap,
    aiExplanation: village.aiExplanation,
    scores: {
      infrastructure: hes.infrastructureScore,
      serviceAvailability: hes.serviceAvailabilityScore,
      utilization: hes.utilizationScore,
      healthOutcome: hes.healthOutcomeScore,
      hes: hes.healthcareEffectivenessScore
    },
    infrastructureDetails: village.infrastructureDetails,
    majorGaps: village.majorGaps,
    recommendedInterventions: village.recommendedInterventions,
    whyRecommendations: village.whyRecommendations,
    shapFactors: village.shapFactors,
    anomaly: village.anomaly,
    clusterArchetype: village.clusterArchetype,
    interventions: village.interventions
  };
}

/**
 * GET /api/dashboard/district/:districtId and GET /api/dashboard
 * Calculates dashboard metrics dynamically from actual datasets & ML pipeline
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const districtIdParam = req.params.districtId || req.query.districtId || 'JH-RNC';
    const blockFilter = req.query.block;

    // 1. Identify district metadata
    let districtName = 'Ranchi';
    let stateName = 'Jharkhand';
    let stateId = 'JH';

    for (const state of STATES) {
      const match = state.districts.find(d => d.id.toLowerCase() === districtIdParam.toLowerCase());
      if (match) {
        districtName = match.name;
        stateName = state.name;
        stateId = state.id;
        break;
      }
    }

    // 2. Fetch RHS facility & coverage records for this state
    const rhsRecord = getStateRHSRecord(stateName);
    const areaRecord = getStateAreaCoverage(stateName);

    // 3. Filter surveillance villages for this district
    let districtVillages = VILLAGES_DATABASE.filter(v =>
      v.districtId.toLowerCase() === districtIdParam.toLowerCase() ||
      v.districtName.toLowerCase() === districtName.toLowerCase()
    );

    if (districtVillages.length === 0) {
      districtVillages = VILLAGES_DATABASE; // Fallback to available surveillance records
    }

    let filteredVillages = [...districtVillages];
    if (blockFilter && blockFilter !== 'ALL') {
      filteredVillages = filteredVillages.filter(v => v.block.toLowerCase() === blockFilter.toLowerCase());
    }

    // 4. Calculate dynamic effectiveness & risk metrics
    const scoredVillages = filteredVillages.map(v => {
      const hes = calculateHES(v.scores || {});
      return {
        ...v,
        computedHES: hes.healthcareEffectivenessScore
      };
    });

    const averageHES = scoredVillages.length > 0
      ? Math.round(scoredVillages.reduce((sum, v) => sum + v.computedHES, 0) / scoredVillages.length)
      : 60;

    const highRiskVillages = scoredVillages.filter(v =>
      v.riskLevel === 'High' || v.riskLevel === 'HIGH' || (v.riskScore >= 60 && v.riskScore < 75)
    ).length;

    const criticalVillages = scoredVillages.filter(v =>
      v.riskLevel === 'Critical' || v.riskLevel === 'CRITICAL' || v.riskScore >= 75
    ).length;

    // 5. Calculate Priority Ranking for District
    const rankedVillages = calculatePriorityRanking(districtVillages);
    const topPriorityVillages = rankedVillages.slice(0, 5).map(v => ({
      rank: v.rank,
      village: v.name,
      villageId: v.id,
      riskScore: v.riskScore,
      riskLevel: v.riskLevel,
      healthcareGap: v.healthcareGap,
      mainGap: v.mainGap,
      priority: v.priority
    }));

    // 6. Dynamic Top Healthcare Gaps
    const topHealthcareGaps = DISTRICT_HEALTH_GAPS.map(gap => {
      let measuredVal = gap.value;
      if (gap.id === 'imm') {
        const avgImm = Math.round(scoredVillages.reduce((s, v) => s + (v.trends?.[2]?.immunization || 65), 0) / scoredVillages.length);
        measuredVal = avgImm;
      } else if (gap.id === 'phc') {
        const avgUtil = Math.round(scoredVillages.reduce((s, v) => s + (v.scores?.utilization || 40), 0) / scoredVillages.length);
        measuredVal = avgUtil;
      }
      return {
        ...gap,
        value: measuredVal,
        gapSize: Math.max(0, gap.target - measuredVal)
      };
    });

    // 7. Dynamic Trend Data
    const trends = Object.entries(TREND_DATA_MAP).map(([indicator, series]) => ({
      indicator,
      series
    }));

    // Construct PRD response structure
    const prdData = {
      district: {
        id: districtIdParam,
        name: districtName,
        state: stateName,
        stateId
      },
      totalVillages: areaRecord?.numberOfVillages || 184,
      totalFacilities: rhsRecord?.totalFacilities || 4310,
      totalPHCs: rhsRecord?.phcs || 291,
      totalSubCentres: rhsRecord?.subCentres || 3848,
      averageHealthcareEffectiveness: averageHES,
      highRiskVillages,
      criticalVillages,
      topPriorityVillages,
      topHealthcareGaps,
      trends,

      // Backwards-compatible structure for existing OverviewDashboard frontend:
      overview: {
        districtId: districtIdParam,
        districtName,
        stateName,
        totalVillagesAnalyzed: areaRecord?.numberOfVillages || 184,
        healthcareEffectiveness: averageHES,
        effectivenessLabel: 'District Average',
        highRiskVillagesCount: highRiskVillages,
        highRiskTrend: 'Active Surveillance',
        criticalVillagesCount: criticalVillages,
        criticalLabel: 'Immediate attention',
        healthcareGapsCount: topHealthcareGaps.length,
        gapsLabel: 'Across analyzed villages',
        lastAnalyzed: 'September 2026'
      },
      gaps: topHealthcareGaps,
      infraVsHes: INFRA_VS_EFFECTIVENESS_DATA,
      villagesCount: filteredVillages.length
    };

    return res.status(200).json({
      success: true,
      data: prdData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_METRICS_ERROR',
        message: 'Failed to compute district dashboard metrics',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/villages
 * Returns filtered list of villages
 */
const getVillages = (req, res) => {
  try {
    const { districtId, block, riskFilter = 'ALL', search = '' } = req.query;

    let villages = VILLAGES_DATABASE.filter(v => {
      const matchDistrict = !districtId || v.districtId.toLowerCase() === districtId.toLowerCase();
      const matchBlock = !block || block === 'ALL' || v.block.toLowerCase() === block.toLowerCase();
      const matchRisk = riskFilter === 'ALL' || v.riskLevel.toUpperCase() === riskFilter.toUpperCase();
      const matchSearch = !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.block.toLowerCase().includes(search.toLowerCase()) ||
        v.topGap.toLowerCase().includes(search.toLowerCase());

      return matchDistrict && matchBlock && matchRisk && matchSearch;
    });

    const ranked = calculatePriorityRanking(VILLAGES_DATABASE);
    const enrichedList = villages.map(v => {
      const r = ranked.find(rk => rk.id === v.id);
      return buildVillageProfile(v, r);
    });

    return res.status(200).json({
      success: true,
      count: enrichedList.length,
      data: enrichedList
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'VILLAGES_FETCH_ERROR',
        message: 'Failed to fetch villages',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/villages/:villageId
 * Returns complete PRD village profile
 */
const getVillageById = (req, res) => {
  try {
    const id = req.params.villageId || req.params.id;
    const village = VILLAGES_DATABASE.find(v => v.id.toLowerCase() === id.toLowerCase());

    if (!village) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VILLAGE_NOT_FOUND',
          message: `Village with ID '${id}' not found`
        }
      });
    }

    const ranked = calculatePriorityRanking(VILLAGES_DATABASE);
    const rankInfo = ranked.find(r => r.id === village.id);
    const profile = buildVillageProfile(village, rankInfo);

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'VILLAGE_PROFILE_ERROR',
        message: 'Failed to fetch village profile',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/priorities?district=
 * Returns prioritized ranking of villages based on PRD algorithm
 */
const getPriorities = (req, res) => {
  try {
    const { district, districtId, filter = 'ALL' } = req.query;
    const targetDistrict = district || districtId;

    let list = VILLAGES_DATABASE;
    if (targetDistrict) {
      list = list.filter(v =>
        v.districtId.toLowerCase() === targetDistrict.toLowerCase() ||
        v.districtName.toLowerCase() === targetDistrict.toLowerCase()
      );
    }

    let ranked = calculatePriorityRanking(list);

    if (filter && filter !== 'ALL') {
      ranked = ranked.filter(v => v.riskLevel.toUpperCase() === filter.toUpperCase());
    }

    return res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'PRIORITIES_FETCH_ERROR',
        message: 'Failed to compute priority rankings',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/villages/:villageId/trends and GET /api/trends
 * Returns historical values for available indicators
 */
const getTrends = (req, res) => {
  try {
    const { villageId, id } = req.params;
    const targetVillageId = villageId || id || req.query.villageId;

    if (targetVillageId) {
      const village = VILLAGES_DATABASE.find(v => v.id.toLowerCase() === targetVillageId.toLowerCase());
      if (!village) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'VILLAGE_NOT_FOUND',
            message: `Village with ID '${targetVillageId}' not found`
          }
        });
      }

      // Return historical and forecast quarterly trends across available indicators
      const trendsByIndicator = {
        immunization: village.trends.map(t => ({
          period: t.period,
          value: t.immunization,
          unit: '%',
          isPredicted: !!t.isPredicted
        })),
        malnutrition: village.trends.map(t => ({
          period: t.period,
          value: t.malnutrition,
          unit: '%',
          isPredicted: !!t.isPredicted
        })),
        healthcareUtilization: village.trends.map(t => ({
          period: t.period,
          value: t.utilization,
          unit: '%',
          isPredicted: !!t.isPredicted
        })),
        serviceAvailability: village.trends.map(t => ({
          period: t.period,
          value: Math.max(30, 80 - (t.malnutrition * 2)),
          unit: '%',
          isPredicted: !!t.isPredicted
        })),
        maternalHealth: village.trends.map(t => ({
          period: t.period,
          value: Math.min(85, 50 + (t.utilization * 0.4)),
          unit: '%',
          isPredicted: !!t.isPredicted
        }))
      };

      return res.status(200).json({
        success: true,
        villageId: village.id,
        villageName: village.name,
        data: trendsByIndicator
      });
    }

    // Default global indicator trends for backwards compatibility with TrendsAndForecast.jsx
    const { indicator = 'Malnutrition' } = req.query;
    const trendData = TREND_DATA_MAP[indicator] || TREND_DATA_MAP['Malnutrition'];

    return res.status(200).json({
      success: true,
      indicator,
      data: trendData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TRENDS_FETCH_ERROR',
        message: 'Failed to fetch health trends',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/villages/:villageId/gaps
 * Returns gap analysis for a specific village
 */
const getVillageGaps = (req, res) => {
  try {
    const id = req.params.villageId || req.params.id;
    const village = VILLAGES_DATABASE.find(v => v.id.toLowerCase() === id.toLowerCase());

    if (!village) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VILLAGE_NOT_FOUND',
          message: `Village with ID '${id}' not found`
        }
      });
    }

    const hes = calculateHES(village.scores || {});
    const gap = calculateHealthcareGap(hes.infrastructureScore, hes.healthcareEffectivenessScore, village.topGap, village.majorGaps);

    return res.status(200).json({
      success: true,
      data: {
        villageId: village.id,
        villageName: village.name,
        healthcareGapScore: gap.healthcareGapScore,
        gapLevel: gap.gapLevel,
        mainGap: gap.mainGap,
        isGapHidden: gap.isGapHidden,
        majorGaps: village.majorGaps || [],
        pillarScores: {
          infrastructure: hes.infrastructureScore,
          serviceAvailability: hes.serviceAvailabilityScore,
          utilization: hes.utilizationScore,
          healthOutcome: hes.healthOutcomeScore,
          hes: hes.healthcareEffectivenessScore
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'VILLAGE_GAPS_ERROR',
        message: 'Failed to fetch village gap analysis',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/villages/:villageId/interventions
 * Returns actionable clinical & supply interventions for a village
 */
const getVillageInterventions = (req, res) => {
  try {
    const id = req.params.villageId || req.params.id;
    const village = VILLAGES_DATABASE.find(v => v.id.toLowerCase() === id.toLowerCase());

    if (!village) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VILLAGE_NOT_FOUND',
          message: `Village with ID '${id}' not found`
        }
      });
    }

    const recommendations = generateRecommendations(village);

    return res.status(200).json({
      success: true,
      data: {
        villageId: village.id,
        villageName: village.name,
        interventions: village.interventions || [],
        recommendedInterventions: village.recommendedInterventions || [],
        whyRecommendations: village.whyRecommendations || [],
        generatedRecommendations: recommendations
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'VILLAGE_INTERVENTIONS_ERROR',
        message: 'Failed to fetch village interventions',
        details: error.message
      }
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getVillages,
  getVillageById,
  getPriorities,
  getTrends,
  getVillageGaps,
  getVillageInterventions,
  buildVillageProfile
};
