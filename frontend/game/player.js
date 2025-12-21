import { messageState } from "./dialogue.js";
import { getLocalSprite, getRemoteSprite } from "./identity.js";

const FRAME_SIZE = 32; // sprite sheet row height is 32px
const SCALE = 3; // draw scaled-up for crisp pixel art
const FRAMES_PER_ROW = 8; // 320px wide sheet / 32px frames
const MOVE_SPEED = 1.5;
const COLLISION_PADDING = 0.20; // % of sprite size trimmed for collision box
let lastCollision = false;

const ANIMATIONS = {
  idle: { row: 17, frames: FRAMES_PER_ROW, speed: 15 },
  walk: { row: 5, frames: FRAMES_PER_ROW, speed: 7 }
};

export const SPRITE_SIZE = FRAME_SIZE * SCALE;
export let player;
export let remoteCat;
export let characters = [];
export let spritesReady = Promise.resolve();

function loadSprite(src) {
  const image = new Image();
  image.src = src;
  const ready = image.decode
    ? image.decode().catch(() => {})
    : new Promise((resolve) => {
        if (image.complete && image.naturalWidth > 0) {
          resolve();
        } else {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        }
      });
  return { image, ready };
}

function createCharacter(sprite) {
  return {
    sprite,
    x: 0,
    y: 0,
    vx: 0,
    facingLeft: false,
    anim: { name: "idle", frame: 0, tick: 0 }
  };
}

export function initCharacters() {
  const localSprite = loadSprite(getLocalSprite());
  const remoteSprite = loadSprite(getRemoteSprite());

  player = createCharacter(localSprite);
  remoteCat = createCharacter(remoteSprite);
  remoteCat.facingLeft = true;
  characters = [player, remoteCat];

  spritesReady = Promise.all([localSprite.ready, remoteSprite.ready]);
}

export function updateCharacters({ worldWidth, paused = false }) {
  if (paused) {
    characters.forEach((actor) => {
      actor.vx = 0;
      advanceAnimation(actor, false);
    });
    resolveOverlap(player, remoteCat, worldWidth);
    return;
  }

  updatePlayerControlled(player, worldWidth);
  updateIdle(remoteCat);
  resolveOverlap(player, remoteCat, worldWidth);
}

export function drawCharacters(ctx, cameraX = 0) {
  characters.forEach((actor) => {
    drawCat(ctx, actor, cameraX);
    drawAlertIfNeeded(ctx, actor, cameraX);
  });
}

function updatePlayerControlled(actor, worldWidth) {
  actor.vx = 0;

  if (keys["ArrowRight"]) {
    actor.vx = MOVE_SPEED;
    actor.facingLeft = false;
  }
  if (keys["ArrowLeft"]) {
    actor.vx = -MOVE_SPEED;
    actor.facingLeft = true;
  }

  actor.x += actor.vx;
  actor.x = Math.max(0, Math.min(actor.x, worldWidth - SPRITE_SIZE));

  advanceAnimation(actor, Math.abs(actor.vx) > 0.1);
}

function updateIdle(actor) {
  actor.vx = 0;
  advanceAnimation(actor, false);
}

function resolveOverlap(a, b, worldWidth) {
  const pad = SPRITE_SIZE * COLLISION_PADDING;
  const aLeft = a.x + pad;
  const aRight = a.x + SPRITE_SIZE - pad;
  const bLeft = b.x + pad;
  const bRight = b.x + SPRITE_SIZE - pad;

  const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
  lastCollision = overlapX > 0;
  if (overlapX > 0) {
    if (a.x < b.x) {
      a.x -= overlapX;
    } else {
      a.x += overlapX;
    }
    a.x = Math.max(0, Math.min(a.x, worldWidth - SPRITE_SIZE));
  }
}

export function areCatsColliding() {
  return lastCollision;
}

function drawCat(ctx, actor, cameraX) {
  const { image } = actor.sprite;
  if (!image.complete || image.naturalWidth === 0) return;

  const animData = ANIMATIONS[actor.anim.name];
  const sx = actor.anim.frame * FRAME_SIZE;
  const sy = animData.row * FRAME_SIZE + 1; // trim top pixel to remove artifact
  const sh = FRAME_SIZE - 1;
  const dw = FRAME_SIZE * SCALE;
  const dh = sh * SCALE;
  const dx = Math.round(actor.x - cameraX);
  const dy = Math.round(actor.y);

  ctx.save();
  if (actor.facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      image,
      sx, sy,
      FRAME_SIZE, sh,
      -dx - dw,
      dy,
      dw, dh
    );
  } else {
    ctx.drawImage(
      image,
      sx, sy,
      FRAME_SIZE, sh,
      dx,
      dy,
      dw, dh
    );
  }
  ctx.restore();
}

function drawAlertIfNeeded(ctx, actor, cameraX) {
  if (actor !== remoteCat) return;
  if (!messageState.hasMessage) return;

  const dw = FRAME_SIZE * SCALE;
  const dx = Math.round(actor.x - cameraX + dw / 2);
  const dy = Math.round(actor.y - 4);

  ctx.save();
  ctx.fillStyle = "#f9ed69";
  ctx.strokeStyle = "#1f1d2b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(dx, dy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1f1d2b";
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", dx, dy + 1);
  ctx.restore();
}

function advanceAnimation(actor, walking) {
  const next = walking ? "walk" : "idle";

  if (actor.anim.name !== next) {
    actor.anim.name = next;
    actor.anim.frame = 0;
    actor.anim.tick = 0;
  }

  const data = ANIMATIONS[actor.anim.name];

  actor.anim.tick++;
  if (actor.anim.tick >= data.speed) {
    actor.anim.tick = 0;
    actor.anim.frame = (actor.anim.frame + 1) % data.frames;
  }
}

// quick keyboard input (temporary)
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);
