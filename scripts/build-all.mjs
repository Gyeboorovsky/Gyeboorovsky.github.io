#!/usr/bin/env node
// Builds the portfolio + every app and assembles the combined dist/ that
// GitHub Pages serves: portfolio at the root, each app at /apps/<slug>/.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './build-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPS_DIR = join(ROOT, 'apps');
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

// Discover buildable apps: apps/<slug>/ with package.json + app.meta.json
const appSlugs = [];
if (existsSync(APPS_DIR)) {
  for (const dir of readdirSync(APPS_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const hasPkg = existsSync(join(APPS_DIR, dir.name, 'package.json'));
    const hasMeta = existsSync(join(APPS_DIR, dir.name, 'app.meta.json'));
    if (hasPkg && hasMeta) appSlugs.push(dir.name);
    else console.warn(`WARN apps/${dir.name}: missing package.json or app.meta.json — not built`);
  }
}

run('npm', ['run', 'build', '-w', 'portfolio']);
for (const slug of appSlugs) run('npm', ['run', 'build', '-w', `apps/${slug}`]);

// Assemble
cpSync(join(ROOT, 'portfolio', 'dist'), DIST, { recursive: true });
for (const slug of appSlugs) {
  cpSync(join(APPS_DIR, slug, 'dist'), join(DIST, 'apps', slug), { recursive: true });
}
writeFileSync(join(DIST, '.nojekyll'), '');

// Sanity checks
const missing = [
  join(DIST, 'index.html'),
  ...appSlugs.map((s) => join(DIST, 'apps', s, 'index.html')),
].filter((p) => !existsSync(p));
if (missing.length > 0) {
  console.error('Assembled dist/ is missing expected files:');
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}

const sizeMb = dirSize(DIST) / (1024 * 1024);
console.log(`\nAssembled dist/: portfolio + ${appSlugs.length} app(s), ${sizeMb.toFixed(1)} MB`);
if (sizeMb > 500) {
  console.warn('WARN: dist/ is over 500 MB — GitHub Pages hard limit is 1 GB.');
}
console.log('Preview with: npm run preview');
