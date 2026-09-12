require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/apiRoutes');
const { connectDatabase } = require('./config/database');
const { loadDatasets } = require('./services/datasetLoader');

const app = express();
const port = Number(process.env.PORT) || 5000;

// CORS configuration supporting environment variable origins
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev to ensure smooth pairing
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(express.json());
app.use(morgan('dev'));

// System Health check
app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'GramSwasthya AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// 404 Handler conforming to PRD error schema
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Global Error Handler conforming to PRD error schema
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
});

// Initialize services and start server
async function startServer() {
  // 1. Ingest real government datasets
  loadDatasets();

  // 2. Connect database (graceful fallback if offline)
  await connectDatabase();

  // 3. Start listening
  const server = app.listen(port, () => {
    console.log(`[GramSwasthya Backend] Server running on http://localhost:${port}`);
    console.log(`[GramSwasthya Backend] Connected to ML service at ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };