// shots.js — stages the game for screenshots. A ?shot= query picks a
// frozen moment: start shows the title screen, play shows level 2 mid-hunt
// with three differences already ringed, and end shows level 3 one find
// from victory. The timer is stopped so every shot is identical each run.

import { LEVELS, levelDifferences } from './differences.js';

function freeze(state) {
  state.running = false;
  clearInterval(state.timerId);
}

export function applyShot(state, hooks) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  document.body.classList.add('shot');

  if (shot === 'start') {
    hooks.startLevel(0);
    freeze(state);
    hooks.showOverlay('start', null, null);
    hooks.renderPanels();
    hooks.renderHud();
    return;
  }

  if (shot === 'play') {
    hooks.startLevel(1);
    freeze(state);
    state.found = new Set(['moon', 'clock', 'cat']);
    state.totalFound = 3;
    state.score = 340;
    state.timeLeft = 134;
    state.hintsLeft = 2;
    state.cursor = { panel: 'right', x: 340, y: 238 };
    hooks.renderPanels();
    hooks.renderHud();
    const toast = document.getElementById('toast');
    toast.textContent = 'The cat moved its tail! +120';
    toast.classList.add('show');
    return;
  }

  if (shot === 'end') {
    hooks.startLevel(2);
    freeze(state);
    const diffs = levelDifferences(LEVELS[2]);
    state.found = new Set(diffs.slice(0, 8).map((d) => d.id));
    state.totalFound = 18;
    state.score = 2140;
    state.timeLeft = 23;
    state.hintsLeft = 1;
    state.cursor = { panel: 'left', x: 80, y: 300 };
    hooks.renderPanels();
    hooks.renderHud();
    const toast = document.getElementById('toast');
    toast.textContent = 'One difference left — find it!';
    toast.classList.add('show');
  }
}
