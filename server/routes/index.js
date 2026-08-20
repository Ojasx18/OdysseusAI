const { Router } = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./auth');
const tripRoutes = require('./trips');
const aiRoutes = require('./ai');
const mapsRoutes = require('./maps');
const weatherRoutes = require('./weather');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/ai', aiRoutes);
router.use('/maps', mapsRoutes);
router.use('/weather', weatherRoutes);

module.exports = router;
