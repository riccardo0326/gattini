// Push helper for registration and messaging.
// Note: iOS push requires user permission and works only when the PWA is installed to the home screen.

const apiMeta = document.querySelector('meta[name="gattini-api-base"]');
const API_BASE = (apiMeta && apiMeta.getAttribute('content')) || window.__GATTINI_API_BASE__ || '/api';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export async function getPublicVapidKey() {
  const res = await fetch(`${API_BASE}/vapid-public-key`);
  if (!res.ok) throw new Error('Failed to fetch VAPID key');
  const data = await res.json();
  return data.key;
}

export async function subscribeToPush(registration, publicKey) {
  if (!registration?.pushManager) return null;
  const key = urlBase64ToUint8Array(publicKey);
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key
  });
}

export async function registerSubscription(owner, subscription) {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, subscription })
  });
  if (!res.ok) throw new Error('Subscription registration failed');
  return res.json();
}

export async function sendMessage(message) {
  const res = await fetch(`${API_BASE}/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  if (!res.ok) throw new Error('Send message failed');
  return res.json();
}

export async function fetchPending(owner) {
  const res = await fetch(`${API_BASE}/pending?owner=${encodeURIComponent(owner)}`);
  if (!res.ok) throw new Error('Pending fetch failed');
  return res.json();
}

// utility
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
