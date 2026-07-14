#!/usr/bin/env node
// Builds the portfolio shell and assembles the dist/ that GitHub Pages serves.
// The hub is a catalog of external apps (each hosted in its own repo), so there
// are no in-repo apps to build — grid thumbnails are copied into
// portfolio/public/external/ by buildManifest() and ship inside portfolio/dist.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './build-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  // shell: true is required on Windows (npm is npm.cmd)
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: ROOT });
  if (res.status !== 0) {
    console.error(`FAILED: ${cmd} ${args.join(' ')}`);
    process.exit(res.status ?? 1);
  }
}

function dirSize(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(p) : statSync(p).size;
  }
  return total;
}

rmSync(DIST, { recursive: true, force: true });
buildManifest();

run('npm', ['run', 'build', '-w', 'portfolio']);

// Assemble: the shell (with its public/external/*.png thumbnails) IS the site.
cpSync(join(ROOT, 'portfolio', 'dist'), DIST, { recursive: true });
writeFileSync(join(DIST, '.nojekyll'), '');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('Assembled dist/ is missing index.html');
  process.exit(1);
}

const sizeMb = dirSize(DIST) / (1024 * 1024);
console.log(`\nAssembled dist/: ${sizeMb.toFixed(1)} MB`);
if (sizeMb > 500) {
  console.warn('WARN: dist/ is over 500 MB — GitHub Pages hard limit is 1 GB.');
}
console.log('Preview with: npm run preview');
