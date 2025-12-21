import { startGame } from "./game/game.js";
import { initDialogue, showDialogue, closeDialogue } from "./game/dialogue.js";

const LOVE_MESSAGES = [
  "I’m always with you ❤️",
  "You’re stronger than you think",
  "Even on hard days, you’re loved",
  "You don’t have to rush, I’m here",
  "You make the world softer just by being in it 🐱",
  "Take a breath, I’m right beside you",
  "You light up my world, Virginia",
  "Let’s be cozy together today",
  "Every step you take, I’m cheering for you",
  "Your kindness makes everything brighter"
];

initDialogue({
  onOpen: () => document.body.classList.add("overlay-open"),
  onClose: () => document.body.classList.remove("overlay-open")
});

startGame({
  onCollision: () => {
    const message = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)];
    showDialogue(message);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDialogue();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.error("Service worker registration failed", err);
  });
}
