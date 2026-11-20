
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow multiple frontend origins
const allowedOrigins = (
  process.env.CLIENT_URL ||
  'http://localhost:5173,http://127.0.0.1:5173,http://192.168.80.233:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error('CORS policy: Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Verify PostgreSQL connection
    await sequelize.authenticate();

    console.log(
      'PostgreSQL database connection established successfully.'
    );

    // Safely create missing database tables when explicitly enabled
    if (process.env.DB_SYNC === 'true') {
      console.log('Creating missing database tables...');

      // Does not force-drop existing tables
      await sequelize.sync();

      console.log('Database tables synchronized successfully.');
    }

    // Start application
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Store Rating Platform Backend started');
      console.log(`API running on port: ${PORT}`);
      console.log(`Health check: /api/health`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });

  } catch (error) {
    console.error('Backend startup failed:', error);
    process.exit(1);
  }
};

// Start only when executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
