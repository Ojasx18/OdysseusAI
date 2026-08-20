const { Router } = require('express');
const { geocode, getNearby, getRoute } = require('../controllers/mapsController');

const router = Router();

router.get('/geocode', geocode);
router.get('/nearby', getNearby);
router.get('/route', getRoute);

module.exports = router;
