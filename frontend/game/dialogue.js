// Dialogue UI + message state (single message for now, structured for future real-time updates).
import { getLocalSprite, getRemoteSprite } from "./identity.js";

const messageState = {
  hasMessage: false,
  currentMessage: null
};

let overlayEl;
let textEl;
let closeBtn;
let avatarLocal;
let avatarRemote;
let isOpen = false;
let callbacks = { onOpen: null, onClose: null };

export function initDialogue({ onOpen, onClose } = {}) {
  callbacks.onOpen = onOpen || null;
  callbacks.onClose = onClose || null;

  overlayEl = document.getElementById("dialogue-overlay");
  textEl = document.getElementById("dialogue-text");
  closeBtn = document.getElementById("dialogue-close");
  avatarLocal = document.querySelector(".dialogue-avatar--local");
  avatarRemote = document.querySelector(".dialogue-avatar--remote");

  if (avatarLocal) avatarLocal.style.backgroundImage = `url("${getLocalSprite()}")`;
  if (avatarRemote) avatarRemote.style.backgroundImage = `url("${getRemoteSprite()}")`;

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDialogue);
  }
  if (overlayEl) {
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) {
        closeDialogue();
      }
    });
  }
}

export function setMessage(message) {
  // Future hook: populate this from push/WebSocket.
  messageState.currentMessage = message;
  messageState.hasMessage = Boolean(message);
  if (textEl) {
    textEl.textContent = message ? message.message || "" : "";
  }
}

export function openDialogue() {
  if (!messageState.currentMessage) return;
  if (messageState.hasMessage) {
    messageState.hasMessage = false;
  }
  if (textEl && messageState.currentMessage) {
    textEl.textContent = messageState.currentMessage.message || "";
  }
  if (overlayEl) {
    overlayEl.classList.add("is-open");
    overlayEl.setAttribute("aria-hidden", "false");
  }
  isOpen = true;
  dispatchEvent(new CustomEvent("dialogue:open"));
  callbacks.onOpen && callbacks.onOpen();
}

export function closeDialogue() {
  if (overlayEl) {
    overlayEl.classList.remove("is-open");
    overlayEl.setAttribute("aria-hidden", "true");
  }
  isOpen = false;
  messageState.hasMessage = false;
  messageState.currentMessage = null;
  dispatchEvent(new CustomEvent("dialogue:close"));
  callbacks.onClose && callbacks.onClose();
}

export function isDialogueOpen() {
  return isOpen;
}

export { messageState };
