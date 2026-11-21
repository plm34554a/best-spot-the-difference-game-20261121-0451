// differences.js — the hunt itself: every difference in the study and the
// three levels that use them. A difference is a spot on the picture (x, y,
// radius in panel pixels) plus the short label shown when it is found.
// Level 1 shows the five easiest spots; level 2 adds two subtler ones and
// level 3 adds the last two, so the hunt keeps growing after ten finds.

export const DIFFERENCES = [
  { id: 'moon',     x: 95,  y: 75,  r: 26, label: 'The moon changed phase' },
  { id: 'clock',    x: 305, y: 64,  r: 28, label: 'The clock hands moved' },
  { id: 'cat',      x: 408, y: 330, r: 24, label: 'The cat moved its tail' },
  { id: 'book',     x: 468, y: 158, r: 18, label: 'A book changed colour' },
  { id: 'teapot',   x: 233, y: 298, r: 20, label: 'The teapot lost its spout' },
  { id: 'candle',   x: 145, y: 182, r: 18, label: 'The candle went out' },
  { id: 'orrery',   x: 340, y: 238, r: 20, label: 'A planet lost its ring' },
  { id: 'painting', x: 456, y: 76,  r: 20, label: 'The painting changed sky' },
  { id: 'plant',    x: 80,  y: 300, r: 24, label: 'The plant lost leaves' },
];

export const LEVELS = [
  {
    id: 1,
    name: 'Morning in the Study',
    timeLimit: 180,
    diffIds: ['moon', 'clock', 'cat', 'book', 'teapot'],
    blurb: 'Five easy spots to warm up your eyes.',
  },
  {
    id: 2,
    name: 'Lamplight',
    timeLimit: 150,
    diffIds: ['moon', 'clock', 'cat', 'book', 'teapot', 'candle', 'orrery'],
    blurb: 'Two more spots hide in the lamplight. The clock is ticking faster.',
  },
  {
    id: 3,
    name: 'Midnight Orrery',
    timeLimit: 120,
    diffIds: ['moon', 'clock', 'cat', 'book', 'teapot', 'candle', 'orrery', 'painting', 'plant'],
    blurb: 'All nine spots, two minutes, no mercy. The keeper is watching.',
  },
];

export function levelDifferences(level) {
  const wanted = new Set(level.diffIds);
  return DIFFERENCES.filter((d) => wanted.has(d.id));
}

export function differenceById(id) {
  return DIFFERENCES.find((d) => d.id === id);
}
