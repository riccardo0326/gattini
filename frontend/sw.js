/* Basic PWA service worker; extend caching later. */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// TODO add cache logic for offline play

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Gattini update';
  const body = data.body || 'Un messaggio ti aspetta ❤️.';
  const options = {
    body,
    data: data.data || {},
    icon: data.icon || '/assets/sprites/icon-192.png',
    badge: data.badge || '/assets/sprites/icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => c.url.includes(targetUrl));
      if (client) {
        return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
