const { validationResult, body } = require('express-validator');
const openaiService = require('../services/openaiService');
const tripService = require('../services/tripService');
const mapsService = require('../services/mapsService');
const logger = require('../utils/logger');

// Import curated pools
const curatedPools = require('../utils/curatedPools');

// Haversine distance calculator
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to normalize place names for comparison
const normalizePlaceName = (name, destination) => {
  let normalized = name.toLowerCase().trim();
  if (destination) {
    const destLower = destination.toLowerCase().trim();
    const shortDest = destLower.split(',')[0].trim();
    normalized = normalized.replace(new RegExp(`,?\\s*${destLower}`, 'g'), '');
    normalized = normalized.replace(new RegExp(`,?\\s*${shortDest}`, 'g'), '');
  }
  // Standardize common connectors
  normalized = normalized.replace(/\s+&\s+/g, ' and ');
  normalized = normalized.replace(/[.,\/#!$%\^;\*:{}=\-_`~()]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
};

// Helper to check if two places represent the same attraction semantically
const isSemanticDuplicate = (name1, name2, destination) => {
  const norm1 = normalizePlaceName(name1, destination);
  const norm2 = normalizePlaceName(name2, destination);

  if (norm1 === norm2) return true;

  // Substring containment for names longer than 5 characters
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    if (shorter.length > 5) {
      return true;
    }
  }

  const words1 = norm1.split(' ').filter(w => w.length > 2);
  const words2 = norm2.split(' ').filter(w => w.length > 2);

  // Stop words to filter out grammatical terms and generic place categories
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'your', 'of', 'in', 'at', 'on', 'by', 'an', 'a', 'to', 'is', '&',
    'park', 'temple', 'museum', 'cafe', 'restaurant', 'hotel', 'station', 'statue', 'road', 
    'beach', 'street', 'market', 'food', 'local', 'experience', 'spot', 'place', 'center', 
    'centre', 'viewpoint', 'garden', 'gardens', 'bazaar', 'plaza', 'square', 'palace', 
    'fort', 'castle', 'shack', 'tour', 'crossing'
  ]);

  const sigWords1 = words1.filter(w => !stopWords.has(w));
  const sigWords2 = words2.filter(w => !stopWords.has(w));

  if (sigWords1.length === 0 || sigWords2.length === 0) {
    return false;
  }

  const overlap = sigWords1.filter(w => sigWords2.includes(w));
  
  const minSigLen = Math.min(sigWords1.length, sigWords2.length);
  if (minSigLen >= 2 && overlap.length >= minSigLen) {
    return true;
  }
  
  if (overlap.length >= 2) {
    return true;
  }

  return false;
};

// Destination-aware validation radius
const getDestinationRadius = (destName) => {
  const name = destName.toLowerCase();
  if (name.includes('goa')) {
    return 80; // Goa is a state, covers larger region (~80-100km)
  }
  if (name.includes('mussoorie')) {
    return 50; // Mussoorie allow 50km (covers Dehradun etc.)
  }
  if (name.includes('paris')) {
    return 40; // Paris allows day trip to Versailles (~20-30km away)
  }
  if (name.includes('state') || name.includes('province') || name.includes('region') || name.includes('county')) {
    return 80;
  }
  return 35; // Default for normal cities (~25-40km range)
};

// Geocode single activity with destination-aware boundary verification (within custom radius)
// Returns coordinates if valid and matches destination context, else null
const validateAndGeocodeActivity = async (placeName, destinationName, dCoords) => {
  const fullQuery = `${placeName}, ${destinationName}`;
  const radius = getDestinationRadius(destinationName);
  
  try {
    const result = await mapsService.geocodeLocation(fullQuery);
    if (result) {
      const dist = getDistance(result.latitude, result.longitude, dCoords.lat, dCoords.lng);
      if (dist < radius) {
        return { lat: result.latitude, lng: result.longitude };
      }
      logger.warn(`Geocoded query "${fullQuery}" was out of boundary: ${dist.toFixed(1)} km from destination center.`);
    }
  } catch (err) {
    logger.warn(`Failed to geocode with full query: "${fullQuery}": ${err.message}`);
  }

  try {
    const result = await mapsService.geocodeLocation(placeName);
    if (result) {
      const dist = getDistance(result.latitude, result.longitude, dCoords.lat, dCoords.lng);
      if (dist < radius) {
        return { lat: result.latitude, lng: result.longitude };
      }
      logger.warn(`Geocoded query "${placeName}" was out of boundary: ${dist.toFixed(1)} km from destination center.`);
    }
  } catch (err) {
    logger.warn(`Failed to geocode with place name only: "${placeName}": ${err.message}`);
  }

  return null;
};

// Validation rules
const aiValidation = [
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
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

// POST /api/ai/generate-itinerary
// Generates the itinerary using OpenAI, validates it, saves to MongoDB via TripService, and returns the saved trip document
const generateItinerary = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const pipelineStart = Date.now();
    logger.info(`[GENERATION START] destination: "${req.body.destination}"`);
    
    // Backend Itinerary Validator (Fast structural & duplicate check)
    const validateItineraryStructureAndDuplicates = (itin, destination, startDate, endDate) => {
      if (!itin || typeof itin !== 'object') {
        throw new Error('Itinerary must be a valid JSON object');
      }
      if (!itin.summary || typeof itin.summary !== 'string') {
        throw new Error('Itinerary is missing a valid text summary');
      }
      if (!itin.days || !Array.isArray(itin.days) || itin.days.length === 0) {
        throw new Error('Itinerary must contain a non-empty days list');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end - start;
      const expectedDays = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);

      if (itin.days.length !== expectedDays) {
        throw new Error(`Itinerary duration mismatch: expected ${expectedDays} days, received ${itin.days.length} days`);
      }

      const seenActivities = new Set();

      for (let dayNum = 1; dayNum <= expectedDays; dayNum++) {
        const day = itin.days.find((d) => d.dayNumber === dayNum);
        if (!day) {
          throw new Error(`Itinerary is missing day number ${dayNum}`);
        }
        if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
          throw new Error(`Day ${dayNum} must contain at least one activity`);
        }

        for (let act of day.activities) {
          if (!act.place || typeof act.place !== 'string' || act.place.trim() === '') {
            throw new Error(`Day ${dayNum} contains an activity with a missing or invalid place name`);
          }
          if (!act.time || typeof act.time !== 'string') {
            throw new Error(`Activity "${act.place}" is missing a valid time field`);
          }
          if (!act.description || typeof act.description !== 'string') {
            throw new Error(`Activity "${act.place}" is missing a valid description`);
          }
          if (typeof act.estimatedCost !== 'number' || isNaN(act.estimatedCost)) {
            throw new Error(`Activity "${act.place}" must contain a numeric estimatedCost`);
          }

          // Check for generic placeholders or categories
          const placeLower = act.place.toLowerCase().trim();
          
          const categories = ['sightseeing', 'dining', 'culture', 'shopping', 'nature', 'nightlife', 'adventure'];
          if (categories.includes(placeLower)) {
            throw new Error(`Activity name "${act.place}" cannot be a simple category name`);
          }

          const genericPlaceholders = [
            'landmark exploration', 'gastronomy experience', 'cultural highlights', 'food experience',
            'culinary spot', 'sightseeing tour', 'culinary experience', 'nightlife experience',
            'nature exploration', 'adventure experience', 'city tour', 'traditional lunch',
            'regional food', 'regional gastronomy', 'beach experience', 'local adventure',
            'mountain adventure', 'scenic viewpoint'
          ];
          for (const placeholder of genericPlaceholders) {
            if (placeLower.includes(placeholder)) {
              throw new Error(`Activity "${act.place}" contains generic template placeholder name: "${placeholder}"`);
            }
          }

          // Check for day suffixes or indicators
          const dayRegex = /\bday\s*\d+\b/i;
          if (dayRegex.test(placeLower)) {
            throw new Error(`Activity "${act.place}" contains an invalid day indicator or suffix`);
          }

          // Duplicate detection across days using semantic check
          for (const seen of seenActivities) {
            if (isSemanticDuplicate(act.place, seen, destination)) {
              throw new Error(`Activity "${act.place}" is duplicated across days`);
            }
          }
          seenActivities.add(act.place);
        }
      }
    };

    // Geocode and validate coordinates for all activities (sequential to respect rate limits)
    const geocodeAndValidateCoordinates = async (itin, destination, dCoords) => {
      if (!itin.days || !Array.isArray(itin.days)) return;
      for (let day of itin.days) {
        if (!day.activities || !Array.isArray(day.activities)) continue;
        for (let act of day.activities) {
          // Skip if already geocoded and validated
          if (typeof act.latitude === 'number' && typeof act.longitude === 'number') {
            continue;
          }
          logger.info(`Geocoding activity: "${act.place}"`);
          const resolved = await validateAndGeocodeActivity(act.place, destination, dCoords);
          if (!resolved) {
            throw new Error(`Activity "${act.place}" failed geocoding or is outside destination region`);
          }
          act.latitude = resolved.lat;
          act.longitude = resolved.lng;
          // Delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 1050));
        }
      }
    };

    // Fetch dynamic places using Overpass as fallback
    const fetchDynamicPlaces = async (dCoords, destination) => {
      const pool = [];
      try {
        logger.info(`Fetching Overpass dynamic repair pool for "${destination}" around [${dCoords.lat}, ${dCoords.lng}]...`);
        const attractions = await mapsService.searchNearbyPlaces(dCoords.lat, dCoords.lng, 'attractions', 10000);
        const cafes = await mapsService.searchNearbyPlaces(dCoords.lat, dCoords.lng, 'cafes', 10000);
        const restaurants = await mapsService.searchNearbyPlaces(dCoords.lat, dCoords.lng, 'restaurants', 10000);
        
        const seenNames = new Set();
        const merged = [...attractions, ...cafes, ...restaurants];
        for (const item of merged) {
          if (item.name && !item.name.includes('Unnamed') && !seenNames.has(item.name.toLowerCase())) {
            seenNames.add(item.name.toLowerCase());
            pool.push({
              name: item.name,
              description: `Explore ${item.name}, a popular local point of interest in ${destination}.`,
              category: item.category || 'sightseeing',
              estimatedCost: item.category === 'dining' ? 500 : 0
            });
          }
        }
      } catch (err) {
        logger.warn(`Failed to fetch dynamic repair pool: ${err.message}`);
      }
      return pool;
    };

    // Controlled Backend Repair
    const repairItinerary = async (itin, destination, dCoords, startDate, endDate) => {
      if (!itin || !itin.days || !Array.isArray(itin.days)) {
        throw new Error('Itinerary is missing days structure for repair');
      }

      const usedPlaces = [];
      const candidates = [];
      
      // 1. Gather unverified candidates from AI's candidatePool
      if (itin.candidatePool && Array.isArray(itin.candidatePool)) {
        for (const c of itin.candidatePool) {
          if (c.name && c.name.trim() !== '') {
            candidates.push({
              name: c.name,
              description: c.description || `Explore ${c.name} in ${destination}.`,
              category: c.category || 'sightseeing',
              estimatedCost: c.estimatedCost || c.cost || 0
            });
          }
        }
      }

      // 2. Gather curated fallback candidates
      const destLower = destination.toLowerCase();
      const matchedKey = Object.keys(curatedPools).find(k => destLower.includes(k));
      if (matchedKey) {
        for (const c of curatedPools[matchedKey]) {
          candidates.push({
            name: c.name,
            description: c.description,
            category: c.category,
            estimatedCost: c.cost || 0
          });
        }
      }

      // 3. Gather dynamic Overpass candidates (only if candidates are running low)
      if (candidates.length < 30) {
        const dynamic = await fetchDynamicPlaces(dCoords, destination);
        candidates.push(...dynamic);
      }

      // De-duplicate candidate names semantically
      const uniqueCandidates = [];
      const seenCandidates = new Set();
      for (const c of candidates) {
        let isDup = false;
        for (const seen of seenCandidates) {
          if (isSemanticDuplicate(c.name, seen, destination)) {
            isDup = true;
            break;
          }
        }
        if (!isDup) {
          uniqueCandidates.push(c);
          seenCandidates.add(c.name);
        }
      }

      logger.info(`Compiled a candidate pool of ${uniqueCandidates.length} unique unverified places for repair.`);

      // Loop through itinerary and verify/repair activities
      for (let day of itin.days) {
        if (!day.activities || !Array.isArray(day.activities)) continue;
        for (let k = 0; k < day.activities.length; k++) {
          const act = day.activities[k];
          
          let isValid = true;
          let resolvedCoords = null;

          // Check generic
          const placeLower = (act.place || '').toLowerCase().trim();
          const categories = ['sightseeing', 'dining', 'culture', 'shopping', 'nature', 'nightlife', 'adventure'];
          const genericPlaceholders = [
            'landmark exploration', 'gastronomy experience', 'cultural highlights', 'food experience',
            'culinary spot', 'sightseeing tour', 'culinary experience', 'nightlife experience',
            'nature exploration', 'adventure experience', 'city tour', 'traditional lunch',
            'regional food', 'regional gastronomy', 'beach experience', 'local adventure',
            'mountain adventure', 'scenic viewpoint'
          ];
          const isGeneric = categories.includes(placeLower) || genericPlaceholders.some(p => placeLower.includes(p)) || /\bday\s*\d+\b/i.test(placeLower);

          if (isGeneric || placeLower === '') {
            isValid = false;
            logger.info(`Activity "${act.place}" is generic or empty. Needs repair.`);
          } else {
            // Check duplicate
            for (const used of usedPlaces) {
              if (isSemanticDuplicate(act.place, used, destination)) {
                isValid = false;
                logger.info(`Activity "${act.place}" is duplicated. Needs repair.`);
                break;
              }
            }
          }

          if (isValid) {
            // Verify geocoding
            logger.info(`Verifying geocoding for existing activity "${act.place}"...`);
            resolvedCoords = await validateAndGeocodeActivity(act.place, destination, dCoords);
            if (!resolvedCoords) {
              isValid = false;
              logger.info(`Activity "${act.place}" failed geocoding validation. Needs repair.`);
            }
            await new Promise((resolve) => setTimeout(resolve, 1050));
          }

          if (isValid && resolvedCoords) {
            act.latitude = resolvedCoords.lat;
            act.longitude = resolvedCoords.lng;
            usedPlaces.push(act.place);
          } else {
            // Find a replacement from candidate list
            let replacementFound = false;
            
            for (let p = 0; p < uniqueCandidates.length; p++) {
              const candidate = uniqueCandidates[p];
              
              let isCandidateUsed = false;
              for (const used of usedPlaces) {
                if (isSemanticDuplicate(candidate.name, used, destination)) {
                  isCandidateUsed = true;
                  break;
                }
              }
              
              if (isCandidateUsed) {
                continue;
              }

              // Verify candidate geocoding
              logger.info(`Verifying replacement candidate "${candidate.name}"...`);
              const candidateCoords = await validateAndGeocodeActivity(candidate.name, destination, dCoords);
              await new Promise((resolve) => setTimeout(resolve, 1050));

              if (candidateCoords) {
                logger.info(`[REPAIR SUCCESS] Replaced "${act.place}" with verified place "${candidate.name}"`);
                act.place = candidate.name;
                act.description = candidate.description;
                act.category = candidate.category;
                act.estimatedCost = candidate.estimatedCost;
                act.latitude = candidateCoords.lat;
                act.longitude = candidateCoords.lng;
                
                usedPlaces.push(candidate.name);
                uniqueCandidates.splice(p, 1); // remove from pool
                replacementFound = true;
                break;
              } else {
                logger.info(`Candidate "${candidate.name}" failed geocoding/boundary checks. Trying next.`);
              }
            }

            if (!replacementFound) {
              throw new Error(`Activity "${act.place}" could not be repaired: no unique verified replacement places found`);
            }
          }
        }
      }

      // Final validation check
      validateItineraryStructureAndDuplicates(itin, destination, startDate, endDate);
      await geocodeAndValidateCoordinates(itin, destination, dCoords);
    };

    // Resolve destination coordinates first (needed for both repair pool and geocoding)
    let destCoords = { lat: 15.2993, lng: 74.1240 }; // default Goa
    if (req.body.coordinates && typeof req.body.coordinates === 'object') {
      const lat = parseFloat(req.body.coordinates.lat);
      const lng = parseFloat(req.body.coordinates.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        destCoords = { lat, lng };
      }
    } else {
      try {
        const result = await mapsService.geocodeLocation(req.body.destination);
        if (result) {
          destCoords = { lat: result.latitude, lng: result.longitude };
        }
      } catch (err) {
        logger.error(`Failed to geocode destination "${req.body.destination}": ${err.message}`);
      }
    }

    // 1. Generate itinerary details with validation retry
    let itinerary = null;
    let attempts = 0;
    const maxAttempts = 2;
    let lastError = null;

    const genStart = Date.now();
    while (attempts < maxAttempts) {
      try {
        attempts++;
        logger.info(`[OPENAI START] attempt ${attempts}/${maxAttempts}`);
        const attemptStart = Date.now();
        const correctiveInstruction = attempts > 1 ? lastError?.message : null;
        itinerary = await openaiService.generateItinerary(req.body, correctiveInstruction);
        logger.info(`[OPENAI END] attempt ${attempts} duration: ${Date.now() - attemptStart}ms`);

        // Validate structure & duplicates, then geocode & validate coords
        validateItineraryStructureAndDuplicates(itinerary, req.body.destination, req.body.startDate, req.body.endDate);
        await geocodeAndValidateCoordinates(itinerary, req.body.destination, destCoords);
        break; // Success!
      } catch (err) {
        lastError = err;
        logger.warn(`[VALIDATION FAILED] attempt ${attempts}: ${err.message}`);
      }
    }

    // If both attempts failed, perform Controlled Backend Repair
    if (attempts >= maxAttempts && lastError) {
      logger.info(`[CONTROLLED REPAIR START] attempting repair on latest generated itinerary...`);
      try {
        await repairItinerary(itinerary, req.body.destination, destCoords, req.body.startDate, req.body.endDate);
        logger.info(`[CONTROLLED REPAIR SUCCESS] Itinerary successfully repaired.`);
      } catch (repairErr) {
        logger.error(`[CONTROLLED REPAIR FAILED]: ${repairErr.message}`);
        logger.info(`[GENERATION END] total: ${Date.now() - pipelineStart}ms (FAILED)`);
        return res.status(422).json({
          success: false,
          message: `Failed to generate a valid itinerary: ${repairErr.message}. Original error: ${lastError.message}`,
        });
      }
    }

    logger.info(`[GENERATION PHASE] total: ${Date.now() - genStart}ms (${attempts} attempt(s))`);

    // Extract first activity coordinates for overall trip coordinates mapping
    let defaultCoords = destCoords;
    if (itinerary.days && itinerary.days[0] && itinerary.days[0].activities && itinerary.days[0].activities[0]) {
      const firstAct = itinerary.days[0].activities[0];
      if (typeof firstAct.latitude === 'number' && typeof firstAct.longitude === 'number') {
        defaultCoords = { lat: firstAct.latitude, lng: firstAct.longitude };
      }
    }

    // 2. Map structured AI response to MongoDB Trip schema format
    const tripData = {
      destination: req.body.destination,
      coordinates: defaultCoords,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      travelers: Number(req.body.travelers),
      budget: Number(req.body.budget),
      currency: req.body.currency || 'INR',
      interests: req.body.interests || [],
      travelStyle: req.body.travelStyle || 'balanced',
      accommodation: req.body.accommodation || 'Hotel',
      foodPreferences: req.body.foodPreferences || ['local'],
      transportation: req.body.transportation || 'Metro',
      summary: itinerary.summary,
      itinerary: itinerary.days.map((d) => ({
        dayNumber: d.dayNumber,
        theme: d.theme,
        activities: d.activities.map((a) => ({
          time: a.time,
          title: a.place,
          description: a.description,
          location: a.place,
          coordinates: { lat: a.latitude, lng: a.longitude },
          cost: a.estimatedCost || 0,
          duration: a.duration || 60,
        })),
      })),
      budgetBreakdown: itinerary.budgetBreakdown,
      tips: itinerary.tips,
      packingList: itinerary.packingList,
      isPublic: req.body.isPublic || false,
    };

    // 3. Save to database via TripService
    const dbStart = Date.now();
    logger.info(`[DATABASE SAVE START]`);
    const trip = await tripService.createTrip(req.user._id, tripData);
    logger.info(`[DATABASE SAVE END] duration: ${Date.now() - dbStart}ms`);
    logger.info(`[GENERATION END] total: ${Date.now() - pipelineStart}ms — trip: ${trip._id} for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Itinerary generated and saved successfully',
      data: { trip },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateItinerary,
  aiValidation,
};
