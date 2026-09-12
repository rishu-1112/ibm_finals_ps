/**
 * Healthcare Effectiveness & Intelligence Analytics Engine
 * 
 * Implements the GramSwasthya AI PRD models:
 * 1. Healthcare Effectiveness Score (4 Pillars: Infrastructure, Service Availability, Utilization, Health Outcomes)
 * 2. Hidden Healthcare Gap Analysis (Adequate Infrastructure + Poor Effectiveness = Hidden Gap)
 * 3. Multi-factor Priority Ranking (Risk, Gap, Population, Service Deficiency, Urgency)
 * 4. Actionable Gap-to-Intervention Recommendation Engine
 */

/**
 * 4-Pillar Healthcare Effectiveness Score (HES)
 * 
 * Weights are explainable:
 * - Infrastructure: 20%
 * - Service Availability: 25%
 * - Utilization: 30%
 * - Health Outcomes: 25%
 */
function calculateHES(scores) {
  const infra = Number(scores.infrastructure ?? scores.infrastructureScore ?? 0);
  const service = Number(scores.serviceAvailability ?? scores.serviceAvailabilityScore ?? 0);
  const util = Number(scores.utilization ?? scores.utilizationScore ?? 0);
  const outcome = Number(scores.healthOutcome ?? scores.healthOutcomeScore ?? 0);

  const hes = Math.round(
    (0.20 * infra) +
    (0.25 * service) +
    (0.30 * util) +
    (0.25 * outcome)
  );

  return {
    infrastructureScore: infra,
    serviceAvailabilityScore: service,
    utilizationScore: util,
    healthOutcomeScore: outcome,
    healthcareEffectivenessScore: hes
  };
}

/**
 * Healthcare Gap Analysis
 * Insight: adequate infrastructure + poor effectiveness = hidden healthcare gap.
 */
function calculateHealthcareGap(infrastructureScore, hesScore, explicitTopGap = null, majorGaps = []) {
  const gapScore = Math.max(0, infrastructureScore - hesScore);
  
  let gapLevel = 'LOW';
  if (gapScore >= 30) {
    gapLevel = 'CRITICAL';
  } else if (gapScore >= 20) {
    gapLevel = 'HIGH';
  } else if (gapScore >= 10) {
    gapLevel = 'MODERATE';
  }

  let mainGap = explicitTopGap;
  if (!mainGap && majorGaps && majorGaps.length > 0) {
    mainGap = majorGaps[0].title || majorGaps[0].name;
  }
  if (!mainGap) {
    mainGap = gapScore >= 20 ? 'Hidden Healthcare Delivery Gap' : 'Balanced Service Delivery';
  }

  return {
    healthcareGapScore: gapScore,
    gapLevel,
    mainGap,
    isGapHidden: gapScore >= 20 && infrastructureScore >= 65
  };
}

/**
 * Map numeric risk score to standardized PRD Risk Band
 */
function mapRiskLevel(score) {
  const s = Number(score) || 0;
  if (s >= 75) return 'CRITICAL';
  if (s >= 60) return 'HIGH';
  if (s >= 40) return 'MODERATE';
  return 'LOW';
}

/**
 * Multi-factor Priority Ranking
 * Combines:
 * - Risk Score (40%)
 * - Healthcare Gap Score (30%)
 * - Service Deficiency (100 - ServiceAvailability) (15%)
 * - Population Impact (15%)
 */
function calculatePriorityRanking(villagesList) {
  if (!Array.isArray(villagesList) || villagesList.length === 0) {
    return [];
  }

  const scoredVillages = villagesList.map(v => {
    const hesObj = calculateHES(v.scores || {});
    const gapObj = calculateHealthcareGap(
      hesObj.infrastructureScore,
      hesObj.healthcareEffectivenessScore,
      v.topGap,
      v.majorGaps
    );

    const riskScore = Number(v.riskScore) || 0;
    const serviceDeficiency = Math.max(0, 100 - (hesObj.serviceAvailabilityScore || 50));
    const populationFactor = Math.min(100, Math.round(((v.population || 3000) / 6000) * 100));

    const compositeScore = Math.round(
      (0.40 * riskScore) +
      (0.30 * gapObj.healthcareGapScore) +
      (0.15 * serviceDeficiency) +
      (0.15 * populationFactor)
    );

    let priorityLevel = 'MODERATE';
    let urgency = 'Routine (Within 30 Days)';
    if (compositeScore >= 70 || v.riskLevel === 'Critical' || v.riskLevel === 'CRITICAL') {
      priorityLevel = 'CRITICAL';
      urgency = 'Immediate (Within 7 Days)';
    } else if (compositeScore >= 55 || v.riskLevel === 'High' || v.riskLevel === 'HIGH') {
      priorityLevel = 'HIGH';
      urgency = 'Urgent (Within 14 Days)';
    } else if (compositeScore < 40) {
      priorityLevel = 'LOW';
      urgency = 'Maintenance / Monitoring';
    }

    return {
      villageId: v.id,
      village: v.name,
      id: v.id,
      name: v.name,
      district: v.districtName,
      districtId: v.districtId,
      districtName: v.districtName,
      block: v.block,
      population: v.population || null,
      riskScore,
      riskLevel: v.riskLevel || mapRiskLevel(riskScore),
      healthcareGap: gapObj.healthcareGapScore,
      mainGap: gapObj.mainGap,
      topGap: gapObj.mainGap,
      priority: priorityLevel,
      priorityScore: compositeScore,
      urgency
    };
  });

  // Sort descending by composite priority score
  scoredVillages.sort((a, b) => b.priorityScore - a.priorityScore);

  // Assign ranks
  return scoredVillages.map((item, index) => ({
    rank: index + 1,
    ...item
  }));
}

/**
 * Generate PRD recommendations based on detected healthcare gaps
 */
function generateRecommendations(village) {
  const recommendations = [];
  const hes = calculateHES(village.scores || {});
  const gap = calculateHealthcareGap(hes.infrastructureScore, hes.healthcareEffectivenessScore, village.topGap, village.majorGaps);

  // Check topGap or majorGaps or indicators
  const allGapText = `${village.topGap || ''} ${JSON.stringify(village.majorGaps || [])} ${village.aiExplanation || ''}`.toLowerCase();

  // 1. Immunization Gap
  if (allGapText.includes('immunization') || allGapText.includes('vaccin') || hes.utilizationScore < 40) {
    recommendations.push({
      intervention: 'Special Cold-Chain & Immunization Outreach Camp',
      identifiedGap: 'Low Immunization Coverage',
      reason: 'Infant immunization dropout detected below district benchmark; outreach with mobile ice-lined cooling is required.',
      priority: (village.riskLevel === 'Critical' || village.riskLevel === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
      urgency: 'Within 7-10 Days'
    });
  }

  // 2. Malnutrition Gap
  if (allGapText.includes('malnutrition') || allGapText.includes('underweight') || allGapText.includes('stunted') || allGapText.includes('nutrition')) {
    recommendations.push({
      intervention: 'POSHAN Intensive Nutrition & Take-Home Ration Fortification',
      identifiedGap: 'Elevated Child Malnutrition Risk',
      reason: 'Acute/moderate undernutrition detected among children under 5; immediate supplemental Anganwadi feeding required.',
      priority: 'CRITICAL',
      urgency: 'Within 7 Days'
    });
  }

  // 3. Medicine Shortage
  if (allGapText.includes('medicine') || allGapText.includes('stockout') || hes.serviceAvailabilityScore < 50) {
    recommendations.push({
      intervention: 'Emergency Drug Replenishment & Buffer Stock Dispatch',
      identifiedGap: 'Essential Medicine Stockouts',
      reason: 'Critical shortages of IFA tablets, ORS packets, and basic antibiotics identified at local health sub-centre.',
      priority: 'HIGH',
      urgency: 'Within 5 Days'
    });
  }

  // 4. Low PHC Utilization / High Infrastructure but low footfall
  if (allGapText.includes('utilization') || (hes.infrastructureScore >= 65 && hes.utilizationScore <= 45)) {
    recommendations.push({
      intervention: 'Mobile Medical Unit (MMU) & Community Confidence Outreach',
      identifiedGap: 'Depressed Healthcare Facility Footfall',
      reason: 'Physical primary infrastructure is present but village attendance remains abnormally low; mobile community outreach needed.',
      priority: 'HIGH',
      urgency: 'Within 14 Days'
    });
  }

  // 5. Maternal Care / Late ANC
  if (allGapText.includes('maternal') || allGapText.includes('anemia') || allGapText.includes('anc') || allGapText.includes('pregnancy')) {
    recommendations.push({
      intervention: 'Anemia Mukt Bharat Screening & Parenteral Iron Camp',
      identifiedGap: 'Maternal Anemia & Delayed 1st Trimester ANC',
      reason: 'Delayed antenatal checkup registrations lead to unmonitored high-risk pregnancies and severe maternal anemia.',
      priority: 'HIGH',
      urgency: 'Within 14 Days'
    });
  }

  // Fallback for model/healthy village
  if (recommendations.length === 0) {
    recommendations.push({
      intervention: 'ABDM Tele-consultation & Preventive Health Surveillance',
      identifiedGap: 'Sustained Primary Service Maintenance',
      reason: 'Village exhibits balanced healthcare effectiveness; maintain operational standards and expand digital ABHA record creation.',
      priority: 'LOW',
      urgency: 'Routine Monitoring'
    });
  }

  return recommendations;
}

module.exports = {
  calculateHES,
  calculateHealthcareGap,
  mapRiskLevel,
  calculatePriorityRanking,
  generateRecommendations
};
