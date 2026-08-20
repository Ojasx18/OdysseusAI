const config = require('../config');
const logger = require('../utils/logger');

// Local FIFO cache for routes to minimize OSRM calls (max 1000 items)
const routeCache = new Map();

// Local FIFO cache for geocoding to minimize Nominatim calls (max 1000 items)
const geocodeCache = new Map();

/**
 * Format meters distance into readable text
 */
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration seconds into readable text
 */
const formatDuration = (seconds) => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hrs} hr`;
  }
  return `${hrs} hr ${remainingMins} min`;
};

/**
 * Nominatim Geocoding: converts query string into coordinates
 */
const geocodeLocation = async (query) => {
  if (!query || query.trim() === '') {
    throw new Error('Query string is required for geocoding');
  }

  const cacheKey = query.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    logger.info(`Geocoding cache hit for query: "${query}"`);
    return geocodeCache.get(cacheKey);
  }

  const url = `${config.nominatimUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  
  logger.info(`Requesting Nominatim geocoding for: "${query}"`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VoyageAI-Travel-Planner/1.0 (contact: support@voyageai.local)',
      'Accept-Language': 'en'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data || data.length === 0) {
    geocodeCache.set(cacheKey, null);
    return null;
  }

  const first = data[0];
  const result = {
    name: first.name || query,
    latitude: parseFloat(first.lat),
    longitude: parseFloat(first.lon),
    displayName: first.display_name,
  };
  
  // Evict cache if it gets too large
  if (geocodeCache.size >= 1000) {
    const firstEvictKey = geocodeCache.keys().next().value;
    geocodeCache.delete(firstEvictKey);
  }
  
  geocodeCache.set(cacheKey, result);
  return result;
};

// Overpass API category queries mappings
const CATEGORY_MAPPINGS = {
  attractions: 'nwr["tourism"="attraction"](around:{{radius}},{{lat}},{{lng}}); nwr["historic"](around:{{radius}},{{lat}},{{lng}});',
  restaurants: 'nwr["amenity"="restaurant"](around:{{radius}},{{lat}},{{lng}});',
  cafes: 'nwr["amenity"="cafe"](around:{{radius}},{{lat}},{{lng}});',
  museums: 'nwr["tourism"="museum"](around:{{radius}},{{lat}},{{lng}});',
  beaches: 'nwr["natural"="beach"](around:{{radius}},{{lat}},{{lng}});',
  parks: 'nwr["leisure"="park"](around:{{radius}},{{lat}},{{lng}}); nwr["leisure"="garden"](around:{{radius}},{{lat}},{{lng}});',
  hotels: 'nwr["tourism"="hotel"](around:{{radius}},{{lat}},{{lng}}); nwr["tourism"="hostel"](around:{{radius}},{{lat}},{{lng}});',
  shopping: 'nwr["shop"](around:{{radius}},{{lat}},{{lng}});',
  temples: 'nwr["amenity"="place_of_worship"](around:{{radius}},{{lat}},{{lng}});',
  viewpoints: 'nwr["tourism"="viewpoint"](around:{{radius}},{{lat}},{{lng}});',
};

const searchNearbyPlaces = async (latitude, longitude, category, radius = 5000) => {
  const numericLat = parseFloat(latitude);
  const numericLng = parseFloat(longitude);
  const numericRadius = Math.min(20000, Math.max(100, parseInt(radius, 10) || 5000));

  if (isNaN(numericLat) || isNaN(numericLng)) {
    const err = new Error('Valid numeric latitude and longitude are required');
    err.statusCode = 400;
    throw err;
  }

  const queryTemplate = CATEGORY_MAPPINGS[category] || `nwr(around:{{radius}},{{lat}},{{lng}});`;
  const overpassQuery = queryTemplate
    .replace(/\{\{radius\}\}/g, numericRadius)
    .replace(/\{\{lat\}\}/g, numericLat)
    .replace(/\{\{lng\}\}/g, numericLng);

  const body = `[out:json][timeout:15];( ${overpassQuery} ); out center;`;

  // Fallback mirror URLs in case the primary interpreter is rate-limited (429) or times out (504)
  const mirrors = [
    config.overpassUrl || 'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  let lastError = null;

  for (const mirrorUrl of mirrors) {
    const MAX_RETRIES = 1;
    let success = false;
    let results = [];

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(`Requesting Overpass nearby places in category "${category}" around [${numericLat}, ${numericLng}] (mirror: ${mirrorUrl}, attempt ${attempt + 1})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(mirrorUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'VoyageAI-Travel-Planner/1.0 (contact: support@voyageai.local)'
          },
          body: `data=${encodeURIComponent(body)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Retry on 504/503/429 (transient server overload) on the same mirror first
          if ((response.status === 504 || response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
            logger.warn(`Overpass API mirror returned ${response.status}, retrying in 1.5s...`);
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          const err = new Error(`Overpass API error: ${response.status} ${response.statusText}`);
          err.statusCode = response.status;
          throw err;
        }

        const data = await response.json();
        const elements = data.elements || [];

        results = elements
          .map((el) => {
            const lat = el.lat !== undefined ? el.lat : el.center ? el.center.lat : null;
            const lng = el.lon !== undefined ? el.lon : el.center ? el.center.lon : null;

            if (lat === null || lng === null) {
              return null;
            }

            const tags = el.tags || {};
            const name = tags.name || tags.official_name || tags.brand || `Unnamed ${category}`;

            const street = tags['addr:street'] || '';
            const city = tags['addr:city'] || '';
            const houseNumber = tags['addr:housenumber'] || '';
            
            let address = '';
            if (houseNumber) address += `${houseNumber} `;
            if (street) address += street;
            if (city) address += address ? `, ${city}` : city;
            if (!address) address = tags['addr:full'] || 'Address not available';

            return {
              id: `${el.type}_${el.id}`,
              name,
              category,
              latitude: lat,
              longitude: lng,
              address,
              tags,
            };
          })
          .filter(Boolean);

        success = true;
        break; // Break retries on success
      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') {
          const timeoutErr = new Error('Overpass API request timed out');
          timeoutErr.statusCode = 504;
          lastError = timeoutErr;
          if (attempt < MAX_RETRIES) {
            logger.warn(`Overpass API request to ${mirrorUrl} timed out, retrying...`);
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          break; // Break retries to try next mirror
        }
        
        // If it's a rate limit or server error, break retries to try next mirror
        if (err.statusCode === 429 || err.statusCode === 503 || err.statusCode === 504) {
          logger.warn(`Overpass API mirror ${mirrorUrl} returned ${err.statusCode}. Breaking to fallback mirror...`);
          break;
        }
      }
    }

    if (success) {
      return results;
    }
  }

  // If all mirrors and retries failed, throw the final error
  throw lastError || new Error('All Overpass API mirrors failed to respond');
};

/**
 * OSRM Route Calculation: calculates driving distance, time, and geometries
 */
const calculateRoute = async (origin, destination) => {
  if (
    !origin ||
    !destination ||
    isNaN(origin.latitude) ||
    isNaN(origin.longitude) ||
    isNaN(destination.latitude) ||
    isNaN(destination.longitude)
  ) {
    throw new Error('Valid origin and destination coordinates are required');
  }

  const key = `${origin.latitude.toFixed(5)},${origin.longitude.toFixed(5)};${destination.latitude.toFixed(5)},${destination.longitude.toFixed(5)}`;
  
  // Check local cache
  if (routeCache.has(key)) {
    logger.info(`OSRM routing cache hit for: ${key}`);
    return routeCache.get(key);
  }

  const url = `${config.osrmUrl}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  logger.info(`Requesting OSRM route from [${origin.latitude}, ${origin.longitude}] to [${destination.latitude}, ${destination.longitude}]`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VoyageAI-Travel-Planner/1.0 (contact: support@voyageai.local)'
    }
  });

  if (!response.ok) {
    throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM failed to calculate route: ${data.message || 'No route'}`);
  }

  const route = data.routes[0];
  const distance = route.distance;
  const duration = route.duration;

  // Map from OSRM [longitude, latitude] to Leaflet [latitude, longitude]
  const rawCoords = route.geometry?.coordinates || [];
  const geometry = rawCoords.map((coord) => [coord[1], coord[0]]);

  const result = {
    distance,
    duration,
    distanceText: formatDistance(distance),
    durationText: formatDuration(duration),
    geometry,
  };

  // Cache results (FIFO limit 1000 items)
  routeCache.set(key, result);
  if (routeCache.size > 1000) {
    const firstKey = routeCache.keys().next().value;
    routeCache.delete(firstKey);
  }

  return result;
};

module.exports = {
  geocodeLocation,
  searchNearbyPlaces,
  calculateRoute,
};
