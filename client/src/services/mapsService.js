import axios from 'axios';

// Base backend API URL
const MAPS_API_BASE = 'http://localhost:5000/api/maps';

const mapsService = {
  /**
   * Geocode a text search query to coordinates
   * @param {string} query - Destination query e.g. "Paris"
   * @returns {Promise<Object>} API response body containing geocode result
   */
  geocode: async (query) => {
    const res = await axios.get(`${MAPS_API_BASE}/geocode`, { params: { q: query } });
    return res.data;
  },

  /**
   * Search for nearby places of interest
   * @param {number} latitude - Latitude center
   * @param {number} longitude - Longitude center
   * @param {string} category - Place category
   * @param {number} [radius=5000] - Search radius in meters
   * @returns {Promise<Object>} API response body containing array of nearby locations
   */
  getNearby: async (latitude, longitude, category, radius = 5000) => {
    const res = await axios.get(`${MAPS_API_BASE}/nearby`, {
      params: {
        latitude,
        longitude,
        category,
        radius,
      },
    });
    return res.data;
  },

  /**
   * Calculate routes between two coordinates
   * @param {number} originLat - Origin Latitude
   * @param {number} originLng - Origin Longitude
   * @param {number} destinationLat - Destination Latitude
   * @param {number} destinationLng - Destination Longitude
   * @returns {Promise<Object>} API response body containing distance, duration, and route geometry
   */
  getRoute: async (originLat, originLng, destinationLat, destinationLng) => {
    const res = await axios.get(`${MAPS_API_BASE}/route`, {
      params: {
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      },
    });
    return res.data;
  },
};

export default mapsService;
