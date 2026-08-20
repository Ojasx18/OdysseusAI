const crypto = require('crypto');
const Trip = require('../models/Trip');

/**
 * Generate a unique share ID
 */
const generateShareId = () => {
  return crypto.randomBytes(8).toString('hex');
};

/**
 * Create a new trip
 */
const createTrip = async (userId, tripData) => {
  const data = { ...tripData, userId };
  
  if (!data.shareId) {
    data.shareId = generateShareId();
  }
  
  const trip = new Trip(data);
  return await trip.save();
};

/**
 * Get all trips for a user (ordered by newest first)
 */
const getUserTrips = async (userId) => {
  return await Trip.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Get a single trip by ID with ownership checks
 */
const getTripById = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  
  // Allow access if it belongs to the user, or if it is public
  if (trip.userId.toString() !== userId.toString() && !trip.isPublic) {
    throw new Error('Access denied. This is a private trip.');
  }
  
  return trip;
};

/**
 * Update a trip with ownership check
 */
const updateTrip = async (tripId, userId, updateData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  
  if (trip.userId.toString() !== userId.toString()) {
    throw new Error('Access denied. You do not own this trip.');
  }
  
  const allowedFields = [
    'destination', 'startDate', 'endDate', 'travelers', 'budget', 'currency', 
    'travelStyle', 'accommodation', 'foodPreferences', 'transportation', 
    'interests', 'isPublic'
  ];

  // Filter fields
  const filteredUpdate = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredUpdate[field] = updateData[field];
    }
  });

  // Generate share ID if it is being made public and doesn't have one
  if (filteredUpdate.isPublic && !trip.shareId && !updateData.shareId) {
    filteredUpdate.shareId = generateShareId();
  }
  
  // Update fields
  Object.assign(trip, filteredUpdate);
  return await trip.save();
};

/**
 * Delete a trip with ownership check
 */
const deleteTrip = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  
  if (trip.userId.toString() !== userId.toString()) {
    throw new Error('Access denied. You do not own this trip.');
  }
  
  await trip.deleteOne();
  return trip;
};

/**
 * Get a public trip by its share ID
 */
const getTripByShareId = async (shareId) => {
  const trip = await Trip.findOne({ shareId });
  if (!trip || !trip.isPublic) return null;
  return trip;
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripByShareId,
};
