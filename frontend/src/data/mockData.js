// Government Data Source Metadata
export const DATA_SOURCES = [
  { id: 'RHS', name: 'Rural Health Statistics', status: 'Synced', lastUpdated: '2 hours ago' },
  { id: 'HMIS', name: 'Health Management Information System', status: 'Live Feed', lastUpdated: '10 mins ago' },
  { id: 'NFHS', name: 'NFHS / DLHS / AHS', status: 'Synced', lastUpdated: 'Yesterday' },
  { id: 'POSHAN', name: 'Anganwadi Data', status: 'Live Feed', lastUpdated: '5 mins ago' }
];

export const STATES = [
  {
    id: 'JH',
    name: 'Jharkhand',
    districts: [
      { id: 'JH-RNC', name: 'Ranchi' },
      { id: 'JH-WSB', name: 'West Singhbhum' },
      { id: 'JH-KNT', name: 'Khunti' }
    ]
  },
  {
    id: 'BR',
    name: 'Bihar',
    districts: [
      { id: 'BR-PTN', name: 'Patna' },
      { id: 'BR-GYA', name: 'Gaya' }
    ]
  },
  {
    id: 'OD',
    name: 'Odisha',
    districts: [
      { id: 'OD-KRP', name: 'Koraput' },
      { id: 'OD-MBJ', name: 'Mayurbhanj' }
    ]
  }
];

export const DISTRICT_OVERVIEW_KPI = {
  districtName: 'Ranchi District',
  stateName: 'Jharkhand',
  totalVillagesAnalyzed: 184,
  healthcareEffectiveness: 64, // out of 100
  effectivenessLabel: 'District Average',
  highRiskVillagesCount: 18,
  highRiskTrend: '↑ 4 from previous period',
  criticalVillagesCount: 5,
  criticalLabel: 'Immediate attention',
  healthcareGapsCount: 37,
  gapsLabel: 'Across analyzed villages',
  lastAnalyzed: 'September 2026'
};

export const VILLAGES_DATABASE = [
  {
    id: 'VIL-CHANDIPUR',
    name: 'Chandipur',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Kanke',
    lat: 23.435,
    lng: 85.321,
    population: 3420,
    under5Count: 412,
    pregnantMothers: 68,
    riskScore: 82,
    riskLevel: 'Critical',
    topGap: 'Low immunization',
    aiExplanation: 'Chandipur has adequate healthcare infrastructure but low service utilization, declining immunization coverage, and increasing malnutrition risk.',
    scores: {
      infrastructure: 78,
      serviceAvailability: 51,
      utilization: 34,
      healthOutcome: 43,
      hes: 42 // Overall Healthcare Effectiveness Score
    },
    infrastructureDetails: {
      phc: 'Kanke PHC Available',
      doctors: '2 Doctors On Duty',
      subCentre: 'Sub-Centre Operational',
      anganwadi: '3 Anganwadi Centres'
    },
    majorGaps: [
      {
        id: 'gap-1',
        title: 'High Malnutrition Risk',
        severity: 'Critical',
        indicator: '18% current prevalence',
        desc: 'Child malnutrition is trending upward due to gaps in Anganwadi supplementary nutrition.'
      },
      {
        id: 'gap-2',
        title: 'Low Immunization',
        severity: 'Critical',
        indicator: '63% coverage',
        desc: 'Immunization coverage is significantly below the district target threshold of 80%.'
      },
      {
        id: 'gap-3',
        title: 'Low PHC Utilization',
        severity: 'High',
        indicator: '34% utilization',
        desc: 'PHC facilities are operational but local community attendance remains abnormally low.'
      },
      {
        id: 'gap-4',
        title: 'Medicine Availability',
        severity: 'High',
        indicator: '58% availability',
        desc: 'Essential medicine stockouts observed for critical iron supplements and vaccines.'
      }
    ],
    recommendedInterventions: [
      {
        num: '01',
        title: 'Nutrition Intervention',
        priority: 'Critical',
        reason: 'High malnutrition + low Anganwadi nutrition service coverage.',
        objective: 'Reduce child malnutrition risk.'
      },
      {
        num: '02',
        title: 'Immunization Outreach',
        priority: 'High',
        reason: 'Immunization coverage is significantly below target.',
        objective: 'Improve vaccination coverage.'
      },
      {
        num: '03',
        title: 'Medicine Replenishment',
        priority: 'High',
        reason: 'Essential medicine availability is declining.',
        objective: 'Improve service availability.'
      },
      {
        num: '04',
        title: 'Mobile Health Outreach',
        priority: 'Medium',
        reason: 'PHC infrastructure exists but utilization is low.',
        objective: 'Improve healthcare access and utilization.'
      }
    ],
    whyRecommendations: [
      'Historical health indicators show a 6% drop in immunization over the last 3 quarters.',
      'PHC infrastructure score is high (78%), but patient throughput remains at 34%.',
      'POSHAN Tracker feed flagged a 18% SAM/MAM rate among children under 5.',
      'Distance to CHC (12 km) combined with stockouts severely depresses utilization.'
    ],
    trends: [
      { period: 'Q1', malnutrition: 14, immunization: 75, utilization: 45 },
      { period: 'Q2', malnutrition: 16, immunization: 70, utilization: 40 },
      { period: 'Q3', malnutrition: 18, immunization: 63, utilization: 34 },
      { period: 'Q4 (AI Predicted)', malnutrition: 24, immunization: 58, utilization: 31, isPredicted: true }
    ]
  },
  {
    id: 'VIL-RAMPUR',
    name: 'Rampur',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Bundu',
    lat: 23.181,
    lng: 85.584,
    population: 4890,
    under5Count: 620,
    pregnantMothers: 94,
    riskScore: 78,
    riskLevel: 'High',
    topGap: 'Immunization',
    aiExplanation: 'Rampur suffers from severe immunization dropouts due to cold chain breakdown despite active ANM staff.',
    scores: {
      infrastructure: 74,
      serviceAvailability: 54,
      utilization: 38,
      healthOutcome: 45,
      hes: 46
    },
    infrastructureDetails: {
      phc: 'Bundu CHC (2 km)',
      doctors: '1 Doctor Present',
      subCentre: 'Bundu Sub-Centre #2',
      anganwadi: '4 Anganwadi Centres'
    },
    majorGaps: [
      {
        id: 'gap-r1',
        title: 'Low Immunization Coverage',
        severity: 'Critical',
        indicator: '58% coverage',
        desc: 'Routine infant immunization missed due to temperature fluctuation in cold chain storage.'
      },
      {
        id: 'gap-r2',
        title: 'Underutilized Maternal Services',
        severity: 'High',
        indicator: '42% ANC completion',
        desc: 'Sub-optimal ANC registration in 2nd and 3rd trimesters.'
      }
    ],
    recommendedInterventions: [
      {
        num: '01',
        title: 'Immunization Outreach & Cold Chain Repair',
        priority: 'High',
        reason: 'Immunization coverage is significantly below target.',
        objective: 'Improve vaccination coverage.'
      },
      {
        num: '02',
        title: 'Maternal Care Awareness Drive',
        priority: 'High',
        reason: 'ANC registrations down by 22%.',
        objective: 'Increase early pregnancy registrations.'
      }
    ],
    whyRecommendations: [
      'HMIS reports indicate 42% dropout between 1st and 3rd Pentavalent dose.',
      'Cold chain temperature recorded at 9.2°C over 5 consecutive days.'
    ],
    trends: [
      { period: 'Q1', malnutrition: 15, immunization: 70, utilization: 48 },
      { period: 'Q2', malnutrition: 17, immunization: 65, utilization: 42 },
      { period: 'Q3', malnutrition: 19, immunization: 58, utilization: 38 },
      { period: 'Q4 (AI Predicted)', malnutrition: 22, immunization: 52, utilization: 35, isPredicted: true }
    ]
  },
  {
    id: 'VIL-LAKSHMI',
    name: 'Lakshmi Nagar',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Angara',
    lat: 23.364,
    lng: 85.523,
    population: 2850,
    under5Count: 340,
    pregnantMothers: 52,
    riskScore: 74,
    riskLevel: 'High',
    topGap: 'Medicine',
    aiExplanation: 'Lakshmi Nagar experiences critical stockouts of essential maternal medicines despite having a well-equipped Sub-Centre.',
    scores: {
      infrastructure: 80,
      serviceAvailability: 46,
      utilization: 42,
      healthOutcome: 48,
      hes: 50
    },
    infrastructureDetails: {
      phc: 'Angara Sub-Centre (0.5 km)',
      doctors: '1 Medical Officer',
      subCentre: 'Angara Gram Sub-Centre',
      anganwadi: '3 Anganwadi Centres'
    },
    majorGaps: [
      {
        id: 'gap-l1',
        title: 'Medicine Stockouts',
        severity: 'Critical',
        indicator: '42% drug availability',
        desc: 'IFA tablets and paracetamol out of stock for over 45 consecutive days.'
      }
    ],
    recommendedInterventions: [
      {
        num: '01',
        title: 'Medicine Replenishment Drive',
        priority: 'High',
        reason: 'Essential medicine availability is declining.',
        objective: 'Improve service availability.'
      }
    ],
    whyRecommendations: [
      'High facility infrastructure score (80%) undermined by persistent supply chain delays.'
    ],
    trends: [
      { period: 'Q1', malnutrition: 12, immunization: 78, utilization: 50 },
      { period: 'Q2', malnutrition: 14, immunization: 74, utilization: 46 },
      { period: 'Q3', malnutrition: 16, immunization: 71, utilization: 42 },
      { period: 'Q4 (AI Predicted)', malnutrition: 18, immunization: 68, utilization: 39, isPredicted: true }
    ]
  },
  {
    id: 'VIL-DEVGAON',
    name: 'Devgaon',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Namkum',
    lat: 23.328,
    lng: 85.385,
    population: 3900,
    under5Count: 480,
    pregnantMothers: 71,
    riskScore: 71,
    riskLevel: 'High',
    topGap: 'Utilization',
    aiExplanation: 'Devgaon exhibits a strong infrastructure base but low patient confidence leading to depressed PHC footfall.',
    scores: {
      infrastructure: 75,
      serviceAvailability: 58,
      utilization: 36,
      healthOutcome: 52,
      hes: 52
    },
    infrastructureDetails: {
      phc: 'Namkum CHC (1.5 km)',
      doctors: '2 Doctors Present',
      subCentre: 'Namkum Sub-Centre',
      anganwadi: '4 Anganwadi Centres'
    },
    majorGaps: [
      {
        id: 'gap-d1',
        title: 'Low PHC Utilization',
        severity: 'High',
        indicator: '36% OPD footfall',
        desc: 'Villagers traveling 14 km to private clinics due to perceived doctor absence.'
      }
    ],
    recommendedInterventions: [
      {
        num: '01',
        title: 'Mobile Health & Community Outreach',
        priority: 'High',
        reason: 'PHC infrastructure exists but utilization is low.',
        objective: 'Improve healthcare access and utilization.'
      }
    ],
    whyRecommendations: [
      'Discrepancy between high infrastructure availability (75%) and low footfall (36%).'
    ],
    trends: [
      { period: 'Q1', malnutrition: 11, immunization: 82, utilization: 48 },
      { period: 'Q2', malnutrition: 13, immunization: 78, utilization: 42 },
      { period: 'Q3', malnutrition: 15, immunization: 74, utilization: 36 },
      { period: 'Q4 (AI Predicted)', malnutrition: 17, immunization: 70, utilization: 33, isPredicted: true }
    ]
  },
  {
    id: 'VIL-HARIPUR',
    name: 'Haripur',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Ratu',
    lat: 23.402,
    lng: 85.195,
    population: 3100,
    under5Count: 390,
    pregnantMothers: 64,
    riskScore: 68,
    riskLevel: 'High',
    topGap: 'Maternal Health',
    aiExplanation: 'Haripur shows high maternal anemia prevalence and delayed antenatal consultations.',
    scores: {
      infrastructure: 70,
      serviceAvailability: 60,
      utilization: 45,
      healthOutcome: 50,
      hes: 55
    },
    infrastructureDetails: {
      phc: 'Ratu PHC (3 km)',
      doctors: '1 Doctor Present',
      subCentre: 'Ratu Sub-Centre',
      anganwadi: '3 Anganwadi Centres'
    },
    majorGaps: [
      {
        id: 'gap-h1',
        title: 'Maternal Anemia & Late ANC',
        severity: 'High',
        indicator: '61% pregnant women anemic',
        desc: 'Delayed 1st trimester registrations lead to unmonitored high-risk pregnancies.'
      }
    ],
    recommendedInterventions: [
      {
        num: '01',
        title: 'Maternal Nutrition & IFA Campaign',
        priority: 'High',
        reason: 'High anemia rates in expectant mothers.',
        objective: 'Reduce maternal health risk factors.'
      }
    ],
    whyRecommendations: [
      '61% pregnant women screened with hemoglobin below 10 g/dL.'
    ],
    trends: [
      { period: 'Q1', malnutrition: 16, immunization: 80, utilization: 52 },
      { period: 'Q2', malnutrition: 18, immunization: 76, utilization: 48 },
      { period: 'Q3', malnutrition: 20, immunization: 72, utilization: 45 },
      { period: 'Q4 (AI Predicted)', malnutrition: 23, immunization: 68, utilization: 41, isPredicted: true }
    ]
  },
  {
    id: 'VIL-KANKE-BASTI',
    name: 'Kanke Basti',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Kanke',
    lat: 23.448,
    lng: 85.335,
    population: 4100,
    under5Count: 510,
    pregnantMothers: 75,
    riskScore: 65,
    riskLevel: 'High',
    topGap: 'Doctor Absenteeism',
    aiExplanation: 'Sub-Centre experiences frequent doctor absenteeism causing patient redirection.',
    scores: {
      infrastructure: 72,
      serviceAvailability: 52,
      utilization: 40,
      healthOutcome: 54,
      hes: 56
    },
    infrastructureDetails: {
      phc: 'Kanke Main PHC',
      doctors: '1/2 Doctor Present',
      subCentre: 'Basti Sub-Centre',
      anganwadi: '4 Anganwadi Centres'
    },
    majorGaps: [
      {
        id: 'gap-kb1',
        title: 'Doctor Absenteeism',
        severity: 'High',
        indicator: '52% staff attendance',
        desc: 'Unannounced provider absence causes drop in outpatient visits.'
      }
    ],
    recommendedInterventions: [
      {
        num: '01',
        title: 'Telemedicine & Provider Deputation',
        priority: 'High',
        reason: 'Operational gaps due to staffing shortages.',
        objective: 'Restore clinical consultation access.'
      }
    ],
    whyRecommendations: [
      'Staff rosters reveal 48% deficit in scheduled duty shifts.'
    ],
    trends: [
      { period: 'Q1', malnutrition: 13, immunization: 82, utilization: 50 },
      { period: 'Q2', malnutrition: 15, immunization: 78, utilization: 45 },
      { period: 'Q3', malnutrition: 17, immunization: 73, utilization: 40 },
      { period: 'Q4 (AI Predicted)', malnutrition: 20, immunization: 68, utilization: 36, isPredicted: true }
    ]
  },
  {
    id: 'VIL-NAMKUM-MODEL',
    name: 'Namkum Model Village',
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateId: 'JH',
    stateName: 'Jharkhand',
    block: 'Namkum',
    lat: 23.340,
    lng: 85.400,
    population: 5200,
    under5Count: 610,
    pregnantMothers: 90,
    riskScore: 18,
    riskLevel: 'Low',
    topGap: 'None',
    aiExplanation: 'Model village with 90%+ immunization, full medical staffing, and optimal healthcare outcomes.',
    scores: {
      infrastructure: 92,
      serviceAvailability: 88,
      utilization: 84,
      healthOutcome: 89,
      hes: 88
    },
    infrastructureDetails: {
      phc: 'Namkum CHC (0.2 km)',
      doctors: '3 Doctors Present',
      subCentre: 'Urban Sub-Centre',
      anganwadi: '5 Anganwadi Centres'
    },
    majorGaps: [],
    recommendedInterventions: [
      {
        num: '01',
        title: 'ABDM Tele-consultation Upgrade',
        priority: 'Low',
        reason: 'Maintain model status and expand digital health coverage.',
        objective: 'Achieve 100% ABHA digital record creation.'
      }
    ],
    whyRecommendations: [
      'Sustained high performance across all 4 healthcare pillars.'
    ],
    trends: [
      { period: 'Q1', malnutrition: 6, immunization: 94, utilization: 82 },
      { period: 'Q2', malnutrition: 6, immunization: 95, utilization: 84 },
      { period: 'Q3', malnutrition: 5, immunization: 96, utilization: 85 },
      { period: 'Q4 (AI Predicted)', malnutrition: 5, immunization: 97, utilization: 86, isPredicted: true }
    ]
  }
];

// District Health Breakdown Indicators (Progress Bars)
export const DISTRICT_HEALTH_GAPS = [
  { id: 'imm', name: 'Immunization', value: 63, target: 80, status: 'Below district target', statusType: 'warning' },
  { id: 'med', name: 'Medicine Availability', value: 58, target: 75, status: 'Below district target', statusType: 'warning' },
  { id: 'phc', name: 'PHC Utilization', value: 46, target: 70, status: 'Below district target', statusType: 'warning' },
  { id: 'nut', name: 'Nutrition Services', value: 52, target: 75, status: 'Below district target', statusType: 'warning' },
  { id: 'mat', name: 'Maternal Health Services', value: 71, target: 75, status: 'Improving', statusType: 'positive' }
];

// AI Early Warning Signals (Prediction Cards)
export const AI_RISK_PREDICTIONS = [
  {
    id: 'pred-1',
    category: 'Child Malnutrition',
    current: '18%',
    predicted: '24%',
    trend: '↑ Increasing',
    trendDirection: 'up',
    risk: 'High',
    riskLevel: 'High',
    detail: 'POSHAN tracker data indicates seasonal food security deficit leading to predicted 6% jump in acute malnutrition.'
  },
  {
    id: 'pred-2',
    category: 'Immunization Coverage',
    current: '64%',
    predicted: '58%',
    trend: '↓ Declining',
    trendDirection: 'down',
    risk: 'High',
    riskLevel: 'High',
    detail: 'Cold chain inventory lapses and ANM outreach delays projected to reduce 3rd-dose infant vaccination rates.'
  },
  {
    id: 'pred-3',
    category: 'PHC Utilization',
    current: '42%',
    predicted: '35%',
    trend: '↓ Declining',
    trendDirection: 'down',
    risk: 'Moderate',
    riskLevel: 'Moderate',
    detail: 'Doctor transfer rosters and stockouts projected to reduce public health centre patient visits by 7%.'
  }
];

// Scatter plot data for "Infrastructure vs Healthcare Effectiveness"
export const INFRA_VS_EFFECTIVENESS_DATA = [
  { id: 'VIL-CHANDIPUR', name: 'Chandipur', infra: 78, hes: 42, zone: 'Hidden Healthcare Gaps', risk: 'Critical' },
  { id: 'VIL-RAMPUR', name: 'Rampur', infra: 74, hes: 46, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-LAKSHMI', name: 'Lakshmi Nagar', infra: 80, hes: 50, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-DEVGAON', name: 'Devgaon', infra: 75, hes: 52, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-HARIPUR', name: 'Haripur', infra: 70, hes: 55, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-KANKE-BASTI', name: 'Kanke Basti', infra: 72, hes: 56, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-7', name: 'Sitapur', infra: 76, hes: 48, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  // Other zones
  { id: 'VIL-NAMKUM-MODEL', name: 'Namkum Model', infra: 92, hes: 88, zone: 'Model Villages', risk: 'Low' },
  { id: 'VIL-MODEL-2', name: 'Ormanjhi Central', infra: 88, hes: 82, zone: 'Model Villages', risk: 'Low' },
  { id: 'VIL-DEV-1', name: 'Tupudana', infra: 38, hes: 72, zone: 'Developing', risk: 'Moderate' },
  { id: 'VIL-GAP-1', name: 'Sonahatu Remote', infra: 28, hes: 30, zone: 'Infrastructure Gap', risk: 'Critical' },
  { id: 'VIL-GAP-2', name: 'Silli Tribal Tola', infra: 32, hes: 34, zone: 'Infrastructure Gap', risk: 'High' }
];

export function getDistrictMetrics(districtId) {
  const villages = VILLAGES_DATABASE.filter(v => v.districtId === districtId || !districtId);
  return {
    overview: DISTRICT_OVERVIEW_KPI,
    villages,
    gaps: DISTRICT_HEALTH_GAPS,
    predictions: AI_RISK_PREDICTIONS,
    infraVsHes: INFRA_VS_EFFECTIVENESS_DATA
  };
}
