require('dotenv').config();
const express = require('express');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://gattini-innamorati.netlify.app';
const ALLOW_ANY_ORIGIN = process.env.ALLOW_ANY_ORIGIN === 'true';

app.use(express.json());

// CORS and preflight handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow any origin when ALLOW_ANY_ORIGIN=true; otherwise allow known frontend + netlify previews + localhost.
  const allowed = ALLOW_ANY_ORIGIN
    ? true
    : origin &&
      [FRONTEND_ORIGIN, /\.netlify\.app$/, /^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]
        .filter(Boolean)
        .some((o) => (typeof o === 'string' ? o === origin : o.test(origin)));

  if (allowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/api', messageRoutes);

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
