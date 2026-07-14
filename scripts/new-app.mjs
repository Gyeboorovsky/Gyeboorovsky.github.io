#!/usr/bin/env node
// Scaffolds a new internal app:
//   node scripts/new-app.mjs <slug> [--react] [--supabase] [--title "Name"]
// Adding an app never touches any other app's files.
import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hueFromSlug } from './build-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SLUG_RE = /^[a-z][a-z0-9-]*$/;

const args = process.argv.slice(2);
const react = args.includes('--react');
const supabase = args.includes('--supabase');
const titleIdx = args.indexOf('--title');
const titleArg = titleIdx !== -1 ? args[titleIdx + 1] : undefined;
const slug = args.find((a, i) => !a.startsWith('--') && (titleIdx === -1 || i !== titleIdx + 1));

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  console.error(
    'Usage: node scripts/new-app.mjs <slug> [--react] [--supabase] [--title "Display Name"]',
  );
  process.exit(1);
}

if (!slug) fail('missing <slug>');
if (!SLUG_RE.test(slug)) fail(`slug must match ${SLUG_RE} (lowercase, digits, dashes)`);

const dest = join(ROOT, 'apps', slug);
if (existsSync(dest)) fail(`apps/${slug} already exists`);

const externalFile = join(ROOT, 'external-apps.json');
if (existsSync(externalFile)) {
  const external = JSON.parse(readFileSync(externalFile, 'utf8'));
  if ((external.apps ?? []).some((a) => a.slug === slug)) {
    fail(`slug "${slug}" already used by an entry in external-apps.json`);
  }
}

const title = titleArg ?? slug.replace(/(^|-)([a-z])/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase());
const today = new Date().toISOString().slice(0, 10);
const replacements = {
  '{{SLUG}}': slug,
  // Postgres identifiers can't contain '-' unquoted; use this for table names.
  '{{SLUG_SNAKE}}': slug.replaceAll('-', '_'),
  '{{TITLE}}': title,
  '{{DATE}}': today,
  '{{YEAR}}': String(new Date().getFullYear()),
  '{{HUE}}': String(hueFromSlug(slug)),
};

const template = join(ROOT, 'scripts', 'templates', react ? 'app-react' : 'app-vanilla');
cpSync(template, dest, { recursive: true });

function expandTemplates(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      expandTemplates(p);
    } else if (entry.name.endsWith('.tpl')) {
      let content = readFileSync(p, 'utf8');
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replaceAll(key, value);
      }
      writeFileSync(p.slice(0, -'.tpl'.length), content);
      rmSync(p);
    }
  }
}
expandTemplates(dest);

if (supabase) {
  const fragments = join(ROOT, 'scripts', 'templates', 'fragments');
  const destSrc = join(dest, 'src');
  for (const file of ['supabase-config.ts.tpl', 'supabase-example.ts.tpl']) {
    let content = readFileSync(join(fragments, file), 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replaceAll(key, value);
    }
    writeFileSync(join(destSrc, file.slice(0, -'.tpl'.length)), content);
  }
}

console.log(`Created apps/${slug} (${react ? 'React' : 'vanilla TS'}${supabase ? ' + Supabase' : ''})`);
console.log('Next steps:');
console.log('  1. npm install                      (links the new workspace)');
console.log(`  2. cd apps/${slug} && npm run dev    (dev server at /apps/${slug}/)`);
console.log(`  3. Edit apps/${slug}/app.meta.json   (card text, tags, status, screenshot)`);
if (supabase) {
  console.log(
    `  4. Fill in apps/${slug}/src/supabase-config.ts with your project URL + anon key`,
  );
  console.log('     (see CLAUDE.md → Backend & database for setup + free-tier notes)');
  console.log('  5. npm run build && npm run preview (verify it appears on the grid)');
} else {
  console.log('  4. npm run build && npm run preview (verify it appears on the grid)');
}
