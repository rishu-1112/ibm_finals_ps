require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const {
  Location,
  HealthIndicator,
  HealthcareFacility,
  VillageAnalytics,
  RiskPrediction,
  Recommendation
} = require('../models/index');

const {
  STATES,
  VILLAGES_DATABASE
} = require('../services/gramSwasthyaData');

const {
  loadDatasets,
  parseCleanNumber
} = require('../services/datasetLoader');

const {
  calculateHES,
  calculateHealthcareGap,
  generateRecommendations
} = require('../services/analyticsEngine');

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/healthbridge';
  console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] MongoDB connection established.');

    // 1. Seed Locations
    console.log('[Seed] Seeding Locations...');
    let locationCount = 0;

    // Seed pilot surveillance villages
    for (const v of VILLAGES_DATABASE) {
      await Location.findOneAndUpdate(
        { villageId: v.id },
        {
          stateId: v.stateId,
          stateName: v.stateName,
          districtId: v.districtId,
          districtName: v.districtName,
          blockName: v.block,
          villageId: v.id,
          villageName: v.name,
          coordinates: {
            latitude: v.lat,
            longitude: v.lng
          },
          population: v.population || 0,
          under5Count: v.under5Count || 0,
          pregnantMothers: v.pregnantMothers || 0
        },
        { upsert: true, new: true }
      );
      locationCount++;
    }
    console.log(`[Seed] Seeded ${locationCount} village locations.`);

    // 2. Seed Village Analytics & HES
    console.log('[Seed] Seeding Village Analytics...');
    let analyticsCount = 0;
    for (const v of VILLAGES_DATABASE) {
      const hes = calculateHES(v.scores || {});
      const gap = calculateHealthcareGap(hes.infrastructureScore, hes.healthcareEffectivenessScore, v.topGap, v.majorGaps);

      await VillageAnalytics.findOneAndUpdate(
        { villageId: v.id },
        {
          villageId: v.id,
          infrastructureScore: hes.infrastructureScore,
          serviceAvailabilityScore: hes.serviceAvailabilityScore,
          utilizationScore: hes.utilizationScore,
          healthOutcomeScore: hes.healthOutcomeScore,
          healthcareEffectivenessScore: hes.healthcareEffectivenessScore,
          healthcareGapScore: gap.healthcareGapScore,
          topGap: gap.mainGap,
          clusterArchetype: v.clusterArchetype || 'Rural Health Catchment'
        },
        { upsert: true, new: true }
      );
      analyticsCount++;
    }
    console.log(`[Seed] Seeded ${analyticsCount} village analytics records.`);

    // 3. Seed Risk Predictions & Feature Factors
    console.log('[Seed] Seeding Risk Predictions...');
    let riskCount = 0;
    for (const v of VILLAGES_DATABASE) {
      const contributingFactors = (v.shapFactors || []).map(f => ({
        factor: f.factor,
        contribution: f.impact,
        direction: f.type || 'negative',
        interpretation: `${f.factor} driver in rural health vulnerability.`
      }));

      await RiskPrediction.findOneAndUpdate(
        { villageId: v.id },
        {
          villageId: v.id,
          districtId: v.districtId,
          riskScore: v.riskScore,
          riskLevel: (v.riskLevel || 'MODERATE').toUpperCase(),
          predictedUndernutrition: v.trends?.[3]?.malnutrition || 24.0,
          isAnomalous: Boolean(v.anomaly?.flagged),
          contributingFactors
        },
        { upsert: true, new: true }
      );
      riskCount++;
    }
    console.log(`[Seed] Seeded ${riskCount} risk prediction records.`);

    // 4. Seed Recommendations
    console.log('[Seed] Seeding Recommendations...');
    let recCount = 0;
    await Recommendation.deleteMany({}); // Refresh recommendations idempotently
    for (const v of VILLAGES_DATABASE) {
      const recs = generateRecommendations(v);
      for (const r of recs) {
        await Recommendation.create({
          villageId: v.id,
          intervention: r.intervention,
          identifiedGap: r.identifiedGap,
          reason: r.reason,
          priority: r.priority,
          urgency: r.urgency,
          estimatedCost: '₹35,000 / Village',
          actionSteps: [
            'Conduct frontline field assessment with ASHA/ANM health workers.',
            'Deploy targeted supplies and mobilize outreach logistics.',
            'Track recovery and vaccination/nutrition compliance in digital registers.'
          ]
        });
        recCount++;
      }
    }
    console.log(`[Seed] Seeded ${recCount} recommendation records.`);

    // 5. Seed Real RHS 2020 State Healthcare Facilities
    console.log('[Seed] Ingesting RHS 2020 Facility Infrastructure...');
    const rhsPath = path.resolve(__dirname, '../../datasets/rhs_2020.csv');
    let facilityCount = 0;
    if (fs.existsSync(rhsPath)) {
      const lines = fs.readFileSync(rhsPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < headers.length) continue;
        const stateName = cols[0];
        if (!stateName || stateName.includes('All India')) continue;

        const subCenters = parseCleanNumber(cols[1]) || 0;
        const phcs = parseCleanNumber(cols[2]) || 0;
        const chcs = parseCleanNumber(cols[3]) || 0;
        const doctors = parseCleanNumber(cols[5]) || 0;
        const nurses = parseCleanNumber(cols[10]) || 0;

        await HealthcareFacility.findOneAndUpdate(
          { districtId: `STATE-${stateName.toUpperCase()}`, facilityType: 'PHC' },
          {
            districtId: `STATE-${stateName.toUpperCase()}`,
            facilityType: 'PHC',
            facilityName: `${stateName} Primary Health Centres`,
            operationalStatus: 'Operational',
            doctorsOnDuty: doctors,
            nursingStaff: nurses,
            hasColdChain: true,
            essentialMedicineAvailability: 72
          },
          { upsert: true }
        );

        await HealthcareFacility.findOneAndUpdate(
          { districtId: `STATE-${stateName.toUpperCase()}`, facilityType: 'SUB_CENTRE' },
          {
            districtId: `STATE-${stateName.toUpperCase()}`,
            facilityType: 'SUB_CENTRE',
            facilityName: `${stateName} Sub-Centres`,
            operationalStatus: 'Operational',
            doctorsOnDuty: 0,
            nursingStaff: subCenters,
            hasColdChain: true,
            essentialMedicineAvailability: 65
          },
          { upsert: true }
        );
        facilityCount += 2;
      }
      console.log(`[Seed] Ingested ${facilityCount} state facility aggregation records from RHS 2020.`);
    }

    // 6. Seed Real NFHS-5 District Health Indicators for Key Focus States
    console.log('[Seed] Ingesting NFHS-5 District Indicators...');
    const nfhsPath = path.resolve(__dirname, '../../datasets/NFHS_5_India_Districts_Factsheet_Data.csv');
    let indicatorCount = 0;
    if (fs.existsSync(nfhsPath)) {
      const nfhsText = fs.readFileSync(nfhsPath, 'utf8');
      const lines = nfhsText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"+|"+$/g, ''));

      // Filter focus districts in Jharkhand, Bihar, Odisha to seed persistent DB
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.length < 50) continue;
        const cols = line.split(',');
        const distName = cols[0]?.trim();
        const stateName = cols[1]?.trim();

        if (stateName && (stateName.includes('Jharkhand') || stateName.includes('Bihar') || stateName.includes('Odisha'))) {
          const underweightVal = parseCleanNumber(cols[97]) || 35.0;
          const stuntedVal = parseCleanNumber(cols[88]) || 38.0;
          const wastedVal = parseCleanNumber(cols[76]) || 20.0;
          const fullyVaccinatedVal = parseCleanNumber(cols[61]) || 68.0;

          await HealthIndicator.findOneAndUpdate(
            { entityId: distName, indicatorName: 'Underweight Children Under 5' },
            {
              entityId: distName,
              granularity: 'DISTRICT',
              indicatorName: 'Underweight Children Under 5',
              category: 'Child Health',
              value: underweightVal,
              benchmarkTarget: 20.0,
              unit: '%',
              period: 'NFHS-5'
            },
            { upsert: true }
          );

          await HealthIndicator.findOneAndUpdate(
            { entityId: distName, indicatorName: 'Child Full Immunization' },
            {
              entityId: distName,
              granularity: 'DISTRICT',
              indicatorName: 'Child Full Immunization',
              category: 'Immunization',
              value: fullyVaccinatedVal,
              benchmarkTarget: 80.0,
              unit: '%',
              period: 'NFHS-5'
            },
            { upsert: true }
          );
          indicatorCount += 2;
        }
      }
      console.log(`[Seed] Ingested ${indicatorCount} district indicators from NFHS-5.`);
    }

    console.log('✓ Database seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
