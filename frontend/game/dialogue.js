let overlayEl;
let textEl;
let closeBtn;
let avatar;
let isOpen = false;
let callbacks = { onOpen: null, onClose: null };
const AVATAR_IMAGE = "/assets/backgrounds/cat-kiss.png";
const typingAudio = new Audio("/assets/audio/typing.mp3");
typingAudio.preload = "auto";
typingAudio.loop = true;
let typingTimeout = null;
let typingInterval = null;

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
  startTyping(message || "");
  if (avatar) {
    avatar.style.backgroundImage = `url(${AVATAR_IMAGE})`;
  }
  overlayEl.classList.add("is-open");
  overlayEl.setAttribute("aria-hidden", "false");
  isOpen = true;
  callbacks.onOpen && callbacks.onOpen();
}

export function closeDialogue() {
  stopTyping();
  overlayEl?.classList.remove("is-open");
  overlayEl?.setAttribute("aria-hidden", "true");
  isOpen = false;
  callbacks.onClose && callbacks.onClose();
}

export function isDialogueOpen() {
  return isOpen;
}

function startTyping(text) {
  stopTyping();
  if (!textEl) return;
  textEl.textContent = "";
  textEl.classList.add("is-typing");

  const speed = 90; // slower than mood banner
  const delay = 200;
  let index = 0;

  playTypewriter();
  typingTimeout = setTimeout(() => {
    typingInterval = setInterval(() => {
      textEl.textContent += text.charAt(index);
      index += 1;
      if (index >= text.length) {
        stopTyping(true);
      }
    }, speed);
  }, delay);
}

function stopTyping(finished = false) {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  if (textEl) {
    if (finished === false) {
      textEl.textContent = textEl.textContent;
    }
    textEl.classList.remove("is-typing");
  }
  stopTypewriter();
}

function playTypewriter() {
  typingAudio.currentTime = 0;
  typingAudio.play().catch(() => {});
  typingAudio.volume = 0.6;
}

function stopTypewriter() {
  typingAudio.pause();
  typingAudio.currentTime = 0;
}
