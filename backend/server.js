require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_request, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});