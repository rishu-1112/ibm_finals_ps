const { STATES } = require('../services/gramSwasthyaData');

const getLocations = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: STATES
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location hierarchy',
      error: error.message
    });
  }
};

module.exports = {
  getLocations
};
