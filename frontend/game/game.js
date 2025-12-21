import {
  player,
  characters,
  updateCharacters,
  drawCharacters,
  spritesReady,
  SPRITE_SIZE,
  areCatsColliding,
  initCharacters
} from "./player.js";
import {
  initDialogue,
  messageState,
  openDialogue,
  closeDialogue,
  isDialogueOpen
} from "./dialogue.js";
import { initComposer } from "./composer.js";

const backgroundImage = new Image();
backgroundImage.src = "/assets/backgrounds/background.jpg";
const backgroundReady = backgroundImage.decode
  ? backgroundImage.decode().catch(() => {})
  : new Promise((resolve) => {
      if (backgroundImage.complete && backgroundImage.naturalWidth > 0) resolve();
      backgroundImage.onload = () => resolve();
      backgroundImage.onerror = () => resolve();
    });

let canvas, ctx;
let backgroundBuffer, backgroundCtx;
let cameraX = 0;
let worldWidth = 600;
const viewport = { width: 320, height: 180 };
let hasPlacedPlayer = false;
const BACKGROUND_PIXEL_SCALE = 0.25; // draw background at low res to match sprite feel
let isPaused = false;
const pauseReasons = new Set();

export function setPauseState(reason, active) {
  if (active) {
    pauseReasons.add(reason);
  } else {
    pauseReasons.delete(reason);
  }
  isPaused = pauseReasons.size > 0;
}

export async function startGame() {
  initCharacters();
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  backgroundBuffer = document.createElement("canvas");
  backgroundCtx = backgroundBuffer.getContext("2d");
  backgroundCtx.imageSmoothingEnabled = false;

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("keydown", handleInteractionKey);
  handleResize();
  positionCharacters();

  await Promise.all([spritesReady, backgroundReady]);

  initDialogue({
    onOpen: () => { setPauseState("dialogue", true); },
    onClose: () => { setPauseState("dialogue", false); }
  });
  initComposer({
    onOpen: () => { setPauseState("composer", true); },
    onClose: () => { setPauseState("composer", false); }
  });

  requestAnimationFrame(loop);
}

function handleResize() {
  const dpr = window.devicePixelRatio || 1;
  const maxWidth = 720;
  const padding = 24;
  const cssWidth = Math.max(280, Math.min(window.innerWidth - padding, maxWidth));
  const cssHeight = Math.max(
    180,
    Math.min(window.innerHeight - padding, Math.round(cssWidth * 9 / 16))
  );

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  viewport.width = cssWidth;
  viewport.height = cssHeight;
  worldWidth = Math.max(viewport.width, SPRITE_SIZE * 2 + 40);

  backgroundBuffer.width = Math.max(1, Math.round(viewport.width * BACKGROUND_PIXEL_SCALE));
  backgroundBuffer.height = Math.max(1, Math.round(viewport.height * BACKGROUND_PIXEL_SCALE));
  positionCharacters();
}

function positionCharacters() {
  const groundY = viewport.height - SPRITE_SIZE - 24;
  player.y = groundY;
  const companion = characters[1];
  companion.y = groundY;
  companion.x = Math.max(10, viewport.width - SPRITE_SIZE - 10);

  if (!hasPlacedPlayer) {
    player.x = 10;
    hasPlacedPlayer = true;
  }
  player.x = Math.max(0, Math.min(player.x, worldWidth - SPRITE_SIZE));
}

function loop() {
  updateCharacters({ worldWidth, paused: isPaused });
  if (!isPaused && messageState.hasMessage && areCatsColliding()) {
    openDialogue();
  }
  updateCamera();
  drawBackground();
  drawCharacters(ctx, cameraX);
  requestAnimationFrame(loop);
}

function updateCamera() {
  const desired = player.x - viewport.width / 2;
  const maxCamera = Math.max(0, worldWidth - viewport.width);
  cameraX = Math.max(0, Math.min(desired, maxCamera));
}

function drawBackground() {
  const bw = backgroundBuffer.width;
  const bh = backgroundBuffer.height;
  backgroundCtx.clearRect(0, 0, bw, bh);
  backgroundCtx.fillStyle = "#0b1021";
  backgroundCtx.fillRect(0, 0, bw, bh);

  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    const scale = Math.max(bw / backgroundImage.width, bh / backgroundImage.height);
    const targetW = backgroundImage.width * scale;
    const targetH = backgroundImage.height * scale;
    const dx = (bw - targetW) / 2;
    const dy = (bh - targetH) / 2;
    backgroundCtx.drawImage(backgroundImage, dx, dy, targetW, targetH);
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  ctx.drawImage(
    backgroundBuffer,
    0, 0, bw, bh,
    0, 0, viewport.width, viewport.height
  );
  ctx.restore();
}

function handleInteractionKey(e) {
  if ((e.key === "Enter" || e.key === " ") && messageState.currentMessage && !isDialogueOpen()) {
    openDialogue();
  }
  if (e.key === "Escape" && isDialogueOpen()) {
    closeDialogue();
  }
}
