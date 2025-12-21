import { sendMessage } from "./pushService.js";
import { getLocalUserId, getRemoteUserId, getLocalSprite, getRemoteSprite } from "./identity.js";

let overlayEl, openBtn, closeBtn, cancelBtn, sendBtn, textArea;
let callbacks = { onOpen: null, onClose: null };
let isOpen = false;

export function initComposer({ onOpen, onClose } = {}) {
  callbacks.onOpen = onOpen || null;
  callbacks.onClose = onClose || null;

  overlayEl = document.getElementById("composer-overlay");
  openBtn = document.getElementById("composer-open");
  closeBtn = document.getElementById("composer-close");
  cancelBtn = document.getElementById("composer-cancel");
  sendBtn = document.getElementById("composer-send");
  textArea = document.getElementById("composer-text");
  const avatarLocal = document.querySelector("#composer-overlay .dialogue-avatar--local");
  const avatarRemote = document.querySelector("#composer-overlay .dialogue-avatar--remote");
  if (avatarLocal) avatarLocal.style.backgroundImage = `url("${getLocalSprite()}")`;
  if (avatarRemote) avatarRemote.style.backgroundImage = `url("${getRemoteSprite()}")`;

  openBtn?.addEventListener("click", openComposer);
  closeBtn?.addEventListener("click", closeComposer);
  cancelBtn?.addEventListener("click", closeComposer);
  sendBtn?.addEventListener("click", handleSend);
  overlayEl?.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeComposer();
  });
}

export function openComposer() {
  if (isOpen) return;
  overlayEl?.classList.add("is-open");
  overlayEl?.setAttribute("aria-hidden", "false");
  isOpen = true;
  dispatchEvent(new CustomEvent("composer:open"));
  callbacks.onOpen && callbacks.onOpen();
}

export function closeComposer() {
  overlayEl?.classList.remove("is-open");
  overlayEl?.setAttribute("aria-hidden", "true");
  isOpen = false;
  dispatchEvent(new CustomEvent("composer:close"));
  callbacks.onClose && callbacks.onClose();
}

export function isComposerOpen() {
  return isOpen;
}

async function handleSend() {
  const messageText = (textArea?.value || "").trim();
  if (!messageText) return;

  const message = {
    fromUserId: getLocalUserId(),
    toUserId: getRemoteUserId(),
    message: messageText,
    timestamp: Date.now(),
    seen: false
  };

  await sendMessage(message);
  console.log("Message composed:", message);

  textArea.value = "";
  closeComposer();
}
