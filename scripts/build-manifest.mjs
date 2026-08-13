#!/usr/bin/env node
// Aggregates the app catalog into the manifest the portfolio shell imports at
// build time. Content per app is discovered by scanning ACTIVE/ for any
// io_<name>/ bundle (app.json + optional assets/grid-thumbnail.png) — drop an
// app's folder into ACTIVE/ and it appears on the next build, no registration
// step required. Panel presentation (size/paint/weight, order) is an OPTIONAL
// override in grid-config.json; an app with no entry there gets sane
// defaults. ACTIVE/ is gitignored (each app is its own repo/checkout), so this
// manifest — and the thumbnails it copies — are committed: CI builds the site
// from them without needing ACTIVE/ to exist. Dependency-free by design.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ACTIVE_DIR = join(ROOT, 'ACTIVE');
const CONFIG_FILE = join(ROOT, 'grid-config.json');
const I18N_FILE = join(ROOT, 'i18n', 'pl.json');
const THUMBS_OUT = join(ROOT, 'portfolio', 'public', 'external');
const OUT_FILE = join(ROOT, 'portfolio', 'src', 'generated', 'manifest.json');
// How deep under ACTIVE/ to look for an io_<name>/ bundle. Covers both
// ACTIVE/io_<name>/ (a bare bundle) and ACTIVE/<app-repo>/io_<name>/ (a whole
// app repo dropped in, bundle nested wherever that repo keeps it).
const MAX_SCAN_DEPTH = 4;

const STATUSES = ['live', 'wip', 'archived'];
const SLUG_RE = /^[a-z][a-z0-9-]*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Tile size on the grid: "<cols>x<rows>", each 1-3. Default "1x1".
const SIZE_RE = /^[1-3]x[1-3]$/;
// The three printed vinyl colours. Everything coloured is one of these.
const PAINTS = ['red', 'teal', 'amber'];
// Apps tagged `offer` are password-gated: no public URL, the target path is
// derived from the visitor's password in the browser (see portfolio/src/gate.ts).
const OFFER_TAG = 'offer';
// Default paint per category, so a curator only sets `paint` to override.
const PAINT_BY_TAG = { app: 'red', game: 'teal', website: 'amber', offer: 'red' };

/** Deterministic paint for an app naming neither a paint nor a known tag. */
export function paintFor(design, tags) {
  if (typeof design.paint === 'string') return design.paint;
  for (const t of tags) {
    const paint = PAINT_BY_TAG[String(t).toLowerCase()];
    if (paint) return paint;
  }
  let h = 7;
  for (const c of design.name) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return PAINTS[h % PAINTS.length];
}

/** Find every io_<name>/ bundle (a dir holding app.json) under ACTIVE/. */
function discoverBundles() {
  const found = []; // { name, dir }
  if (!existsSync(ACTIVE_DIR)) return found;

  const walk = (dir, depth) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      const m = /^io_(.+)$/i.exec(entry.name);
      if (m && existsSync(join(full, 'app.json'))) {
        found.push({ name: m[1].toLowerCase(), dir: full });
        continue; // a bundle doesn't nest another bundle inside itself
      }
      if (depth < MAX_SCAN_DEPTH) walk(full, depth + 1);
    }
  };
  walk(ACTIVE_DIR, 0);
  return found;
}

/** Resolve a bundle's cover image: assets/grid-thumbnail.png, else the bundle root (legacy). */
function thumbnailFor(dir) {
  const nested = join(dir, 'assets', 'grid-thumbnail.png');
  if (existsSync(nested)) return nested;
  const flat = join(dir, 'grid-thumbnail.png');
  return existsSync(flat) ? flat : null;
}

/** Validate the content file (io_<name>/app.json). */
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
  if (entry.stat != null && typeof entry.stat !== 'string') {
    errors.push(`${source}: "stat" must be a string`);
  }
  // A gated offer deliberately has no public URL — its target is reached only
  // by deriving the path from a password, so it is exempt from this rule.
  const gated = (entry.tags ?? []).some((t) => String(t).toLowerCase() === OFFER_TAG);
  if (!gated && typeof entry.repoUrl !== 'string' && typeof entry.demoUrl !== 'string') {
    errors.push(`${source}: needs "repoUrl" or "demoUrl"`);
  }
}

/** Validate a design entry (grid-config.json) — optional per app. */
function validateDesign(design, source, errors) {
  if (design.size != null && (typeof design.size !== 'string' || !SIZE_RE.test(design.size))) {
    errors.push(`${source}: "size" must be "<cols>x<rows>" with each 1-3 (e.g. "1x1", "2x2"), got "${design.size}"`);
  }
  if (design.paint != null && !PAINTS.includes(design.paint)) {
    errors.push(`${source}: "paint" must be one of ${PAINTS.join('|')}, got "${design.paint}"`);
  }
  if (design.weight != null && (!Number.isInteger(design.weight) || design.weight < 0 || design.weight > 3)) {
    errors.push(`${source}: "weight" must be an integer 0-3`);
  }
}

export function buildManifest() {
  const errors = [];
  const apps = [];

  // CI has no ACTIVE/ — it is gitignored, so the runner only ever gets the
  // manifest and thumbnails this script produced on the author's machine and
  // that were committed alongside the source. Building from those is the
  // normal CI path, not an error; only a local build with a missing ACTIVE/
  // and no manifest to fall back on is broken.
  if (!existsSync(ACTIVE_DIR)) {
    if (existsSync(OUT_FILE)) {
      console.log('Manifest: ACTIVE/ not present — keeping the committed manifest (CI build).');
      return;
    }
    console.error(
      'Manifest build failed: no ACTIVE/ directory and no committed manifest to fall back on.\n' +
        '  - Locally: create ACTIVE/ and drop an app bundle into it (see README.md).\n' +
        '  - On CI: portfolio/src/generated/manifest.json must be committed.',
    );
    process.exit(1);
  }

  const bundles = discoverBundles();
  if (bundles.length === 0) {
    errors.push(
      `ACTIVE/: no io_<name>/ bundle found. Drop an app's io_<name>/ folder (app.json + assets/grid-thumbnail.png) anywhere under ACTIVE/ — see README.md.`,
    );
  }

  // Collapse duplicate slugs (two bundles claiming the same name) into an error.
  const bySlug = new Map();
  for (const b of bundles) {
    if (bySlug.has(b.name)) {
      errors.push(`ACTIVE/: two bundles both resolve to "${b.name}" (${bySlug.get(b.name).dir} and ${b.dir})`);
      continue;
    }
    bySlug.set(b.name, b);
  }

  let config = { apps: [] };
  if (existsSync(CONFIG_FILE)) {
    try {
      config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      errors.push(`grid-config.json: invalid JSON — ${e.message}`);
    }
  }
  const designByName = new Map();
  for (const design of config.apps ?? []) {
    if (typeof design.name !== 'string' || !SLUG_RE.test(design.name)) {
      errors.push(`grid-config.json: "name" is required and must match ${SLUG_RE}, got "${design.name}"`);
      continue;
    }
    validateDesign(design, `grid-config.json [${design.name}]`, errors);
    designByName.set(design.name, design);
  }

  let i18n = { ui: {}, apps: {} };
  if (existsSync(I18N_FILE)) {
    try {
      const parsed = JSON.parse(readFileSync(I18N_FILE, 'utf8'));
      const { _comment, ...rest } = parsed;
      i18n = { ui: {}, apps: {}, ...rest };
    } catch (e) {
      errors.push(`i18n/pl.json: invalid JSON — ${e.message}`);
    }
  }

  mkdirSync(THUMBS_OUT, { recursive: true });

  // Display order: apps listed in grid-config.json first (curated order),
  // then any discovered app with no entry there, appended alphabetically.
  const configured = (config.apps ?? []).map((d) => d.name).filter((n) => bySlug.has(n));
  const unconfigured = [...bySlug.keys()].filter((n) => !designByName.has(n)).sort();
  const order = [...new Set([...configured, ...unconfigured])];

  for (const name of order) {
    const { dir } = bySlug.get(name);
    const design = designByName.get(name) ?? { name };
    const source = `ACTIVE/.../io_${name}`;

    const contentPath = join(dir, 'app.json');
    let content;
    try {
      content = JSON.parse(readFileSync(contentPath, 'utf8'));
    } catch (e) {
      errors.push(`${source}/app.json: invalid JSON — ${e.message}`);
      continue;
    }
    validateContent(content, `${source}/app.json`, errors);
    if (content.hidden === true) continue;

    // Thumbnail: copy <bundle>/[assets/]grid-thumbnail.png -> portfolio/public/external/<name>.png
    let screenshot = null;
    const thumb = thumbnailFor(dir);
    if (thumb) {
      copyFileSync(thumb, join(THUMBS_OUT, `${name}.png`));
      screenshot = `/external/${name}.png`;
    }

    const tags = content.tags ?? [];
    const gated = tags.some((t) => String(t).toLowerCase() === OFFER_TAG);
    const year = content.year ?? Number(String(content.added).slice(0, 4));
    apps.push({
      slug: name,
      kind: 'external',
      title: content.title,
      description: content.description,
      stat: content.stat ?? null,
      tags,
      status: content.status ?? 'live',
      added: content.added,
      year,
      role: content.role ?? null,
      // A gated offer has no public target; the browser derives one from the
      // password the visitor types.
      url: gated ? null : (content.demoUrl ?? content.repoUrl),
      repoUrl: gated ? null : (content.repoUrl ?? null),
      demoUrl: gated ? null : (content.demoUrl ?? null),
      screenshot,
      gated,
      paint: paintFor({ name, ...design }, tags),
      size: design.size ?? '1x1',
      weight: design.weight ?? 0,
      i18n: i18n.apps[name] ? { pl: i18n.apps[name] } : undefined,
    });
  }

  if (errors.length > 0) {
    console.error(`Manifest build failed with ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  // Display order follows grid-config.json (curated) then discovery; no auto-sort.
  const manifest = { generatedAt: new Date().toISOString(), i18n: { pl: i18n }, apps };
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Manifest: ${apps.length} app(s) discovered under ACTIVE/`);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) buildManifest();
