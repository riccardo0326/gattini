const API_BASE_URL = 'https://gattini-ten.vercel.app/api';

async function apiJson(path, opts = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function getPublicVapidKey() {
  const data = await apiJson('/vapid-public-key');
  return data.key;
}

export async function subscribeToPush(registration, publicKey) {
  if (!registration?.pushManager) return null;
  const key = urlBase64ToUint8Array(publicKey);
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
}

export async function registerSubscription(owner, subscription) {
  return apiJson('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ owner, subscription }),
  });
}

export async function sendMessage(message) {
  return apiJson('/send-message', {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

export async function fetchPending(owner) {
  return apiJson(`/pending?owner=${encodeURIComponent(owner)}`);
}

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
