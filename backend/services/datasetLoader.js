/**
 * Dataset Ingestion Service for Government Health Datasets
 * 
 * Ingests and indexes real government data:
 * 1. NFHS-5 India District Factsheet Data (707 districts, 109 health indicators)
 * 2. RHS 2020 State Healthcare Infrastructure (SubCentres, PHCs, CHCs, Manpower)
 * 3. RHS Villages, Districts & Area Statistics
 */

const fs = require('fs');
const path = require('path');

const DATASETS_DIR = path.resolve(__dirname, '../../datasets');

let nfhsDistricts = [];
let rhsStateData = [];
let rhsAreaCoverage = [];
let isLoaded = false;

/**
 * Robust CSV parser that handles quotes, escaped characters, and newlines inside quotes.
 */
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().replace(/^"+|"+$/g, ''));
  const parsedRecords = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < headers.length * 0.5) continue; // skip degenerate rows
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      record[headers[c]] = row[c] !== undefined ? row[c].trim().replace(/^"+|"+$/g, '') : null;
    }
    parsedRecords.push(record);
  }

  return parsedRecords;
}

/**
 * Clean numeric string into float or null
 */
function parseCleanNumber(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().replace(/,/g, '').replace(/[()]/g, '');
  if (str === '' || str === '*' || str.toUpperCase() === 'NA' || str.toUpperCase() === 'N APP') {
    return null;
  }
  const num = parseFloat(str);
  return Number.isNaN(num) ? null : num;
}

/**
 * Normalize state or district names for reliable matching
 */
function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Load and index all dataset files
 */
function loadDatasets() {
  if (isLoaded) return;

  try {
    // 1. NFHS-5 District Data
    const nfhsPath = path.join(DATASETS_DIR, 'NFHS_5_India_Districts_Factsheet_Data.csv');
    if (fs.existsSync(nfhsPath)) {
      const nfhsText = fs.readFileSync(nfhsPath, 'utf8');
      nfhsDistricts = parseCSV(nfhsText);
      console.log(`[DatasetLoader] Loaded ${nfhsDistricts.length} district records from NFHS-5 dataset`);
    } else {
      console.warn(`[DatasetLoader] NFHS-5 file not found at ${nfhsPath}`);
    }

    // 2. RHS 2020 State Healthcare Facilities
    const rhsPath = path.join(DATASETS_DIR, 'rhs_2020.csv');
    if (fs.existsSync(rhsPath)) {
      const rhsText = fs.readFileSync(rhsPath, 'utf8');
      rhsStateData = parseCSV(rhsText);
      console.log(`[DatasetLoader] Loaded ${rhsStateData.length} state records from RHS 2020`);
    }

    // 3. RHS Area and Village Counts
    const areaPath = path.join(DATASETS_DIR, 'rhs_villages_districs_area.csv');
    if (fs.existsSync(areaPath)) {
      const areaText = fs.readFileSync(areaPath, 'utf8');
      rhsAreaCoverage = parseCSV(areaText);
      console.log(`[DatasetLoader] Loaded ${rhsAreaCoverage.length} coverage records from RHS Area dataset`);
    }

    isLoaded = true;
  } catch (error) {
    console.error('[DatasetLoader] Error loading dataset CSVs:', error);
  }
}

/**
 * Retrieve raw NFHS record for district
 */
function getDistrictNFHSRecord(districtName, stateName) {
  loadDatasets();
  const targetDist = normalizeName(districtName);
  const targetState = stateName ? normalizeName(stateName) : null;

  return nfhsDistricts.find(d => {
    const distName = normalizeName(d['District Names']);
    const stName = normalizeName(d['State/UT']);

    const distMatches = distName === targetDist || distName.includes(targetDist) || targetDist.includes(distName);
    if (!distMatches) return false;

    if (targetState) {
      return stName === targetState || stName.includes(targetState) || targetState.includes(stName);
    }
    return true;
  }) || null;
}

/**
 * Retrieve RHS facility counts for state
 */
function getStateRHSRecord(stateName) {
  loadDatasets();
  const target = normalizeName(stateName);

  const found = rhsStateData.find(s => {
    const name = normalizeName(s['State/UT']);
    return name === target || name.includes(target) || target.includes(name);
  });

  if (!found) return null;

  return {
    state: found['State/UT'],
    subCentres: parseCleanNumber(found['SubCenters']) || 0,
    phcs: parseCleanNumber(found['PHCs']) || 0,
    chcs: parseCleanNumber(found['CHCs']) || 0,
    totalFacilities: (parseCleanNumber(found['SubCenters']) || 0) + (parseCleanNumber(found['PHCs']) || 0) + (parseCleanNumber(found['CHCs']) || 0),
    doctors: parseCleanNumber(found['Doctors']) || 0,
    specialists: parseCleanNumber(found['Specialists']) || 0,
    nursingStaff: parseCleanNumber(found['NursingStaff']) || 0,
    anmHealthWorkers: parseCleanNumber(found['ANM/Health_Worker_Female']) || 0
  };
}

/**
 * Retrieve district and village area statistics for state
 */
function getStateAreaCoverage(stateName) {
  loadDatasets();
  const target = normalizeName(stateName);

  const found = rhsAreaCoverage.find(s => {
    const name = normalizeName(s['State/UT']);
    return name === target || name.includes(target) || target.includes(name);
  });

  if (!found) return null;

  return {
    state: found['State/UT'],
    numberOfDistricts: parseCleanNumber(found['Number_of_Districts']) || null,
    numberOfVillages: parseCleanNumber(found['Number_of_Villages']) || null,
    ruralAreaPercent: parseCleanNumber(found['Rural_%']) || null,
    totalAreaKm2: parseCleanNumber(found['Total_Area']) || null
  };
}

/**
 * Get list of all states available in NFHS
 */
function getAllStatesFromNFHS() {
  loadDatasets();
  const statesSet = new Set();
  nfhsDistricts.forEach(d => {
    if (d['State/UT']) statesSet.add(d['State/UT'].trim());
  });
  return Array.from(statesSet).sort();
}

/**
 * Get all districts in a state from NFHS
 */
function getDistrictsForStateFromNFHS(stateName) {
  loadDatasets();
  const target = normalizeName(stateName);
  return nfhsDistricts
    .filter(d => normalizeName(d['State/UT']).includes(target) || target.includes(normalizeName(d['State/UT'])))
    .map(d => d['District Names'].trim())
    .sort();
}

// Initial load
loadDatasets();

module.exports = {
  loadDatasets,
  getDistrictNFHSRecord,
  getStateRHSRecord,
  getStateAreaCoverage,
  getAllStatesFromNFHS,
  getDistrictsForStateFromNFHS,
  parseCleanNumber
};
