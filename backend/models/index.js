const mongoose = require('mongoose');

// 1. Location Schema
const locationSchema = new mongoose.Schema({
  stateId: { type: String, required: true },
  stateName: { type: String, required: true },
  districtId: { type: String, required: true },
  districtName: { type: String, required: true },
  blockName: { type: String, required: true },
  villageId: { type: String, required: true, unique: true },
  villageName: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  population: { type: Number, default: 0 },
  under5Count: { type: Number, default: 0 },
  pregnantMothers: { type: Number, default: 0 }
}, { timestamps: true });

// 2. Health Indicator Schema
const healthIndicatorSchema = new mongoose.Schema({
  entityId: { type: String, required: true }, // villageId or districtId
  granularity: { type: String, enum: ['VILLAGE', 'BLOCK', 'DISTRICT', 'STATE'], required: true },
  indicatorName: { type: String, required: true },
  category: { type: String, required: true },
  value: { type: Number, required: true },
  benchmarkTarget: { type: Number },
  unit: { type: String, default: '%' },
  period: { type: String, default: 'Latest' },
  isPredicted: { type: Boolean, default: false }
}, { timestamps: true });

// 3. Healthcare Facility Schema
const healthcareFacilitySchema = new mongoose.Schema({
  districtId: { type: String, required: true },
  blockName: { type: String },
  villageId: { type: String },
  facilityType: { type: String, enum: ['PHC', 'SUB_CENTRE', 'CHC', 'ANGANWADI'], required: true },
  facilityName: { type: String, required: true },
  operationalStatus: { type: String, default: 'Operational' },
  doctorsOnDuty: { type: Number, default: 0 },
  nursingStaff: { type: Number, default: 0 },
  hasColdChain: { type: Boolean, default: true },
  essentialMedicineAvailability: { type: Number, default: 0 } // percentage
}, { timestamps: true });

// 4. Village Analytics Schema (HES & Gaps)
const villageAnalyticsSchema = new mongoose.Schema({
  villageId: { type: String, required: true, unique: true },
  infrastructureScore: { type: Number, required: true },
  serviceAvailabilityScore: { type: Number, required: true },
  utilizationScore: { type: Number, required: true },
  healthOutcomeScore: { type: Number, required: true },
  healthcareEffectivenessScore: { type: Number, required: true },
  healthcareGapScore: { type: Number, required: true },
  topGap: { type: String, required: true },
  clusterArchetype: { type: String }
}, { timestamps: true });

// 5. Risk Prediction Schema
const riskPredictionSchema = new mongoose.Schema({
  villageId: { type: String, required: true },
  districtId: { type: String, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], required: true },
  predictedUndernutrition: { type: Number },
  isAnomalous: { type: Boolean, default: false },
  contributingFactors: [{
    factor: { type: String, required: true },
    contribution: { type: Number, required: true },
    direction: { type: String, enum: ['negative', 'positive'], required: true },
    interpretation: { type: String }
  }]
}, { timestamps: true });

// 6. Recommendation Schema
const recommendationSchema = new mongoose.Schema({
  villageId: { type: String, required: true },
  intervention: { type: String, required: true },
  identifiedGap: { type: String, required: true },
  reason: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], required: true },
  urgency: { type: String },
  estimatedCost: { type: String },
  actionSteps: [{ type: String }]
}, { timestamps: true });

// Exports
const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);
const HealthIndicator = mongoose.models.HealthIndicator || mongoose.model('HealthIndicator', healthIndicatorSchema);
const HealthcareFacility = mongoose.models.HealthcareFacility || mongoose.model('HealthcareFacility', healthcareFacilitySchema);
const VillageAnalytics = mongoose.models.VillageAnalytics || mongoose.model('VillageAnalytics', villageAnalyticsSchema);
const RiskPrediction = mongoose.models.RiskPrediction || mongoose.model('RiskPrediction', riskPredictionSchema);
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);

module.exports = {
  Location,
  HealthIndicator,
  HealthcareFacility,
  VillageAnalytics,
  RiskPrediction,
  Recommendation
};
