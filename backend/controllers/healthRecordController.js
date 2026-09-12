const {
  DISTRICT_KPI_DATABASE,
  VILLAGES_DATABASE,
  DISTRICT_HEALTH_GAPS,
  INFRA_VS_EFFECTIVENESS_DATA,
  TREND_DATA_MAP
} = require('../services/gramSwasthyaData');

const getDashboardMetrics = (req, res) => {
  try {
    const { districtId = 'JH-RNC', block } = req.query;
    const overview = DISTRICT_KPI_DATABASE[districtId] || DISTRICT_KPI_DATABASE['JH-RNC'];
    
    let filteredVillages = VILLAGES_DATABASE.filter(v => !districtId || v.districtId === districtId);
    if (block && block !== 'ALL') {
      filteredVillages = filteredVillages.filter(v => v.block === block);
    }

    return res.status(200).json({
      success: true,
      data: {
        overview,
        gaps: DISTRICT_HEALTH_GAPS,
        infraVsHes: INFRA_VS_EFFECTIVENESS_DATA,
        villagesCount: filteredVillages.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch district dashboard metrics',
      error: error.message
    });
  }
};

const getVillages = (req, res) => {
  try {
    const { districtId, block, riskFilter = 'ALL', search = '' } = req.query;

    let villages = VILLAGES_DATABASE.filter(v => {
      const matchDistrict = !districtId || v.districtId === districtId;
      const matchBlock = !block || block === 'ALL' || v.block === block;
      const matchRisk = riskFilter === 'ALL' || v.riskLevel.toUpperCase() === riskFilter.toUpperCase();
      const matchSearch = !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.block.toLowerCase().includes(search.toLowerCase()) ||
        v.topGap.toLowerCase().includes(search.toLowerCase());

      return matchDistrict && matchBlock && matchRisk && matchSearch;
    });

    return res.status(200).json({
      success: true,
      count: villages.length,
      data: villages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch villages',
      error: error.message
    });
  }
};

const getVillageById = (req, res) => {
  try {
    const { id } = req.params;
    const village = VILLAGES_DATABASE.find(v => v.id === id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: `Village with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: village
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch village profile',
      error: error.message
    });
  }
};

const getPriorities = (req, res) => {
  try {
    const { districtId, filter = 'ALL' } = req.query;

    let list = VILLAGES_DATABASE.filter(v => {
      const matchDistrict = !districtId || v.districtId === districtId;
      const matchRisk = filter === 'ALL' || v.riskLevel.toUpperCase() === filter.toUpperCase();
      return matchDistrict && matchRisk;
    });

    list.sort((a, b) => b.riskScore - a.riskScore);

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch priority ranking list',
      error: error.message
    });
  }
};

const getTrends = (req, res) => {
  try {
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
      message: 'Failed to fetch health trends',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getVillages,
  getVillageById,
  getPriorities,
  getTrends
};
