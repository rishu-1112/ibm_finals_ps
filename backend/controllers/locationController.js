const { STATES, VILLAGES_DATABASE } = require('../services/gramSwasthyaData');
const { getAllStatesFromNFHS, getDistrictsForStateFromNFHS } = require('../services/datasetLoader');

/**
 * Full hierarchical locations (for backwards compatibility with existing UI)
 */
const getLocations = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: STATES
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOCATION_FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * GET /api/locations/states
 * Returns available states from real data
 */
const getStates = (req, res) => {
  try {
    const states = STATES.map(s => ({
      id: s.id,
      name: s.name,
      code: s.id,
      districtsCount: s.districts ? s.districts.length : 0
    }));

    return res.status(200).json({
      success: true,
      data: states
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATES_FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * GET /api/locations/districts?state=
 * Returns districts for a given state
 */
const getDistricts = (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      // If state is not provided, return all primary districts in priority states
      const allDistricts = STATES.flatMap(s =>
        s.districts.map(d => ({
          id: d.id,
          name: d.name,
          stateId: s.id,
          stateName: s.name
        }))
      );
      return res.status(200).json({
        success: true,
        data: allDistricts
      });
    }

    const stateObj = STATES.find(s =>
      s.id.toLowerCase() === state.toLowerCase() ||
      s.name.toLowerCase() === state.toLowerCase()
    );

    if (stateObj) {
      const districts = stateObj.districts.map(d => ({
        id: d.id,
        name: d.name,
        stateId: stateObj.id,
        stateName: stateObj.name
      }));
      return res.status(200).json({
        success: true,
        data: districts
      });
    }

    // Lookup in full NFHS dataset if outside primary state set
    const nfhsDistricts = getDistrictsForStateFromNFHS(state);
    if (nfhsDistricts.length > 0) {
      return res.status(200).json({
        success: true,
        data: nfhsDistricts.map(d => ({
          id: `IND-${d.replace(/\s+/g, '-').toUpperCase()}`,
          name: d,
          stateName: state
        }))
      });
    }

    return res.status(404).json({
      success: false,
      error: {
        code: 'STATE_NOT_FOUND',
        message: `State '${state}' not found in location registry`
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DISTRICTS_FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * GET /api/locations/blocks?district=
 * Returns administrative blocks within a district
 */
const getBlocks = (req, res) => {
  try {
    const { district } = req.query;

    let villages = VILLAGES_DATABASE;
    if (district) {
      villages = villages.filter(v =>
        v.districtId.toLowerCase() === district.toLowerCase() ||
        v.districtName.toLowerCase() === district.toLowerCase()
      );
    }

    const blocksSet = new Set();
    const blocksList = [];

    villages.forEach(v => {
      if (v.block && !blocksSet.has(v.block)) {
        blocksSet.add(v.block);
        blocksList.push({
          name: v.block,
          districtId: v.districtId,
          districtName: v.districtName
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: blocksList
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'BLOCKS_FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * GET /api/locations/villages?block=
 * Returns villages within a block or district
 */
const getVillagesInLocation = (req, res) => {
  try {
    const { block, district } = req.query;

    let villages = VILLAGES_DATABASE;
    if (block && block !== 'ALL') {
      villages = villages.filter(v => v.block.toLowerCase() === block.toLowerCase());
    }
    if (district) {
      villages = villages.filter(v =>
        v.districtId.toLowerCase() === district.toLowerCase() ||
        v.districtName.toLowerCase() === district.toLowerCase()
      );
    }

    const result = villages.map(v => ({
      villageId: v.id,
      id: v.id,
      villageName: v.name,
      name: v.name,
      block: v.block,
      districtId: v.districtId,
      districtName: v.districtName,
      stateId: v.stateId,
      stateName: v.stateName,
      latitude: v.lat,
      longitude: v.lng,
      population: v.population
    }));

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'VILLAGES_FETCH_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = {
  getLocations,
  getStates,
  getDistricts,
  getBlocks,
  getVillagesInLocation
};
