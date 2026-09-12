const STATES = [
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

const DISTRICT_KPI_DATABASE = {
  'JH-RNC': {
    districtId: 'JH-RNC',
    districtName: 'Ranchi',
    stateName: 'Jharkhand',
    totalVillagesAnalyzed: 184,
    healthcareEffectiveness: 64,
    effectivenessLabel: 'District Average',
    highRiskVillagesCount: 18,
    highRiskTrend: '↑ 4 from previous period',
    criticalVillagesCount: 5,
    criticalLabel: 'Immediate attention',
    healthcareGapsCount: 37,
    gapsLabel: 'Across analyzed villages',
    lastAnalyzed: 'September 2026'
  },
  'JH-WSB': {
    districtId: 'JH-WSB',
    districtName: 'West Singhbhum',
    stateName: 'Jharkhand',
    totalVillagesAnalyzed: 142,
    healthcareEffectiveness: 58,
    effectivenessLabel: 'District Average',
    highRiskVillagesCount: 22,
    highRiskTrend: '↑ 6 from previous period',
    criticalVillagesCount: 8,
    criticalLabel: 'Immediate attention',
    healthcareGapsCount: 45,
    gapsLabel: 'Across analyzed villages',
    lastAnalyzed: 'September 2026'
  },
  'JH-KNT': {
    districtId: 'JH-KNT',
    districtName: 'Khunti',
    stateName: 'Jharkhand',
    totalVillagesAnalyzed: 96,
    healthcareEffectiveness: 61,
    effectivenessLabel: 'District Average',
    highRiskVillagesCount: 12,
    highRiskTrend: '↓ 2 from previous period',
    criticalVillagesCount: 3,
    criticalLabel: 'Immediate attention',
    healthcareGapsCount: 24,
    gapsLabel: 'Across analyzed villages',
    lastAnalyzed: 'September 2026'
  }
};

const VILLAGES_DATABASE = [
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
      hes: 42
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
    ],
    shapFactors: [
      { factor: 'Low Immunization Rate', impact: 38, type: 'negative' },
      { factor: 'ANC 4th Checkup Dropout', impact: 24, type: 'negative' },
      { factor: 'SAM/MAM Malnutrition Index', impact: 18, type: 'negative' },
      { factor: 'Distance to CHC Facility', impact: 12, type: 'negative' },
      { factor: 'Active ASHA Staffing', impact: 8, type: 'positive' }
    ],
    anomaly: {
      flagged: true,
      title: 'Immunization Dropout Spike',
      period: 'Last 60 Days',
      severity: 'Critical'
    },
    clusterArchetype: 'High Infrastructure / Severe Utilization Deficit',
    interventions: [
      {
        id: 'int-1',
        type: 'Maternal & Child Health',
        urgency: 'Immediate (Within 7 Days)',
        title: 'Immunization Micro-Plan & Special Cold-Chain Camp',
        estimatedCost: '₹45,000 / Village',
        projectedHesIncrease: '+14',
        rationale: 'Immunization drops from 75% to 63% in 3 quarters; ANM mobility support will recover dropouts.',
        steps: [
          'Deploy Mobile Medical Van to Chandipur sub-centre twice weekly.',
          'Conduct line-listing of un-vaccinated children under 2 years.',
          'Replenish vaccine stocks & check cold chain storage logs.'
        ]
      },
      {
        id: 'int-2',
        type: 'Nutrition Outreach',
        urgency: 'High (Within 14 Days)',
        title: 'POSHAN Intensive Nutrition Fortification',
        estimatedCost: '₹30,000 / Village',
        projectedHesIncrease: '+10',
        rationale: 'Child malnutrition currently stands at 18%, projected to hit 24% without intervention.',
        steps: [
          'Provide Take-Home Rations (THR) to SAM/MAM children.',
          'Conduct weekly weight measurement drive across 3 Anganwadis.'
        ]
      }
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
    ],
    shapFactors: [
      { factor: 'Cold Chain Failure', impact: 42, type: 'negative' },
      { factor: 'Maternal ANC Registration', impact: 28, type: 'negative' },
      { factor: 'Sub-Centre Proximity', impact: 15, type: 'positive' }
    ],
    anomaly: { flagged: false },
    clusterArchetype: 'Cold Chain & Vaccine Supply Bottleneck',
    interventions: [
      {
        id: 'int-r1',
        type: 'Supply Chain',
        urgency: 'High (Within 10 Days)',
        title: 'Solar Direct Drive Refrigerator Installation',
        estimatedCost: '₹60,000 / Centre',
        projectedHesIncrease: '+12',
        rationale: 'Fixes cold chain storage temperature fluctuations.',
        steps: ['Replace faulty ice-lined refrigerator with solar unit.', 'Recalibrate digital logger.']
      }
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
    ],
    shapFactors: [
      { factor: 'Essential Medicine Deficit', impact: 45, type: 'negative' }
    ],
    anomaly: { flagged: false },
    clusterArchetype: 'Medicine Supply Chain Bottleneck',
    interventions: [
      {
        id: 'int-l1',
        type: 'Pharmacy Stock',
        urgency: 'Immediate',
        title: 'Emergency Drug Replenishment Batch',
        estimatedCost: '₹20,000',
        projectedHesIncrease: '+8',
        rationale: 'Restores essential IFA, ORS, and antibiotic stocks.',
        steps: ['Dispatch emergency medicine kit from District Drug Store.']
      }
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
    ],
    shapFactors: [
      { factor: 'Low Community OPD Footfall', impact: 36, type: 'negative' }
    ],
    anomaly: { flagged: false },
    clusterArchetype: 'High Infrastructure / Depressed Confidence',
    interventions: [
      {
        id: 'int-d1',
        type: 'Community Engagement',
        urgency: 'Medium',
        title: 'Community Health Awareness Drive & MMU Camps',
        estimatedCost: '₹25,000',
        projectedHesIncrease: '+9',
        rationale: 'Builds public trust and awareness of operational PHC services.',
        steps: ['Organize village health assembly (VHSNC).', 'Schedule weekly health worker visits.']
      }
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
    whyRecommendations: ['61% pregnant women screened with hemoglobin below 10 g/dL.'],
    trends: [
      { period: 'Q1', malnutrition: 16, immunization: 80, utilization: 52 },
      { period: 'Q2', malnutrition: 18, immunization: 76, utilization: 48 },
      { period: 'Q3', malnutrition: 20, immunization: 72, utilization: 45 },
      { period: 'Q4 (AI Predicted)', malnutrition: 23, immunization: 68, utilization: 41, isPredicted: true }
    ],
    shapFactors: [{ factor: 'Maternal Hemoglobin Deficit', impact: 32, type: 'negative' }],
    anomaly: { flagged: false },
    clusterArchetype: 'Maternal Anemia Vulnerability',
    interventions: [
      {
        id: 'int-h1',
        type: 'Maternal Care',
        urgency: 'High',
        title: 'Anemia Mukt Bharat Targeted Screening & Parenteral Iron Camp',
        estimatedCost: '₹35,000',
        projectedHesIncrease: '+11',
        rationale: 'Early Hb screening prevents severe maternal complications.',
        steps: ['Conduct digital Hb screening using hemoglobinometer.', 'Distribute IV iron sucrose for severe anemia cases.']
      }
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
    whyRecommendations: ['Sustained high performance across all 4 healthcare pillars.'],
    trends: [
      { period: 'Q1', malnutrition: 6, immunization: 94, utilization: 82 },
      { period: 'Q2', malnutrition: 6, immunization: 95, utilization: 84 },
      { period: 'Q3', malnutrition: 5, immunization: 96, utilization: 85 },
      { period: 'Q4 (AI Predicted)', malnutrition: 5, immunization: 97, utilization: 86, isPredicted: true }
    ],
    shapFactors: [{ factor: 'High Vaccine Coverage', impact: 40, type: 'positive' }],
    anomaly: { flagged: false },
    clusterArchetype: 'Model High Performing Health Ecosystem',
    interventions: []
  }
];

const DISTRICT_HEALTH_GAPS = [
  { id: 'imm', name: 'Immunization', value: 63, target: 80, status: 'Below district target', statusType: 'warning' },
  { id: 'med', name: 'Medicine Availability', value: 58, target: 75, status: 'Below district target', statusType: 'warning' },
  { id: 'phc', name: 'PHC Utilization', value: 46, target: 70, status: 'Below district target', statusType: 'warning' },
  { id: 'nut', name: 'Nutrition Services', value: 52, target: 75, status: 'Below district target', statusType: 'warning' },
  { id: 'mat', name: 'Maternal Health Services', value: 71, target: 75, status: 'Improving', statusType: 'positive' }
];

const AI_RISK_PREDICTIONS = [
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

const INFRA_VS_EFFECTIVENESS_DATA = [
  { id: 'VIL-CHANDIPUR', name: 'Chandipur', infra: 78, hes: 42, zone: 'Hidden Healthcare Gaps', risk: 'Critical' },
  { id: 'VIL-RAMPUR', name: 'Rampur', infra: 74, hes: 46, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-LAKSHMI', name: 'Lakshmi Nagar', infra: 80, hes: 50, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-DEVGAON', name: 'Devgaon', infra: 75, hes: 52, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-HARIPUR', name: 'Haripur', infra: 70, hes: 55, zone: 'Hidden Healthcare Gaps', risk: 'High' },
  { id: 'VIL-NAMKUM-MODEL', name: 'Namkum Model', infra: 92, hes: 88, zone: 'Model Villages', risk: 'Low' }
];

const TREND_DATA_MAP = {
  'Malnutrition': [
    { quarter: 'Q1', value: 14, isPredicted: false },
    { quarter: 'Q2', value: 16, isPredicted: false },
    { quarter: 'Q3', value: 18, isPredicted: false },
    { quarter: 'Q4 (AI Predicted)', value: 24, isPredicted: true }
  ],
  'Immunization': [
    { quarter: 'Q1', value: 75, isPredicted: false },
    { quarter: 'Q2', value: 70, isPredicted: false },
    { quarter: 'Q3', value: 64, isPredicted: false },
    { quarter: 'Q4 (AI Predicted)', value: 58, isPredicted: true }
  ],
  'PHC Utilization': [
    { quarter: 'Q1', value: 52, isPredicted: false },
    { quarter: 'Q2', value: 48, isPredicted: false },
    { quarter: 'Q3', value: 42, isPredicted: false },
    { quarter: 'Q4 (AI Predicted)', value: 35, isPredicted: true }
  ],
  'Medicine Availability': [
    { quarter: 'Q1', value: 72, isPredicted: false },
    { quarter: 'Q2', value: 65, isPredicted: false },
    { quarter: 'Q3', value: 58, isPredicted: false },
    { quarter: 'Q4 (AI Predicted)', value: 50, isPredicted: true }
  ],
  'Maternal Health': [
    { quarter: 'Q1', value: 65, isPredicted: false },
    { quarter: 'Q2', value: 68, isPredicted: false },
    { quarter: 'Q3', value: 71, isPredicted: false },
    { quarter: 'Q4 (AI Predicted)', value: 74, isPredicted: true }
  ]
};

module.exports = {
  STATES,
  DISTRICT_KPI_DATABASE,
  VILLAGES_DATABASE,
  DISTRICT_HEALTH_GAPS,
  AI_RISK_PREDICTIONS,
  INFRA_VS_EFFECTIVENESS_DATA,
  TREND_DATA_MAP
};
