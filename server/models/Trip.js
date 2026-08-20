const mongoose = require('mongoose');

// Coordinates Schema
const coordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

// Activity Schema
const activitySchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  coordinates: coordinatesSchema,
  cost: { type: Number, default: 0 },
  duration: { type: Number }, // in minutes or hours
}, { _id: false });

// Day Schema
const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  theme: { type: String },
  activities: [activitySchema],
}, { _id: false });

// Budget Breakdown Schema
const budgetBreakdownSchema = new mongoose.Schema({
  accommodation: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  transportation: { type: Number, default: 0 },
  activities: { type: Number, default: 0 },
  other: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
}, { _id: false });

// Weather Daily Forecast Schema
const weatherForecastSchema = new mongoose.Schema({
  date: { type: String },
  temp: { type: Number },
  condition: { type: String },
}, { _id: false });

// Weather Schema
const weatherSchema = new mongoose.Schema({
  averageTemp: { type: Number },
  condition: { type: String },
  forecast: [weatherForecastSchema],
}, { _id: false });

// Main Trip Schema
const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip must belong to a user'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    coordinates: {
      type: coordinatesSchema,
      required: [true, 'Destination coordinates are required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    travelers: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: [1, 'Must have at least 1 traveler'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    travelStyle: {
      type: String,
      trim: true,
    },
    accommodation: {
      type: String,
      trim: true,
    },
    foodPreferences: [
      {
        type: String,
        trim: true,
      },
    ],
    transportation: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    itinerary: [daySchema],
    budgetBreakdown: {
      type: budgetBreakdownSchema,
      default: () => ({}),
    },
    weather: {
      type: weatherSchema,
      default: null,
    },
    packingList: [
      {
        type: String,
        trim: true,
      },
    ],
    tips: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate budget breakdown total before save
tripSchema.pre('save', function (next) {
  if (this.budgetBreakdown) {
    const bd = this.budgetBreakdown;
    bd.total = (bd.accommodation || 0) + (bd.food || 0) + (bd.transportation || 0) + (bd.activities || 0) + (bd.other || 0);
  }
  next();
});

// Indexing for faster queries
tripSchema.index({ userId: 1 });

module.exports = mongoose.model('Trip', tripSchema);
