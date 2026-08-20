const mapsService = require('../services/mapsService');
const logger = require('../utils/logger');

/**
 * GET /api/maps/geocode
 * Query: ?q=location_name
 */
const geocode = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required for geocoding',
      });
    }

    const result = await mapsService.geocodeLocation(q);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No coordinates found for location: "${q}"`,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Geocoding controller error: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/maps/nearby
 * Query: ?latitude=x&longitude=y&category=c&radius=r
 */
const getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, category, radius } = req.query;

    if (!latitude || !longitude || !category) {
      return res.status(400).json({
        success: false,
        message: 'Parameters "latitude", "longitude", and "category" are required',
      });
    }

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const radVal = radius ? parseInt(radius, 10) : 5000;

    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be a valid number between -90 and 90',
      });
    }

    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be a valid number between -180 and 180',
      });
    }

    if (isNaN(radVal) || radVal < 100 || radVal > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be a number between 100 and 20000 meters',
      });
    }

    const validCategories = [
      'attractions',
      'restaurants',
      'cafes',
      'museums',
      'beaches',
      'parks',
      'hotels',
      'shopping',
      'temples',
      'viewpoints',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Supported categories: ${validCategories.join(', ')}`,
      });
    }

    const results = await mapsService.searchNearbyPlaces(latVal, lngVal, category, radVal);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error(`[Nearby Places Error]\nstatus: ${statusCode}\nexternal API: Overpass API\nmessage: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/maps/route
 * Query: ?originLat=ol&originLng=on&destinationLat=dl&destinationLng=dn
 */
const getRoute = async (req, res, next) => {
  try {
    const { originLat, originLng, destinationLat, destinationLng } = req.query;

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return res.status(400).json({
        success: false,
        message: 'Parameters "originLat", "originLng", "destinationLat", and "destinationLng" are required',
      });
    }

    const oLat = parseFloat(originLat);
    const oLng = parseFloat(originLng);
    const dLat = parseFloat(destinationLat);
    const dLng = parseFloat(destinationLng);

    if (isNaN(oLat) || oLat < -90 || oLat > 90 || isNaN(dLat) || dLat < -90 || dLat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitudes must be valid numbers between -90 and 90',
      });
    }

    if (isNaN(oLng) || oLng < -180 || oLng > 180 || isNaN(dLng) || dLng < -180 || dLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitudes must be valid numbers between -180 and 180',
      });
    }

    const origin = { latitude: oLat, longitude: oLng };
    const destination = { latitude: dLat, longitude: dLng };

    const route = await mapsService.calculateRoute(origin, destination);

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    logger.error(`Routing controller error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  geocode,
  getNearby,
  getRoute,
};
