#!/usr/bin/env node
// Aggregates the app catalog into the manifest the portfolio shell imports at
// build time. Content per app lives in APPS/io_<name>/ (app.json + optional
// grid-thumbnail.png); grid presentation (size/color/glow, order) lives in
// grid-config.json. Dependency-free by design.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPS_DIR = join(ROOT, 'APPS');
const CONFIG_FILE = join(ROOT, 'grid-config.json');
const THUMBS_OUT = join(ROOT, 'portfolio', 'public', 'external');
const OUT_FILE = join(ROOT, 'portfolio', 'src', 'generated', 'manifest.json');

const STATUSES = ['live', 'wip', 'archived'];
const SLUG_RE = /^[a-z][a-z0-9-]*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Tile size on the grid: "<cols>x<rows>", each 1-3. Default "1x1".
const SIZE_RE = /^[1-3]x[1-3]$/;

/** Deterministic 0-360 hue from a name, for the gradient cover fallback. */
export function hueFromSlug(slug) {
  let h = 7;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h % 360;
}

/** Validate the content file (APPS/io_<name>/app.json). */
function validateContent(entry, source, errors) {
  const req = (field, type) => {
    if (typeof entry[field] !== type || (type === 'string' && !entry[field].trim())) {
      errors.push(`${source}: "${field}" is required (${type})`);
    }
  };
  req('title', 'string');
  req('description', 'string');
  req('added', 'string');
  if (typeof entry.added === 'string' && !DATE_RE.test(entry.added)) {
    errors.push(`${source}: "added" must be an ISO date YYYY-MM-DD, got "${entry.added}"`);
  }
  if (entry.status != null && !STATUSES.includes(entry.status)) {
    errors.push(`${source}: "status" must be one of ${STATUSES.join('|')}, got "${entry.status}"`);
  }
  if (entry.tags != null && (!Array.isArray(entry.tags) || entry.tags.some((t) => typeof t !== 'string'))) {
    errors.push(`${source}: "tags" must be an array of strings`);
  }
  if (typeof entry.repoUrl !== 'string' && typeof entry.demoUrl !== 'string') {
    errors.push(`${source}: needs "repoUrl" or "demoUrl"`);
  }
}

/** Validate the design entry (grid-config.json). */
function validateDesign(entry, source, errors) {
  if (entry.size != null && (typeof entry.size !== 'string' || !SIZE_RE.test(entry.size))) {
    errors.push(`${source}: "size" must be "<cols>x<rows>" with each 1-3 (e.g. "1x1", "2x2"), got "${entry.size}"`);
  }
  for (const hue of ['accentHue', 'accentHue2']) {
    if (entry[hue] != null && (typeof entry[hue] !== 'number' || entry[hue] < 0 || entry[hue] > 360)) {
      errors.push(`${source}: "${hue}" must be a number 0-360`);
    }
  }
  if (entry.glow != null && (!Number.isInteger(entry.glow) || entry.glow < 0 || entry.glow > 3)) {
    errors.push(`${source}: "glow" must be an integer 0-3`);
  }
}

export function buildManifest() {
  const errors = [];
  const apps = [];
  const seenNames = new Set();

  let config = { apps: [] };
  if (existsSync(CONFIG_FILE)) {
    try {
      config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      errors.push(`grid-config.json: invalid JSON — ${e.message}`);
    }
  } else {
    errors.push('grid-config.json: not found');
  }

  mkdirSync(THUMBS_OUT, { recursive: true });

  for (const design of config.apps ?? []) {
    const name = design.name ?? '(missing name)';
    const source = `grid-config.json [${name}]`;
    if (typeof design.name !== 'string' || !SLUG_RE.test(design.name)) {
      errors.push(`${source}: "name" is required and must match ${SLUG_RE}`);
      continue;
    }
    if (seenNames.has(design.name)) {
      errors.push(`${source}: "name" collides with another app`);
      continue;
    }
    seenNames.add(design.name);
    validateDesign(design, source, errors);

    const dir = join(APPS_DIR, `io_${name}`);
    const contentPath = join(dir, 'app.json');
    if (!existsSync(contentPath)) {
      errors.push(`${source}: missing content folder APPS/io_${name}/app.json`);
      continue;
    }
    let content;
    try {
      content = JSON.parse(readFileSync(contentPath, 'utf8'));
    } catch (e) {
      errors.push(`APPS/io_${name}/app.json: invalid JSON — ${e.message}`);
      continue;
    }
    validateContent(content, `APPS/io_${name}/app.json`, errors);
    if (content.hidden === true) continue;

    // Thumbnail: copy APPS/io_<name>/grid-thumbnail.png -> portfolio/public/external/<name>.png
    let screenshot = null;
    const thumb = join(dir, 'grid-thumbnail.png');
    if (existsSync(thumb)) {
      copyFileSync(thumb, join(THUMBS_OUT, `${name}.png`));
      screenshot = `/external/${name}.png`;
    }

    const year = content.year ?? Number(String(content.added).slice(0, 4));
    apps.push({
      slug: name,
      kind: 'external',
      title: content.title,
      description: content.description,
      tags: content.tags ?? [],
      status: content.status ?? 'live',
      added: content.added,
      year,
      role: content.role ?? null,
      url: content.demoUrl ?? content.repoUrl,
      repoUrl: content.repoUrl ?? null,
      demoUrl: content.demoUrl ?? null,
      screenshot,
      accentHue: design.accentHue ?? hueFromSlug(name),
      accentHue2: design.accentHue2 ?? null,
      size: design.size ?? '1x1',
      glow: design.glow ?? 0,
    });
  }

  if (errors.length > 0) {
    console.error(`Manifest build failed with ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  // Display order follows grid-config.json (curated); no auto-sort.
  const manifest = { generatedAt: new Date().toISOString(), apps };
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Manifest: ${apps.length} app(s) from grid-config.json + APPS/`);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) buildManifest();
