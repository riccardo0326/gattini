let overlayEl;
let textEl;
let closeBtn;
let avatar;
let isOpen = false;
let callbacks = { onOpen: null, onClose: null };

export function initDialogue({ onOpen, onClose } = {}) {
  callbacks.onOpen = onOpen || null;
  callbacks.onClose = onClose || null;

  overlayEl = document.getElementById("dialogue-overlay");
  textEl = document.getElementById("dialogue-text");
  closeBtn = document.getElementById("dialogue-close");
  avatar = document.querySelector(".dialogue-avatar--local");

  closeBtn?.addEventListener("click", closeDialogue);
  overlayEl?.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeDialogue();
  });
}

export function showDialogue(message) {
  if (!overlayEl || !textEl) return;
  textEl.textContent = message || "";
  overlayEl.classList.add("is-open");
  overlayEl.setAttribute("aria-hidden", "false");
  isOpen = true;
  callbacks.onOpen && callbacks.onOpen();
}

export function closeDialogue() {
  overlayEl?.classList.remove("is-open");
  overlayEl?.setAttribute("aria-hidden", "true");
  isOpen = false;
  callbacks.onClose && callbacks.onClose();
}

export function isDialogueOpen() {
  return isOpen;
}
