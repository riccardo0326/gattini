const express = require('express');
const router = express.Router();
const { sendPush, VAPID_PUBLIC_KEY } = require('../push');

const VALID_ROLES = new Set(['A', 'B']);
const subscriptions = new Map(); // owner -> subscription
const messages = []; // { sender, receiver, message, timestamp, seen }

function validateRole(value) {
  return VALID_ROLES.has(value);
}

// POST /api/subscribe
router.post('/subscribe', (req, res) => {
  const { owner, subscription } = req.body;
  if (!validateRole(owner) || !subscription) {
    return res.status(400).json({ ok: false, error: 'owner (A|B) and subscription required' });
  }
  subscriptions.set(owner, subscription);
  res.json({ ok: true, owner });
});

// POST /api/send-message
router.post('/send-message', async (req, res) => {
  const { sender, receiver, message, timestamp = Date.now(), seen = false } = req.body;
  if (!validateRole(sender) || !validateRole(receiver) || !message) {
    return res.status(400).json({ ok: false, error: 'sender (A|B), receiver (A|B), message required' });
  }

  const record = { sender, receiver, message, timestamp, seen: Boolean(seen) };
  messages.push(record);

  const targetSub = subscriptions.get(receiver);
  let delivered = false;
  if (targetSub) {
    try {
      await sendPush(targetSub, {
        title: 'New message',
        body: message,
        data: { sender, receiver, timestamp }
      });
      delivered = true;
    } catch (err) {
      console.error('Push send failed', err);
    }
  }

  res.json({ ok: true, delivered, message: record });
});

// GET /api/pending?owner=A
router.get('/pending', (req, res) => {
  const owner = req.query.owner;
  if (!validateRole(owner)) {
    return res.status(400).json({ ok: false, error: 'owner (A|B) required' });
  }

  const pending = messages.filter((m) => m.receiver === owner && !m.seen);
  pending.forEach((m) => { m.seen = true; });
  res.json(pending);
});

// Optional helper to expose the public VAPID key to the client when needed
router.get('/vapid-public-key', (_req, res) => {
  res.json({ key: VAPID_PUBLIC_KEY || null });
});

module.exports = router;
