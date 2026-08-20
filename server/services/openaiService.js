const { OpenAI } = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const mapsService = require('./mapsService');
const curatedPools = require('../utils/curatedPools');

// Initialize OpenAI client
let openai = null;
const isApiKeyValid = config.openaiApiKey && 
  config.openaiApiKey !== 'your_openai_api_key_here' && 
  config.openaiApiKey.trim() !== '';

if (isApiKeyValid) {
  openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });
  logger.info('OpenAI client initialized successfully with API key.');
} else {
  logger.warn('OpenAI API key is missing or holds placeholder value. Running in offline mock fallback mode.');
}

/**
 * Generate a realistic mock itinerary (fallback mode)
 */
const generateMockItineraryFallback = async (params) => {
  const {
    destination,
    startDate,
    endDate,
    travelers,
    budget,
    currency = 'INR',
    interests = [],
    travelStyle = 'balanced',
    accommodation = 'Hotel',
    foodPreferences = ['local'],
    transportation = 'Metro',
  } = params;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  const daysCount = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);

  // Mock coordinates based on destination
  const getMockCoords = async (destName) => {
    try {
      const geo = await mapsService.geocodeLocation(destName);
      if (geo) {
        return { lat: geo.latitude, lng: geo.longitude };
      }
    } catch (err) {
      logger.warn(`Failed to geocode destination "${destName}" during fallback initialization: ${err.message}`);
    }
    const dest = destName.toLowerCase();
    if (dest.includes('paris')) return { lat: 48.8566, lng: 2.3522 };
    if (dest.includes('tokyo')) return { lat: 35.6762, lng: 139.6503 };
    if (dest.includes('new york') || dest.includes('nyc')) return { lat: 40.7128, lng: -74.0060 };
    if (dest.includes('bali')) return { lat: -8.4095, lng: 115.1889 };
    if (dest.includes('rome')) return { lat: 41.9028, lng: 12.4964 };
    if (dest.includes('london')) return { lat: 51.5074, lng: -0.1278 };
    if (dest.includes('goa')) return { lat: 15.2993, lng: 74.1240 };
    if (dest.includes('mumbai')) return { lat: 19.0760, lng: 72.8777 };
    if (dest.includes('delhi')) return { lat: 28.6139, lng: 77.2090 };
    if (dest.includes('mussoorie')) return { lat: 30.4599, lng: 78.0664 };
    if (dest.includes('jaipur')) return { lat: 26.9124, lng: 75.7873 };
    if (dest.includes('chicago')) return { lat: 41.8781, lng: -87.6298 };
    return { lat: 37.7749, lng: -122.4194 }; // San Francisco
  };

  // Try to use coordinates passed from request body, else fallback to name mapping
  let coords = null;
  if (params.coordinates && typeof params.coordinates === 'object') {
    const lat = parseFloat(params.coordinates.lat);
    const lng = parseFloat(params.coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      coords = { lat, lng };
    }
  }

  if (!coords) {
    coords = await getMockCoords(destination);
  }

  // Query Overpass for real POIs if it's not a curated city
  const destLower = destination.toLowerCase();
  const curatedDestinations = ['goa', 'mussoorie', 'paris', 'tokyo', 'london', 'jaipur', 'delhi', 'mumbai', 'chicago'];
  const isCurated = curatedDestinations.some(d => destLower.includes(d));

  let fetchedPlaces = [];
  if (!isCurated) {
    try {
      logger.info(`Fetching real places for fallback destination "${destination}" via Overpass...`);
      const attractions = await mapsService.searchNearbyPlaces(coords.lat, coords.lng, 'attractions', 10000);
      const cafes = await mapsService.searchNearbyPlaces(coords.lat, coords.lng, 'cafes', 10000);
      const restaurants = await mapsService.searchNearbyPlaces(coords.lat, coords.lng, 'restaurants', 10000);
      
      const seenNames = new Set();
      const rawPlaces = [...attractions, ...cafes, ...restaurants];
      
      for (const p of rawPlaces) {
        if (p.name && !p.name.includes('Unnamed') && !seenNames.has(p.name.toLowerCase())) {
          seenNames.add(p.name.toLowerCase());
          fetchedPlaces.push(p);
        }
      }
      logger.info(`Successfully retrieved ${fetchedPlaces.length} real places for "${destination}"`);
    } catch (err) {
      logger.warn(`Could not fetch dynamic places from Overpass: ${err.message}`);
    }
  }

  const totalBudget = Number(budget) || 40000;

  const getDailyActivities = (dayNum, destName, interestsList, foodPrefs, style) => {
    const dest = destName.toLowerCase();
    
    // Goa Specific
    if (dest.includes('goa')) {
      const goaDays = [
        [
          { time: '09:00 AM', place: 'Calangute Beach', duration: 180, category: 'sightseeing', estimatedCost: 200, description: 'Explore the vibrant beaches of North Goa, offering water sports, beach shacks, and golden sands.' },
          { time: '01:00 PM', place: "Fisherman's Cove, Candolim", duration: 90, category: 'dining', estimatedCost: 600, description: 'Savor authentic Goan fish curry, peri-peri prawns, and local delicacies.' },
          { time: '03:30 PM', place: 'Fort Aguada', duration: 120, category: 'culture', estimatedCost: 100, description: 'Visit the 17th-century Portuguese lighthouse and fort offering sweeping views of the Arabian Sea.' }
        ],
        [
          { time: '09:00 AM', place: 'Basilica of Bom Jesus', duration: 180, category: 'culture', estimatedCost: 0, description: 'Explore the UNESCO World Heritage site holding the remains of St. Francis Xavier.' },
          { time: '01:00 PM', place: 'Viva Panjim', duration: 90, category: 'dining', estimatedCost: 500, description: 'Dine on heritage Goan-Portuguese fusion cuisine in a restored colonial villa.' },
          { time: '03:30 PM', place: 'Fontainhas', duration: 120, category: 'sightseeing', estimatedCost: 150, description: 'Stroll through the narrow winding streets of Panaji\'s Latin Quarter, lined with colorful Portuguese homes.' }
        ],
        [
          { time: '09:00 AM', place: 'Anjuna Flea Market', duration: 180, category: 'shopping', estimatedCost: 300, description: 'Browse local handicrafts, spices, garments, and souvenirs at the famous beachfront flea market.' },
          { time: '01:00 PM', place: 'Curlies, Anjuna', duration: 90, category: 'dining', estimatedCost: 400, description: 'Relax with chilled drinks and continental/local bites under the shade of coconut palms.' },
          { time: '03:30 PM', place: 'Chapora Fort', duration: 120, category: 'sightseeing', estimatedCost: 0, description: 'Walk up to the iconic fort ruins popular from Bollywood movies, overlooking Vagator Beach.' }
        ],
        [
          { time: '09:00 AM', place: 'Sahakari Spice Farm', duration: 180, category: 'sightseeing', estimatedCost: 800, description: 'Enjoy a guided walk through lush spice gardens, learn about spice cultivation, and get a traditional welcome.' },
          { time: '01:00 PM', place: 'Mangueshi Temple', duration: 90, category: 'culture', estimatedCost: 0, description: 'Explore the landmark 450-year-old temple dedicated to Lord Manguesh in Priol.' },
          { time: '03:30 PM', place: 'Dudhsagar Waterfalls', duration: 120, category: 'sightseeing', estimatedCost: 400, description: 'Witness the majestic four-tiered waterfall cascading down the Western Ghats.' }
        ]
      ];
      return goaDays[(dayNum - 1) % goaDays.length];
    }

    // Mussoorie Specific
    if (dest.includes('mussoorie')) {
      const mussoorieDays = [
        [
          { time: '09:00 AM', place: 'Mussoorie Mall Road', duration: 120, category: 'sightseeing', estimatedCost: 100, description: 'Stroll along the famous Mall Road, browse local shops, and enjoy scenic valley views.' },
          { time: '01:00 PM', place: 'Kalsang Friends Corner', duration: 90, category: 'dining', estimatedCost: 500, description: 'Savor delicious Tibetan and Chinese delicacies at a local favorite restaurant.' },
          { time: '03:30 PM', place: 'Gun Hill Mussoorie', duration: 120, category: 'sightseeing', estimatedCost: 150, description: 'Take the cable car to Mussoorie\'s second highest peak for a panoramic view of the Himalayas.' }
        ],
        [
          { time: '09:00 AM', place: 'Kempty Falls', duration: 180, category: 'sightseeing', estimatedCost: 200, description: 'Enjoy the cool water cascade of the famous Kempty Falls, surrounded by mountain cliffs.' },
          { time: '01:00 PM', place: 'Company Garden', duration: 90, category: 'nature', estimatedCost: 50, description: 'Walk through colorful flowerbeds, visit the small artificial waterfall and lake.' },
          { time: '03:30 PM', place: 'Mussoorie Lake', duration: 120, category: 'nature', estimatedCost: 100, description: 'Enjoy pedal boating and snacks at the scenic artificial lake along the Dehradun-Mussoorie road.' }
        ],
        [
          { time: '09:00 AM', place: 'Lal Tibba', duration: 120, category: 'sightseeing', estimatedCost: 100, description: 'Visit the highest point in Landour for mesmerizing telescope views of the snow-clad peaks.' },
          { time: '01:00 PM', place: 'Landour Bakehouse', duration: 90, category: 'dining', estimatedCost: 600, description: 'Relax at the historic bakery, tasting fresh crepes, lemon tarts, and freshly brewed coffee.' },
          { time: '03:30 PM', place: 'Sisters Bazaar', duration: 120, category: 'shopping', estimatedCost: 200, description: 'Explore the quiet colonial bazaar of Landour, famous for homemade cheese, jams, and peanut butter.' }
        ],
        [
          { time: '09:00 AM', place: 'George Everest House', duration: 180, category: 'culture', estimatedCost: 100, description: 'Trek up to the historic house and laboratory of surveyor Sir George Everest.' },
          { time: '01:00 PM', place: 'Little Llama Cafe', duration: 90, category: 'dining', estimatedCost: 500, description: 'Enjoy pizza, burgers, and shakes on the terrace of this popular library-area cafe.' },
          { time: '03:30 PM', place: 'Library Bazaar', duration: 120, category: 'shopping', estimatedCost: 150, description: 'Stroll around the bustling library intersection and browse local woolen markets.' }
        ]
      ];
      return mussoorieDays[(dayNum - 1) % mussoorieDays.length];
    }
    
    // Paris Specific
    if (dest.includes('paris')) {
      const parisDays = [
        [
          { time: '09:00 AM', place: 'Eiffel Tower', duration: 120, category: 'sightseeing', estimatedCost: 2500, description: 'Ascend the iconic Eiffel Tower for sweeping panoramic views of the Paris skyline.' },
          { time: '01:00 PM', place: 'Bistro de la Tour Eiffel', duration: 90, category: 'dining', estimatedCost: 1500, description: 'Enjoy a classic French lunch alongside the River Seine.' },
          { time: '03:00 PM', place: 'Louvre Museum', duration: 180, category: 'culture', estimatedCost: 1800, description: 'Explore masterpieces of world art, including the Mona Lisa and Venus de Milo.' }
        ],
        [
          { time: '09:00 AM', place: 'Notre-Dame Cathedral', duration: 90, category: 'culture', estimatedCost: 0, description: 'Admire the Gothic architecture of the legendary Notre-Dame Cathedral.' },
          { time: '11:30 AM', place: 'Shakespeare and Company', duration: 90, category: 'sightseeing', estimatedCost: 0, description: 'Explore the legendary English-language bookshop in Paris.' },
          { time: '01:00 PM', place: 'Cafe de Flore', duration: 90, category: 'dining', estimatedCost: 1200, description: 'Dine at the legendary Parisian café frequented by famous philosophers and artists.' }
        ],
        [
          { time: '09:00 AM', place: 'Palace of Versailles', duration: 240, category: 'culture', estimatedCost: 2000, description: 'Visit the grand residence of the French monarchy, including the Hall of Mirrors.' },
          { time: '01:30 PM', place: 'La Flottille', duration: 90, category: 'dining', estimatedCost: 1500, description: 'Dine near the Grand Canal in the Palace of Versailles gardens.' },
          { time: '03:30 PM', place: 'Gardens of Versailles', duration: 120, category: 'sightseeing', estimatedCost: 0, description: 'Stroll around the magnificent fountains and groves designed by André Le Nôtre.' }
        ]
      ];
      return parisDays[(dayNum - 1) % parisDays.length];
    }

    // Tokyo Specific
    if (dest.includes('tokyo')) {
      const tokyoDays = [
        [
          { time: '09:00 AM', place: 'Shibuya Crossing', duration: 120, category: 'sightseeing', estimatedCost: 0, description: 'Experience the world\'s busiest pedestrian intersection.' },
          { time: '01:00 PM', place: 'Ichiran Ramen Shibuya', duration: 90, category: 'dining', estimatedCost: 1200, description: 'Enjoy legendary tonkotsu ramen in your own private dining booth.' },
          { time: '03:00 PM', place: 'Meiji Jingu Shrine', duration: 120, category: 'culture', estimatedCost: 0, description: 'Walk through the giant torii gate into Tokyo\'s most famous Shinto shrine forest.' }
        ],
        [
          { time: '09:00 AM', place: 'Senso-ji Temple', duration: 150, category: 'culture', estimatedCost: 0, description: 'Explore Tokyo\'s oldest and most iconic Buddhist temple complex.' },
          { time: '01:00 PM', place: 'Asakusa Imahan', duration: 90, category: 'dining', estimatedCost: 3500, description: 'Dine on premium black Wagyu beef sukiyaki and shabu-shabu.' },
          { time: '03:30 PM', place: 'Akihabara', duration: 150, category: 'shopping', estimatedCost: 500, description: 'Browse multi-story anime, gaming, manga, and retro electronics stores.' }
        ]
      ];
      return tokyoDays[(dayNum - 1) % tokyoDays.length];
    }

    // London Specific
    if (dest.includes('london')) {
      const londonDays = [
        [
          { time: '09:00 AM', place: 'British Museum', duration: 180, category: 'culture', estimatedCost: 0, description: 'Explore human history, art, and culture through millions of works.' },
          { time: '01:00 PM', place: 'Dishoom', duration: 90, category: 'dining', estimatedCost: 2000, description: 'Taste legendary Bombay-style street food and grills.' },
          { time: '03:30 PM', place: 'London Eye', duration: 90, category: 'sightseeing', estimatedCost: 3000, description: 'Take a flight on the giant observation wheel for spectacular skyline views.' }
        ],
        [
          { time: '09:00 AM', place: 'Tower of London', duration: 180, category: 'culture', estimatedCost: 2800, description: 'Discover the historic fortress and home of the Crown Jewels.' },
          { time: '01:00 PM', place: 'Borough Market', duration: 90, category: 'dining', estimatedCost: 1000, description: 'Sample delicious street eats at London\'s oldest food market.' },
          { time: '03:30 PM', place: 'Tower Bridge', duration: 120, category: 'sightseeing', estimatedCost: 1200, description: 'Walk across the high-level glass floor and see the Victorian engine rooms.' }
        ]
      ];
      return londonDays[(dayNum - 1) % londonDays.length];
    }

    // Chicago Specific
    if (dest.includes('chicago')) {
      const chicagoDays = [
        [
          { time: '09:00 AM', place: 'Millennium Park', duration: 120, category: 'sightseeing', estimatedCost: 0, description: 'Explore the famous park home to the iconic Cloud Gate sculpture ("The Bean").' },
          { time: '01:00 PM', place: 'Art Institute of Chicago', duration: 180, category: 'culture', estimatedCost: 2500, description: 'Visit one of the oldest and largest art museums in the United States.' },
          { time: '04:30 PM', place: 'Chicago Riverwalk', duration: 90, category: 'sightseeing', estimatedCost: 0, description: 'Stroll along the scenic path lined with restaurants, museums, and architecture.' }
        ],
        [
          { time: '09:00 AM', place: 'Navy Pier', duration: 150, category: 'sightseeing', estimatedCost: 0, description: 'Enjoy rides, shops, eateries, and lakefront views at this 3,300-foot-long pier.' },
          { time: '01:00 PM', place: 'Time Out Market', duration: 90, category: 'dining', estimatedCost: 1500, description: 'Savor diverse culinary options in a vibrant food hall in the Fulton Market district.' },
          { time: '03:00 PM', place: 'Museum Campus', duration: 120, category: 'culture', estimatedCost: 1800, description: 'Walk through the scenic park area housing the Adler Planetarium, Shedd Aquarium, and Field Museum.' }
        ],
        [
          { time: '09:00 AM', place: 'Lincoln Park Zoo', duration: 120, category: 'nature', estimatedCost: 0, description: 'Visit the historic, free admission zoo located within Lincoln Park.' },
          { time: '01:00 PM', place: "Pequod's Pizza", duration: 90, category: 'dining', estimatedCost: 1200, description: 'Dine on Chicago\'s famous caramelized-crust deep dish pizza.' },
          { time: '03:00 PM', place: 'Wrigley Field', duration: 120, category: 'sightseeing', estimatedCost: 500, description: 'View the iconic home stadium of the Chicago Cubs, built in 1914.' }
        ]
      ];
      return chicagoDays[(dayNum - 1) % chicagoDays.length];
    }

    // Jaipur Specific
    if (dest.includes('jaipur')) {
      const jaipurDays = [
        [
          { time: '09:00 AM', place: 'Hawa Mahal', duration: 90, category: 'sightseeing', estimatedCost: 100, description: 'Admire the famous palace of winds with its honeycomb-like pink facade.' },
          { time: '11:00 AM', place: 'City Palace', duration: 120, category: 'culture', estimatedCost: 500, description: 'Explore the royal residence, heritage museums, and beautiful courtyards.' },
          { time: '01:00 PM', place: 'Laxmi Mishthan Bhandar', duration: 90, category: 'dining', estimatedCost: 600, description: 'Feast on traditional Rajasthani Dal Baati Churma and sweet Ghewar.' }
        ],
        [
          { time: '09:00 AM', place: 'Amber Palace', duration: 180, category: 'culture', estimatedCost: 200, description: 'Visit the magnificent hilltop fort famous for its artistic Hindu-style elements.' },
          { time: '01:00 PM', place: '1135 AD', duration: 90, category: 'dining', estimatedCost: 800, description: 'Enjoy dining inside the grand Amer Fort ramparts.' },
          { time: '03:30 PM', place: 'Jal Mahal', duration: 60, category: 'sightseeing', estimatedCost: 0, description: 'View the stunning water palace floating in the middle of the lake.' }
        ]
      ];
      return jaipurDays[(dayNum - 1) % jaipurDays.length];
    }

    // Default Dynamic Generator for other destinations
    const interestStr = interestsList.length > 0 ? interestsList.join(', ') : 'sightseeing';
    const foodPrefStr = foodPrefs.length > 0 ? foodPrefs.join(', ') : 'local';

    if (fetchedPlaces && fetchedPlaces.length >= dayNum * 3) {
      const startIndex = (dayNum - 1) * 3;
      const acts = [];
      const defaultCategories = ['sightseeing', 'dining', 'culture'];
      for (let j = 0; j < 3; j++) {
        const placeObj = fetchedPlaces[startIndex + j];
        acts.push({
          time: j === 0 ? '09:00 AM' : j === 1 ? '01:00 PM' : '03:30 PM',
          place: placeObj.name,
          duration: j === 0 ? 180 : j === 1 ? 90 : 120,
          category: placeObj.category || defaultCategories[j],
          estimatedCost: j === 1 ? 600 : j === 2 ? 300 : 0,
          description: `Visit the famous ${placeObj.name} in ${destName} matching interests: ${interestStr}.`
        });
      }
      return acts;
    }

    const sights = [
      'Central Museum & Art Gallery',
      'Botanical Gardens & Conservation Area',
      'Historic Palace & Fort ruins',
      'Oceanfront Promenade & Pier'
    ];
    const dinings = [
      'Heritage Cafe & Kitchen',
      'Royal Pavilion Grillhouse',
      'Spiceland Traditional Restaurant',
      'Riverside Bistro & Teahouse'
    ];
    const cultures = [
      'Viewpoint Park & Valley Lookout',
      'Art Craft & Souvenir Arcade',
      'Lakeside Amphitheater Walk',
      'Colonial Observatory Hill'
    ];

    const idx = (dayNum - 1) % 4;

    return [
      {
        time: '09:00 AM',
        place: `${destName} ${sights[idx]}`,
        duration: 180,
        category: 'sightseeing',
        estimatedCost: Math.floor(totalBudget * 0.02),
        description: `Explore the historical collections and regional features of ${destName} matching interests: ${interestStr}.`
      },
      {
        time: '01:00 PM',
        place: `${destName} ${dinings[idx]}`,
        duration: 90,
        category: 'dining',
        estimatedCost: Math.floor(totalBudget * 0.015),
        description: `Indulge in authentic traditional food and specialty cuisine of the region matching food preferences: ${foodPrefStr}.`
      },
      {
        time: '03:30 PM',
        place: `Mount ${destName} ${cultures[idx]}`,
        duration: 120,
        category: 'culture',
        estimatedCost: Math.floor(totalBudget * 0.025),
        description: `Enjoy panoramic views and scenic landscapes around the region of ${destName} suited for travel style: ${style}.`
      }
    ];
  };

  const days = [];
  const shortDestName = destination.split(',')[0].trim();
  for (let i = 1; i <= daysCount; i++) {
    const dailyActs = getDailyActivities(i, shortDestName, interests, foodPreferences, travelStyle);
    days.push({
      dayNumber: i,
      theme: `Explore ${destination} - Day ${i}`,
      activities: dailyActs.map((act) => ({
        time: act.time,
        place: act.place,
        description: act.description,
        duration: act.duration,
        category: act.category,
        estimatedCost: act.estimatedCost,
        latitude: coords.lat + (Math.random() - 0.5) * 0.02,
        longitude: coords.lng + (Math.random() - 0.5) * 0.02,
      })),
    });
  }

  // Populate candidatePool for the fallback response
  const candidatePool = [];
  const shortDest = destination.split(',')[0].trim().toLowerCase();
  let extraPlaces = [];
  const matchedKey = Object.keys(curatedPools).find(k => shortDest.includes(k));
  if (matchedKey) {
    extraPlaces = curatedPools[matchedKey];
  } else if (fetchedPlaces && fetchedPlaces.length > 0) {
    extraPlaces = fetchedPlaces.map(p => ({
      name: p.name,
      description: `Visit the popular ${p.name} in ${destination}.`,
      category: p.category || 'sightseeing',
      estimatedCost: p.category === 'dining' ? 600 : 0
    }));
  }

  const addedNames = new Set();
  for (const day of days) {
    for (const act of day.activities) {
      if (!addedNames.has(act.place.toLowerCase())) {
        addedNames.add(act.place.toLowerCase());
        candidatePool.push({
          name: act.place,
          description: act.description,
          category: act.category,
          estimatedCost: act.estimatedCost || 0
        });
      }
    }
  }

  for (const extra of extraPlaces) {
    if (candidatePool.length >= 20) break;
    if (!addedNames.has(extra.name.toLowerCase())) {
      addedNames.add(extra.name.toLowerCase());
      candidatePool.push({
        name: extra.name,
        description: extra.description,
        category: extra.category,
        estimatedCost: extra.estimatedCost || extra.cost || 0
      });
    }
  }

  return {
    summary: `Curated 5-star AI trip itinerary exploring ${destination} for ${travelers} travelers. Customized for interests: ${interests.join(', ')}. Accommodation: ${accommodation}, Transport: ${transportation}.`,
    candidatePool,
    days,
    budgetBreakdown: {
      accommodation: Math.floor(totalBudget * 0.45),
      food: Math.floor(totalBudget * 0.20),
      transportation: Math.floor(totalBudget * 0.10),
      activities: Math.floor(totalBudget * 0.15),
      other: Math.floor(totalBudget * 0.10),
      total: totalBudget,
    },
    tips: [
      `Secure bookings in advance for popular sightseeing spots.`,
      `Leverage ${transportation} systems to cut down transit overheads.`,
      `Double-check dress codes for historical temples and landmarks.`,
    ],
    packingList: [
      `Passports and travel documentation`,
      `Local currency (${currency}) and card options`,
      `Comfortable walking shoes`,
      `Appropriate clothing based on seasonal weather forecast`,
    ],
  };
};

/**
 * AI Itinerary Generation service with retry/fallback
 */
const generateItinerary = async (params, correctiveInstruction = null) => {
  // Validate basic parameters
  if (!params.destination || !params.startDate || !params.endDate) {
    throw new Error('Destination, startDate, and endDate are required');
  }

  // Fallback if client is uninitialized (missing API key)
  if (!openai) {
    logger.info('OpenAI key missing. Generating mock itinerary details directly.');
    return generateMockItineraryFallback(params);
  }

  const start = new Date(params.startDate);
  const end = new Date(params.endDate);
  const diff = end - start;
  const daysCount = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
  const requiredCount = daysCount * 3;
  const poolSize = Math.max(20, Math.floor(requiredCount * 1.8));

  let prompt = `
Generate a structured day-by-day travel itinerary for:
- Destination: ${params.destination}
- Start Date: ${params.startDate}
- End Date: ${params.endDate}
- Travelers: ${params.travelers}
- Budget Limit: ${params.budget} ${params.currency || 'INR'}
- Travel Style: ${params.travelStyle || 'balanced'}
- Accommodation: ${params.accommodation || 'Hotel'}
- Food Preferences: ${params.foodPreferences ? params.foodPreferences.join(', ') : 'local'}
- Transportation Preferred: ${params.transportation || 'Metro'}
- Interests: ${params.interests ? params.interests.join(', ') : 'sightseeing'}

Instructions for Activities:
1. Every day must have a distinct geographical theme and unique, real attractions/places.
2. DO NOT repeat the same attraction or restaurant across different days.
3. Every activity place name MUST be a real, highly specific local place, attraction, restaurant, cafe, or experience in the destination. DO NOT use generic templates or placeholders like "Landmark Exploration", "Gastronomy Experience", or "Cultural Highlights". Use real names (e.g. "Lal Tibba Scenic Point", "Landour Bakehouse", "Baga Beach", "Basilica of Bom Jesus").
4. Morning, afternoon, and evening must have different activities.
5. All monetary values, budget numbers, and activity costs MUST be expressed as integer numbers representing ${params.currency || 'INR'} (Indian Rupees). Do NOT include any currency symbols or formatting characters like commas in the JSON numbers.
6. DO NOT invent or include latitude and longitude coordinates.

CRITICAL RULES FOR DUPLICATE PREVENTION:
- Each day must have different primary attractions. Do not repeat the same attraction across multiple days.
- Do not repeat the same attraction under a slightly different name.
- Do not combine two already-used attractions into a new activity name (e.g., if "Shibuya Crossing" is used on Day 1, do not output "Shibuya Crossing and Hachiko Statue" or "Shibuya & Hachiko" on Day 2/3/4).
- Do not simply rename or shuffle names of existing attractions.
- Do not append Day suffixes (e.g., "- Day 2") to make a duplicate appear different.
- Distribute attractions across the trip intelligently. Use different neighborhoods/areas on different days where practical to minimize backtracking.
- Food and nightlife can naturally involve repeated areas, but avoid repeating the exact same restaurant, cafe, or venue.

CANDIDATE POOL SELECTION STEP:
First, identify a pool of at least ${poolSize} unique, real, destination-specific places/experiences that fit the interests. Ensure they are geographically distributed around the destination. Generate and populate the JSON "candidatePool" array with this complete list of at least ${poolSize} candidates.
Then, select and assign the best ${requiredCount} places from this pool to the days. Each day must have exactly 3 activities. Every activity in the days itinerary MUST be chosen from the generated candidatePool. Do not include any activities in the days itinerary that are not present in the candidatePool.
`;

  if (correctiveInstruction) {
    prompt += `\n\nCRITICAL CORRECTION FROM PREVIOUS ATTEMPT:\nThe previous generation failed validation with error: "${correctiveInstruction}".\nYou MUST correct this error in this generation. Do not repeat the same issue. Ensure all attractions are unique, real, and match the instructions.`;
  }


  const jsonSchema = {
    name: 'itinerary',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        candidatePool: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              estimatedCost: { type: 'number' },
            },
            required: ['name', 'description', 'category', 'estimatedCost'],
            additionalProperties: false,
          },
        },
        days: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dayNumber: { type: 'integer' },
              theme: { type: 'string' },
              activities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    place: { type: 'string' },
                    description: { type: 'string' },
                    duration: { type: 'integer' },
                    category: { type: 'string' },
                    estimatedCost: { type: 'number' },
                  },
                  required: ['time', 'place', 'description', 'duration', 'category', 'estimatedCost'],
                  additionalProperties: false,
                },
              },
            },
            required: ['dayNumber', 'theme', 'activities'],
            additionalProperties: false,
          },
        },
        budgetBreakdown: {
          type: 'object',
          properties: {
            accommodation: { type: 'number' },
            food: { type: 'number' },
            transportation: { type: 'number' },
            activities: { type: 'number' },
            other: { type: 'number' },
            total: { type: 'number' },
          },
          required: ['accommodation', 'food', 'transportation', 'activities', 'other', 'total'],
          additionalProperties: false,
        },
        tips: {
          type: 'array',
          items: { type: 'string' },
        },
        packingList: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['summary', 'candidatePool', 'days', 'budgetBreakdown', 'tips', 'packingList'],
      additionalProperties: false,
    },
    strict: true,
  };

  // Implement Retry logic (max 2 retries)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      logger.info(`OpenAI itinerary request. Attempt ${attempts}/${maxAttempts}...`);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an elite travel planning AI assistant. Generate highly accurate, structured day-by-day travel itineraries customized to the traveler\'s preferences, budgets, transit modes, and dining preferences. All cost figures in the JSON must represent numbers in the specified currency (which defaults to INR / Indian Rupees).',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: jsonSchema,
        },
        temperature: 0.7,
        max_tokens: 1500,
      });

      const responseText = completion.choices[0].message.content;
      const parsedItinerary = JSON.parse(responseText);

      // Validate basic structured fields exist
      if (
        parsedItinerary.summary &&
        Array.isArray(parsedItinerary.days) &&
        parsedItinerary.budgetBreakdown &&
        Array.isArray(parsedItinerary.tips) &&
        Array.isArray(parsedItinerary.packingList)
      ) {
        logger.info('Itinerary generated successfully from OpenAI.');
        return parsedItinerary;
      }
      
      throw new Error('Response JSON missing key structured fields.');
    } catch (error) {
      logger.error(`Attempt ${attempts} failed: ${error.message}`);
      
      if (attempts >= maxAttempts) {
        logger.warn('All OpenAI API attempts failed. Falling back to generating mock itinerary details.');
        return generateMockItineraryFallback(params);
      }
      
      // Delay before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

module.exports = {
  generateItinerary,
};
