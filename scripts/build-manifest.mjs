#!/usr/bin/env node
// Aggregates apps/*/app.meta.json + external-apps.json into the manifest the
// portfolio shell imports at build time. Dependency-free by design.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPS_DIR = join(ROOT, 'apps');
const EXTERNAL_FILE = join(ROOT, 'external-apps.json');
const OUT_FILE = join(ROOT, 'portfolio', 'src', 'generated', 'manifest.json');

const STATUSES = ['live', 'wip', 'archived'];
const SLUG_RE = /^[a-z][a-z0-9-]*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Deterministic 0-360 hue from a slug, for the gradient cover fallback. */
export function hueFromSlug(slug) {
  let h = 7;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h % 360;
}

function validate(entry, source, errors) {
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
  if (entry.accentHue != null && (typeof entry.accentHue !== 'number' || entry.accentHue < 0 || entry.accentHue > 360)) {
    errors.push(`${source}: "accentHue" must be a number 0-360`);
  }
}

function normalize(entry, slug, kind) {
  const year = entry.year ?? Number(String(entry.added).slice(0, 4));
  const base = {
    slug,
    kind,
    title: entry.title,
    description: entry.description,
    tags: entry.tags ?? [],
    status: entry.status ?? 'live',
    added: entry.added,
    year,
    role: entry.role ?? null,
    accentHue: entry.accentHue ?? hueFromSlug(slug),
    featured: entry.featured ?? false,
  };
  if (kind === 'internal') {
    return {
      ...base,
      url: `/apps/${slug}/`,
      repoUrl:
        entry.repoUrl ??
        `https://github.com/Gyeboorovsky/Gyeboorovsky.github.io/tree/main/apps/${slug}`,
      demoUrl: null,
      screenshot: entry.screenshot ? `/apps/${slug}/${entry.screenshot}` : null,
    };
  }
  return {
    ...base,
    url: entry.demoUrl ?? entry.repoUrl,
    repoUrl: entry.repoUrl ?? null,
    demoUrl: entry.demoUrl ?? null,
    screenshot: entry.screenshot ? `/${entry.screenshot}` : null,
  };
}

export function buildManifest() {
  const errors = [];
  const apps = [];
  const seenSlugs = new Set();

  // Internal apps: every apps/<slug>/app.meta.json
  if (existsSync(APPS_DIR)) {
    for (const dir of readdirSync(APPS_DIR, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const slug = dir.name;
      const metaPath = join(APPS_DIR, slug, 'app.meta.json');
      if (!existsSync(metaPath)) {
        console.warn(`WARN apps/${slug}: no app.meta.json — skipped`);
        continue;
      }
      const source = `apps/${slug}/app.meta.json`;
      if (!SLUG_RE.test(slug)) {
        errors.push(`${source}: folder name must match ${SLUG_RE} to be a valid slug`);
        continue;
      }
      let meta;
      try {
        meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      } catch (e) {
        errors.push(`${source}: invalid JSON — ${e.message}`);
        continue;
      }
      validate(meta, source, errors);
      seenSlugs.add(slug);
      if (meta.hidden === true) continue;
      apps.push(normalize(meta, slug, 'internal'));
    }
  }

  // External apps
  let externalCount = 0;
  if (existsSync(EXTERNAL_FILE)) {
    let external;
    try {
      external = JSON.parse(readFileSync(EXTERNAL_FILE, 'utf8'));
    } catch (e) {
      errors.push(`external-apps.json: invalid JSON — ${e.message}`);
      external = { apps: [] };
    }
    for (const entry of external.apps ?? []) {
      const slug = entry.slug ?? '(missing slug)';
      const source = `external-apps.json [${slug}]`;
      if (typeof entry.slug !== 'string' || !SLUG_RE.test(entry.slug)) {
        errors.push(`${source}: "slug" is required and must match ${SLUG_RE}`);
        continue;
      }
      if (seenSlugs.has(entry.slug)) {
        errors.push(`${source}: slug collides with another app`);
        continue;
      }
      seenSlugs.add(entry.slug);
      validate(entry, source, errors);
      if (typeof entry.repoUrl !== 'string' && typeof entry.demoUrl !== 'string') {
        errors.push(`${source}: needs "repoUrl" or "demoUrl"`);
      }
      if (entry.hidden === true) continue;
      externalCount++;
      apps.push(normalize(entry, entry.slug, 'external'));
    }
  }

  if (errors.length > 0) {
    console.error(`Manifest build failed with ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  // Sort: archived last; featured first; then newest first.
  apps.sort((a, b) => {
    const arch = (a.status === 'archived' ? 1 : 0) - (b.status === 'archived' ? 1 : 0);
    if (arch !== 0) return arch;
    const feat = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (feat !== 0) return feat;
    return b.added.localeCompare(a.added);
  });

  const manifest = { generatedAt: new Date().toISOString(), apps };
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `Manifest: ${apps.length} app(s) — ${apps.length - externalCount} internal, ${externalCount} external`,
  );
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) buildManifest();
