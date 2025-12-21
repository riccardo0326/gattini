import { startGame, setPauseState } from "./game/game.js";
import { setMessage, messageState } from "./game/dialogue.js";
import { initComposer, isComposerOpen, closeComposer } from "./game/composer.js";
import { initIdentityOverlay, getRemoteUserId, getLocalUserId, getRole } from "./game/identity.js";
import {
  registerServiceWorker,
  requestNotificationPermission,
  getPublicVapidKey,
  subscribeToPush,
  registerSubscription,
  fetchPending
} from "./game/pushService.js";

let overlayCount = 0;
const composeBtn = document.getElementById("composer-open");

window.addEventListener("dialogue:open", () => handleOverlayChange(true));
window.addEventListener("dialogue:close", () => handleOverlayChange(false));
window.addEventListener("composer:open", () => handleOverlayChange(true));
window.addEventListener("composer:close", () => handleOverlayChange(false));

boot();

async function boot() {
  await initIdentityOverlay();
  if (composeBtn) {
    composeBtn.textContent = `Write to ${getRemoteUserId()} 💌`;
  }
  startGame();

  await setupPush();

  initComposer({
    onOpen: () => {
      setPauseState("composer", true);
    },
    onClose: () => {
      setPauseState("composer", false);
    }
  });

  // Prevent composer from staying open if we ever trigger dialogue programmatically.
  window.addEventListener("dialogue:open", () => {
    if (isComposerOpen()) closeComposer();
  });

  // Dev helpers for manual testing in console.
  window.gattiniMessageState = messageState;
  window.gattiniSetMessage = setMessage;
}

async function setupPush() {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return;

    const permission = await requestNotificationPermission();
    if (permission !== "granted") return;

    const publicKey = await getPublicVapidKey();
    const subscription = await subscribeToPush(registration, publicKey);
    if (!subscription) return;

    const owner = getRole();
    await registerSubscription(owner, subscription);
    await fetchPending(owner); // warm up pending fetch; handle UI in future
  } catch (err) {
    console.error("Push setup failed", err);
  }
}

function handleOverlayChange(opening) {
  overlayCount += opening ? 1 : -1;
  overlayCount = Math.max(0, overlayCount);
  if (composeBtn) {
    composeBtn.disabled = overlayCount > 0;
  }
  document.body.classList.toggle("overlay-open", overlayCount > 0);
}
