const { validationResult, body } = require('express-validator');
const tripService = require('../services/tripService');
const logger = require('../utils/logger');

// Validation rules
const tripValidation = [
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
  body('coordinates')
    .isObject()
    .withMessage('Coordinates must be an object containing lat and lng')
    .custom((val) => {
      if (typeof val.lat !== 'number' || typeof val.lng !== 'number') {
        throw new Error('Coordinates must contain numeric lat and lng values');
      }
      return true;
    }),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid ISO8601 date'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('End date must be a valid ISO8601 date')
    .custom((val, { req }) => {
      if (new Date(val) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
  body('travelers')
    .isInt({ min: 1 })
    .withMessage('Travelers must be a positive integer'),
  body('budget')
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
];

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const trip = await tripService.createTrip(req.user._id, req.body);
    logger.info(`Trip created for user ${req.user.email} -> ${trip.destination}`);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { trip },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips
const getTrips = async (req, res, next) => {
  try {
    const trips = await tripService.getUserTrips(req.user._id);
    res.status(200).json({
      success: true,
      data: { trips },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id
const getTrip = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user._id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { trip },
    });
  } catch (error) {
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// PUT /api/trips/:id
const updateTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const trip = await tripService.updateTrip(req.params.id, req.user._id, req.body);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    logger.info(`Trip updated for user ${req.user.email} -> ${trip.destination}`);

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip },
    });
  } catch (error) {
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await tripService.deleteTrip(req.params.id, req.user._id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    logger.info(`Trip deleted for user ${req.user.email} -> ${trip.destination}`);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
      data: { trip },
    });
  } catch (error) {
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// GET /api/trips/share/:shareId
const getShareTrip = async (req, res, next) => {
  try {
    const trip = await tripService.getTripByShareId(req.params.shareId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Public itinerary not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { trip },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  tripValidation,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  getShareTrip,
};
