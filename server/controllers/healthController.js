const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VoyageAI API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

module.exports = { getHealth };
