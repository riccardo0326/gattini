const FRAME_SIZE = 32; // sprite sheet row height is 32px
const SCALE = 3; // draw scaled-up for crisp pixel art
const FRAMES_PER_ROW = 8; // 320px wide sheet / 32px frames
const MOVE_SPEED = 1.5;
const COLLISION_PADDING = 0.2; // % of sprite size trimmed for collision box
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
  // Virginia is the player, Riccardo is the companion.
  const virginiaSprite = loadSprite("/assets/sprites/cats/cat_virginia.png");
  const riccardoSprite = loadSprite("/assets/sprites/cats/cat_riccardo.png");

  player = createCharacter(virginiaSprite);
  remoteCat = createCharacter(riccardoSprite);
  remoteCat.facingLeft = true;
  characters = [player, remoteCat];

  spritesReady = Promise.all([virginiaSprite.ready, riccardoSprite.ready]);
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
  characters.forEach((actor, idx) => {
    drawCat(ctx, actor, cameraX);
    drawNameTag(ctx, actor, cameraX, idx === 0 ? "Virginia" : "Riccardo");
    if (idx === 1) {
      drawExclamation(ctx, actor, cameraX);
    }
  });
}

export function nudgeApart(worldWidth) {
  player.x = Math.max(0, player.x - 12);
  remoteCat.x = Math.min(worldWidth - SPRITE_SIZE, remoteCat.x + 12);
}

export function setMoveDirection(dir) {
  if (dir === 'left') {
    keys['ArrowLeft'] = true;
    keys['ArrowRight'] = false;
  } else if (dir === 'right') {
    keys['ArrowRight'] = true;
    keys['ArrowLeft'] = false;
  } else {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
  }
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
  lastCollision = overlapX > 6; // soften sensitivity
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

function drawNameTag(ctx, actor, cameraX, label) {
  const dw = FRAME_SIZE * SCALE;
  const dx = Math.round(actor.x - cameraX + dw / 2);
  const dy = Math.round(actor.y - 12);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.strokeStyle = "#ffffffaa";
  ctx.lineWidth = 1;
  ctx.font = "12px 'Courier New', monospace";
  const textWidth = ctx.measureText(label).width;
  const pad = 6;
  ctx.fillRect(dx - textWidth / 2 - pad, dy - 14, textWidth + pad * 2, 16);
  ctx.strokeRect(dx - textWidth / 2 - pad, dy - 14, textWidth + pad * 2, 16);
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, dx, dy - 6);
  ctx.restore();
}

function drawExclamation(ctx, actor, cameraX) {
  const t = performance.now() / 200;
  const bob = Math.sin(t) * 2;
  const dw = FRAME_SIZE * SCALE;
  const dx = Math.round(actor.x - cameraX + dw / 2);
  const dy = Math.round(actor.y - 20 + bob);

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

// keyboard input
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);
