const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:placeholder@gattini.local';

const hasVapidKeys = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (hasVapidKeys) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys missing. Push notifications are disabled until keys are provided.');
}


async function sendPush(subscription, payload = {}) {
  if (!hasVapidKeys) {
    // Skip push when keys are absent; hook in logging or buffering here later.
    return;
  }
  // Payload should be a small JSON object; stringify before sending.
  const data = JSON.stringify(payload);
  return webpush.sendNotification(subscription, data);
}

module.exports = {
  sendPush,
  VAPID_PUBLIC_KEY,
  hasVapidKeys
};
