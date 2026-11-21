// game.js — the game itself: state, input, timer, hints and scoring.
// It owns the two canvases and the HUD; scene.js owns the painting and
// differences.js owns the level data.

import { LEVELS, levelDifferences } from './differences.js';
import {
  PANEL_W,
  PANEL_H,
  drawScene,
  drawFoundMarker,
  drawHintRing,
  drawCursor,
  drawMissMark,
} from './scene.js';
import { playFound, playMiss, playHint, playWin, playTick, setMuted, isMuted } from './audio.js';
import { applyShot } from './shots.js';

const $ = (id) => document.getElementById(id);

const state = {
  levelIndex: 0,
  diffs: [],
  found: new Set(),
  score: 0,
  hintsLeft: 3,
  hintId: null,
  hintUntil: 0,
  timeLeft: 0,
  timerId: null,
  running: false,
  over: false,
  cursor: { panel: 'left', x: PANEL_W / 2, y: PANEL_H / 2 },
  mouse: { panel: null, x: 0, y: 0 },
  miss: null,
  missUntil: 0,
  pulse: 0,
  totalFound: 0,
};

const leftCtx = $('panel-left').getContext('2d');
const rightCtx = $('panel-right').getContext('2d');

function currentLevel() {
  return LEVELS[state.levelIndex];
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function renderPanels() {
  const rightIds = state.diffs.map((d) => d.id);
  drawScene(leftCtx, []);
  drawScene(rightCtx, rightIds);
  state.diffs.forEach((diff, i) => {
    if (!state.found.has(diff.id)) return;
    drawFoundMarker(leftCtx, diff, i);
    drawFoundMarker(rightCtx, diff, i);
  });
  if (state.hintId && performance.now() < state.hintUntil) {
    const diff = state.diffs.find((d) => d.id === state.hintId);
    if (diff) {
      drawHintRing(leftCtx, diff, state.pulse);
      drawHintRing(rightCtx, diff, state.pulse);
    }
  }
  if (state.miss && performance.now() < state.missUntil) {
    const alpha = (state.missUntil - performance.now()) / 600;
    const ctx = state.miss.panel === 'left' ? leftCtx : rightCtx;
    drawMissMark(ctx, state.miss.x, state.miss.y, alpha);
  }
  // Keyboard cursor on the active panel.
  const ctx = state.cursor.panel === 'left' ? leftCtx : rightCtx;
  drawCursor(ctx, state.cursor.x, state.cursor.y, true);
  // Mouse crosshair on the hovered panel.
  if (state.mouse.panel) {
    const mctx = state.mouse.panel === 'left' ? leftCtx : rightCtx;
    drawCursor(mctx, state.mouse.x, state.mouse.y, false);
  }
}

function renderHud() {
  const level = currentLevel();
  const remaining = state.diffs.length - state.found.size;
  $('level-name').textContent = `Level ${level.id} — ${level.name}`;
  $('level-blurb').textContent = level.blurb;
  $('counter').textContent = `Found ${state.found.size} / ${state.diffs.length}  ·  ${remaining} remain`;
  $('counter-big').textContent = String(remaining);
  $('timer').textContent = formatTime(state.timeLeft);
  $('timer').classList.toggle('urgent', state.timeLeft <= 30 && state.running);
  $('score').textContent = `Score ${state.score}`;
  $('hints').textContent = `Hints ${state.hintsLeft}`;
  $('hint-btn').textContent = `Hint (H) — ${state.hintsLeft} left`;
  $('hint-btn').disabled = state.hintsLeft <= 0 || !state.running || remaining === 0;
  const bar = $('timebar-fill');
  bar.style.width = `${(state.timeLeft / level.timeLimit) * 100}%`;
  bar.classList.toggle('urgent', state.timeLeft <= 30);
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
}

function tick() {
  if (!state.running) return;
  state.timeLeft -= 1;
  if (state.timeLeft <= 10 && state.timeLeft > 0) playTick();
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endLevel(false);
    return;
  }
  renderHud();
}

function startLevel(index) {
  state.levelIndex = index;
  state.diffs = levelDifferences(currentLevel());
  state.found = new Set();
  state.hintsLeft = 3;
  state.hintId = null;
  state.timeLeft = currentLevel().timeLimit;
  state.running = true;
  state.over = false;
  state.cursor = { panel: 'left', x: PANEL_W / 2, y: PANEL_H / 2 };
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 1000);
  hideOverlays();
  renderPanels();
  renderHud();
}

function endLevel(won) {
  state.running = false;
  clearInterval(state.timerId);
  if (won) {
    const bonus = state.timeLeft * 5;
    state.score += bonus;
    playWin();
    if (state.levelIndex + 1 < LEVELS.length) {
      showOverlay('level-done', `Level ${currentLevel().id} complete!`,
        `All differences found with ${formatTime(state.timeLeft)} to spare — time bonus +${bonus}.`);
      $('next-btn').style.display = '';
    } else {
      showOverlay('level-done', 'The study holds no more secrets!',
        `You found all ${state.totalFound} differences across three levels. Final score: ${state.score}.`);
      $('next-btn').style.display = 'none';
    }
  } else {
    playMiss();
    showOverlay('level-done', 'Out of time!',
      `The lamp burned down with ${state.diffs.length - state.found.size} differences still hidden. Try this level again.`);
    $('next-btn').style.display = 'none';
    $('retry-btn').textContent = 'Try this level again';
  }
  renderHud();
}

function showOverlay(id, title, body) {
  document.querySelectorAll('.overlay').forEach((el) => el.classList.add('hidden'));
  const overlay = $(id);
  if (title) overlay.querySelector('h2').textContent = title;
  if (body) overlay.querySelector('p').textContent = body;
  overlay.classList.remove('hidden');
}

function hideOverlays() {
  document.querySelectorAll('.overlay').forEach((el) => el.classList.add('hidden'));
}

function tryMark(panel, x, y) {
  if (!state.running) return;
  const hit = state.diffs.find(
    (d) => !state.found.has(d.id) && Math.hypot(d.x - x, d.y - y) <= d.r + 12,
  );
  if (hit) {
    state.found.add(hit.id);
    state.totalFound += 1;
    const gained = 100 + Math.max(0, Math.floor(state.timeLeft / 10)) * 10;
    state.score += gained;
    playFound();
    toast(`${hit.label}! +${gained}`);
    if (state.found.size === state.diffs.length) {
      renderPanels();
      renderHud();
      setTimeout(() => endLevel(true), 450);
      return;
    }
  } else {
    state.miss = { panel, x, y };
    state.missUntil = performance.now() + 600;
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    playMiss();
    toast('Not a difference — 5 seconds lost!');
    if (state.timeLeft <= 0) {
      renderPanels();
      renderHud();
      endLevel(false);
      return;
    }
  }
  renderPanels();
  renderHud();
}

function useHint() {
  if (!state.running || state.hintsLeft <= 0) return;
  const hidden = state.diffs.filter((d) => !state.found.has(d.id));
  if (hidden.length === 0) return;
  const pick = hidden[Math.floor(Math.random() * hidden.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 25);
  state.hintId = pick.id;
  state.hintUntil = performance.now() + 3000;
  playHint();
  toast('Hint: look inside the green ring (−25 points)');
  renderHud();
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
    y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
  };
}

function bindPanel(canvas, panel) {
  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(event, canvas);
    state.cursor = { panel, x: p.x, y: p.y };
    tryMark(panel, p.x, p.y);
  });
  canvas.addEventListener('mousemove', (event) => {
    const p = canvasPoint(event, canvas);
    state.mouse = { panel, x: p.x, y: p.y };
    renderPanels();
  });
  canvas.addEventListener('mouseleave', () => {
    state.mouse = { panel: null, x: 0, y: 0 };
    renderPanels();
  });
}

function moveCursor(dx, dy) {
  const step = 12;
  state.cursor.x = Math.min(PANEL_W - 8, Math.max(8, state.cursor.x + dx * step));
  state.cursor.y = Math.min(PANEL_H - 8, Math.max(8, state.cursor.y + dy * step));
  renderPanels();
}

document.addEventListener('keydown', (event) => {
  if (!state.running && !['Enter', ' '].includes(event.key)) return;
  switch (event.key) {
    case 'ArrowLeft':
      if (state.cursor.x <= 10 && state.cursor.panel === 'right') {
        state.cursor.panel = 'left';
        state.cursor.x = PANEL_W - 12;
      } else moveCursor(-1, 0);
      event.preventDefault();
      break;
    case 'ArrowRight':
      if (state.cursor.x >= PANEL_W - 10 && state.cursor.panel === 'left') {
        state.cursor.panel = 'right';
        state.cursor.x = 12;
      } else moveCursor(1, 0);
      event.preventDefault();
      break;
    case 'ArrowUp':
      moveCursor(0, -1);
      event.preventDefault();
      break;
    case 'ArrowDown':
      moveCursor(0, 1);
      event.preventDefault();
      break;
    case 'Enter':
    case ' ':
      tryMark(state.cursor.panel, state.cursor.x, state.cursor.y);
      event.preventDefault();
      break;
    case 'h':
    case 'H':
      useHint();
      break;
    case 'Tab':
      state.cursor.panel = state.cursor.panel === 'left' ? 'right' : 'left';
      renderPanels();
      event.preventDefault();
      break;
    default:
      break;
  }
});

$('hint-btn').addEventListener('click', useHint);
$('sound-btn').addEventListener('click', () => {
  setMuted(!isMuted());
  $('sound-btn').textContent = isMuted() ? 'Sound: off' : 'Sound: on';
});
$('restart-btn').addEventListener('click', () => startLevel(state.levelIndex));
$('next-btn').addEventListener('click', () => startLevel(state.levelIndex + 1));
$('retry-btn').addEventListener('click', () => startLevel(state.levelIndex));
$('start-btn').addEventListener('click', () => startLevel(0));
document.querySelectorAll('.level-pick').forEach((btn) => {
  btn.addEventListener('click', () => startLevel(Number(btn.dataset.level)));
});

// Keep the hint ring pulsing and the miss mark fading.
function animate() {
  state.pulse += 0.08;
  if (state.running || state.hintId) renderPanels();
  requestAnimationFrame(animate);
}

bindPanel($('panel-left'), 'left');
bindPanel($('panel-right'), 'right');

// Boot: level 1 behind the start overlay, then stage any ?shot= view.
startLevel(0);
state.running = false;
clearInterval(state.timerId);
showOverlay('start', null, null);
renderPanels();
renderHud();
applyShot(state, { startLevel, renderPanels, renderHud, showOverlay });
requestAnimationFrame(animate);
