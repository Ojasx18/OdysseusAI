const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const apiLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const routes = require('./routes');

const app = express();
const httpServer = createServer(app);

// Socket.IO initialization (no event handlers yet)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Start listening immediately so the API is available
  httpServer.listen(config.port, () => {
    logger.info(`VoyageAI server running on port ${config.port} (${config.nodeEnv})`);
    const isWeatherConfigured = config.openweatherApiKey && config.openweatherApiKey !== 'your_openweather_api_key_here';
    logger.info(`OPENWEATHER_API_KEY configured: ${!!isWeatherConfigured}`);
  });

  // Attempt MongoDB connection (graceful — server runs regardless)
  connectDB(config.mongodbUri);
};

startServer();
