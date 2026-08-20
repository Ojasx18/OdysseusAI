const { Router } = require('express');
const {
  createTrip,
  tripValidation,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  getShareTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

const router = Router();

// Public route for shared itineraries (no protect middleware)
router.get('/share/:shareId', getShareTrip);

// Protected routes (require valid access token)
router.use(protect);

router.route('/')
  .post(tripValidation, createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTrip)
  .put(tripValidation, updateTrip)
  .delete(deleteTrip);

module.exports = router;
