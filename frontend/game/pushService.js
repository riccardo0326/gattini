// Push stub for future iOS Safari PWA support.
// Note: iOS push requires user permission and works only when the PWA is installed
// to the home screen. Real implementation will live here.

export async function sendMessage(message) {
  console.log("[pushService] sendMessage stub", message);
  // TODO: POST to backend /api/send-message with message payload and sender info.
  // TODO: on iOS Safari, ensure the app is installed to Home Screen and permission granted.
  return Promise.resolve();
}

export async function registerSubscription(owner, subscription) {
  console.log("[pushService] registerSubscription stub", { owner, subscription });
  // TODO: POST to backend /api/subscribe with { owner, subscription }.
  // TODO: handle subscription refresh/expiration.
  return Promise.resolve();
}
