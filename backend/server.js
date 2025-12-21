const path = require('path');
require('dotenv').config();
const express = require('express');

// const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  FRONTEND_ORIGIN,
  /\.netlify\.app$/,
  'http://localhost:5173',
  'http://localhost:4173'
];

if (
  origin &&
  allowedOrigins.some(o =>
    o instanceof RegExp ? o.test(origin) : o === origin
  )
) {
  res.header('Access-Control-Allow-Origin', origin);
}

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data.json');

app.use(express.json());

// Simple CORS allowlist for frontend origin (Netlify or localhost).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    FRONTEND_ORIGIN,
    'http://localhost:4173',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:4173'
  ].filter(Boolean);
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// TODO static hosting: serve ../frontend build output when ready

// app.use('/api', messageRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Export app for serverless (Vercel) and start server when run directly.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gattini API listening on port ${PORT}`);
  });
}

module.exports = app;
