import { startGame } from "./game/game.js";
import { initDialogue, showDialogue, closeDialogue } from "./game/dialogue.js";
import { setMoveDirection } from "./game/player.js";

const LOVE_MESSAGES = [
  "Sono sempre con te ❤️",
  "Sei più forte di quanto pensi",
  "Anche nei giorni difficili sei amata",
  "Non devi correre, io sono qui",
  "Rendi il mondo più dolce solo essendoci 🐱",
  "Respira, sono accanto a te",
  "Illumini la mia giornata, Virginia",
  "Stiamo vicini e tranquilli oggi",
  "Ogni tuo passo fa il tifo con me",
  "La tua gentilezza scalda tutto intorno"
];

const talkButton = document.getElementById("talk-button");
const leftBtn = document.getElementById("move-left");
const rightBtn = document.getElementById("move-right");

initDialogue({
  onOpen: () => document.body.classList.add("overlay-open"),
  onClose: () => document.body.classList.remove("overlay-open")
});

startGame({
  onProximity: (near) => {
    if (near) {
      talkButton?.classList.remove("hidden");
    } else {
      talkButton?.classList.add("hidden");
    }
  }
});

if (talkButton) {
  talkButton.addEventListener("click", () => {
    const message = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)];
    showDialogue(message);
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDialogue();
  }
});

if (leftBtn) {
  leftBtn.addEventListener("touchstart", () => setMoveDirection("left"));
  leftBtn.addEventListener("touchend", () => setMoveDirection(null));
  leftBtn.addEventListener("mousedown", () => setMoveDirection("left"));
  leftBtn.addEventListener("mouseup", () => setMoveDirection(null));
  leftBtn.addEventListener("mouseleave", () => setMoveDirection(null));
}

if (rightBtn) {
  rightBtn.addEventListener("touchstart", () => setMoveDirection("right"));
  rightBtn.addEventListener("touchend", () => setMoveDirection(null));
  rightBtn.addEventListener("mousedown", () => setMoveDirection("right"));
  rightBtn.addEventListener("mouseup", () => setMoveDirection(null));
  rightBtn.addEventListener("mouseleave", () => setMoveDirection(null));
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.error("Service worker registration failed", err);
  });
}
