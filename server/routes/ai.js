const { Router } = require('express');
const { generateItinerary, aiValidation } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = Router();

// Protect all AI endpoints
router.use(protect);

router.post('/generate-itinerary', aiValidation, generateItinerary);

module.exports = router;
