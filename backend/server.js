const path = require('path');
require('dotenv').config();
const express = require('express');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://gattini-innamorati.netlify.app';

const allowedOrigins = [
  FRONTEND_ORIGIN,
  /^https?:\/\/.*\.netlify\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/
].filter(Boolean);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;
  const allowed = allowedOrigins.some((o) =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );
  if (allowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
}

app.use(express.json());

// CORS and preflight handler
app.use((req, res, next) => {
  applyCors(req, res);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/api', messageRoutes);

app.get('/health', (_req, res) => {
  applyCors(_req, res);
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Export app for serverless (Vercel) and start server when run directly.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gattini API listening on port ${PORT}`);
  });
}

module.exports = app;
