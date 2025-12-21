import { startGame } from "./game/game.js";
import { initDialogue, showDialogue, closeDialogue } from "./game/dialogue.js";
import { setMoveDirection } from "./game/player.js";

const LOVE_MESSAGES = [
  "Credo in te, sempre. Anche oggi 🌱",
  "Sei più forte di quanto pensi 🐱✨",
  "Quello che fai ha valore. E tu anche 💛",
  "Sono fiero di te, davvero 🌟",
  "Stai andando nella direzione giusta 🧭",
  "Anche i piccoli passi contano 🐾",
  "Non sei sola, io sono qui 🤍",
  "Hai una luce tutta tua ✨",
  "Continua così, stai facendo bene 🌸",
  "Meriti solo cose belle. Tutte 🐈‍⬛💫",
  "Fidati di te come io mi fido di te 🌱",
  "Ogni giorno cresci, anche quando non lo vedi 🌙",
  "Sei capace. Punto 💪🐾",
  "Il tuo impegno si sente 🤍",
  "Respira, ce la stai facendo 🌬️",
  "Amo come affronti le cose 💛",
  "Sei importante, non dimenticarlo 🐱",
  "Anche oggi, io credo in te 🌟",
  "Il mondo è un posto migliore con te 🌍✨",
  "Vai al tuo ritmo, va benissimo così 🐾",
  "Stai facendo del tuo meglio, e basta così 🌱",
  "Hai più forza di quanto immagini 🐾",
  "Anche oggi, ti scelgo 🤍",
  "Quello che costruisci ha senso 🧱✨",
  "Fidati del processo 🧭",
  "Sei costante, ed è raro 🐈",
  "Mi piace come non molli 🌟",
  "Hai una bella testa. E un bel cuore 💛",
  "Ogni sforzo lascia il segno 🐾",
  "Sei esattamente dove devi essere 🌙",
  "Continua, io ti guardo con orgoglio 🐱",
  "Hai il diritto di prenderti tempo 🌱",
  "Non devi dimostrare niente a nessuno 🤍",
  "Sei più brava di ieri 🐾",
  "Anche nei dubbi, vali 🌫️✨",
  "Amo la tua determinazione 💛",
  "Quello che senti è legittimo 🐈‍⬛",
  "Sei affidabile. E preziosa 🌟",
  "Stai crescendo, si vede 🌸",
  "Io credo in quello che fai 🧭",
  "Non sei in ritardo 🐾",
  "La tua strada è tua 🤍",
  "Hai già superato tanto 🐱",
  "Anche quando sei stanca, vali 🌙",
  "Il tuo impegno parla per te 💬✨",
  "Vai piano, ma vai 🌱",
  "Sei una presenza che conta 💛",
  "Meriti rispetto, anche da te stessa 🐾",
  "Continua a provarci, basta questo 🌟",
  "Ti amo, e credo in te 🐱🤍",
  "Il gattino approva quello che stai facendo 🐱✔️",
  "Anche oggi: niente panico, solo passo felino 🐾",
  "Sei competente. Il gatto ha controllato 😼",
  "Vai bene così. Fonte: me e il gatto 🐱",
  "Se dubiti, fai come i gatti: vai lo stesso 🐾",
  "Stai facendo meglio di quanto credi. Miao.",
  "Il progresso è lento, ma con stile 🐈‍⬛✨",
  "Respira. Poi fai una cosa alla volta 😼",
  "Continua così. Io e il gatto siamo fieri 🐱✨"
];

const MOOD_MESSAGE =
  "Se hai aperto l’app forse ti senti un po’ giù o ti manco. Avvicinati che parliamo 💖";

const notificationAudio = new Audio("/assets/audio/notification.mp3");
notificationAudio.preload = "auto";
notificationAudio.volume = 0.7;
const backgroundMusic = new Audio("/assets/audio/background_music.mp3");
backgroundMusic.loop = true;
backgroundMusic.preload = "auto";
backgroundMusic.volume = 0.35;

const talkButton = document.getElementById("talk-button");
const leftBtn = document.getElementById("move-left");
const rightBtn = document.getElementById("move-right");
const moodBannerText = document.getElementById("mood-banner-text");

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
    notificationAudio.currentTime = 0;
    notificationAudio.play().catch(() => {});
    const message = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)];
    showDialogue(message);
  });
}

if (moodBannerText) {
  typeText(moodBannerText, MOOD_MESSAGE, { speed: 45, delay: 400 });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDialogue();
  }
});

startBackgroundMusic();

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

function typeText(targetEl, text, { speed = 30, delay = 300 } = {}) {
  targetEl.textContent = "";
  targetEl.classList.add("is-typing");

  let index = 0;
  setTimeout(() => {
    const timer = setInterval(() => {
      targetEl.textContent += text.charAt(index);
      index += 1;
      if (index >= text.length) {
        clearInterval(timer);
        targetEl.classList.remove("is-typing");
      }
    }, speed);
  }, delay);
}

function startBackgroundMusic() {
  const tryPlay = () => backgroundMusic.play().catch(() => {});
  tryPlay();

  const unlock = () => {
    tryPlay();
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
}
