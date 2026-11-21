// main.ts — hands in "The Orrery Keeper's Study", a spot-the-difference
// game that runs offline from static files. Node 22, standard library only.
//
// It copies this repository's game/ and screenshots/ into the output
// directory and writes dossier.json there with buildDossier from the
// vendored make.fun library, so the judge reads exactly what is on disk.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the gate: at most 4 screenshots, each at most 256 KiB;
// game/ at most 993 files and 48 MiB, no path over 1000 bytes; the dossier
// text at most 160 KiB. An entry that breaks a cap is refused, so the
// program refuses first rather than handing in a broken entry. After the
// write, it prints the output inventory so a local run can be eyeballed.
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`wrote ${outputDir}/game, ${outputDir}/screenshots and ${dossierPath}`);
