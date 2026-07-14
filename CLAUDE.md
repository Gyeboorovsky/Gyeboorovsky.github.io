# Gyeboorovsky.github.io — portfolio monorepo

Static portfolio on GitHub Pages, live at https://gyeboorovsky.github.io/.
The portfolio shell (vanilla TS + Vite) lives in `portfolio/` and is served at
the site root; each internal app is an independent Vite + TypeScript project
under `apps/<slug>/`, served at `/apps/<slug>/`. npm workspaces hold it
together; one combined `dist/` is deployed by GitHub Actions on every push to
`main`.

## ISOLATION RULES (hard requirement)

- When working on `apps/<x>`: read/edit ONLY `apps/<x>/**`, `shared/**`, and
  root configs/scripts. NEVER read, grep, glob, or open any other `apps/<y>/` —
  not for "reference", not for "patterns". Scope all Grep/Glob calls to
  `apps/<x>/`.
- Apps NEVER import from other apps or from `portfolio/`. The only shared code
  is `@portfolio/shared` (tokens.css, base.css, supabase helper). Keep it tiny.
- When working on the portfolio shell: touch `portfolio/**`, `shared/**`,
  `scripts/**`, `external-apps.json`. Do not open `apps/*/src` — at most an
  app's `app.meta.json`.
- Each app, the shell, and `shared/` has its own CLAUDE.md with its own
  context. Read only the one for the folder you are working in.

## GitHub Pages constraints (every app must respect these)

- Static hosting only: no server code, no env secrets — everything shipped is
  public. Backend = Supabase from the browser (see Conventions).
- Site ≤ 1 GB total; ~100 GB/month bandwidth (soft limit). Keep apps small.
- The CDN caches assets for ~10 minutes — after a deploy, changes can take a
  few minutes to show up. Hard-refresh when verifying.
- No history-mode SPA routing (no server rewrites). Use hash routing (`#/...`)
  or no routing at all.
- Every internal app builds with base `/apps/<slug>/` — derived automatically
  in its `vite.config.ts` from the folder name. Never hardcode absolute asset
  paths.
- Deploys take ~1–2 minutes via Actions after pushing to `main`.

## How to add a new internal app

1. `node scripts/new-app.mjs <slug>` (add `--react` for a React app,
   `--title "Display Name"` to override the title)
2. `npm install` (links the new workspace)
3. Build the app — work only inside `apps/<slug>/`
4. Fill in `apps/<slug>/app.meta.json`; optionally set
   `"screenshot": "screenshot.svg"` (the file lives in the app's own `public/`)
5. `npm run build` then `npm run preview` → verify the card and `/apps/<slug>/`
6. Commit and push to `main`. No other file in the repo needs to change.

## How to add an external app card (app lives in another repo)

Append one entry to `external-apps.json`. Optional screenshot goes in
`portfolio/public/external/` and is referenced as `"external/<file>"`.

## Commands (repo root, Windows-friendly — all scripts are Node .mjs)

- `npm install` — install/link all workspaces
- `npm run dev` — portfolio shell dev server (regenerates the manifest first)
- `npm run build` — build everything into `dist/`
- `npm run preview` — serve the assembled `dist/` at http://localhost:4173
- `npm run manifest` — regenerate the app manifest only
- `npm run new-app -- <slug> [--react] [--title "..."]` — scaffold a new app
- Per app: `cd apps/<slug>` then `npm run dev`

## app.meta.json fields (internal apps)

| Field | Required | Notes |
|---|---|---|
| title | yes | Card title |
| description | yes | 1–2 sentences shown on the card |
| added | yes | ISO date `YYYY-MM-DD`, drives sort order |
| tags | no | e.g. `["tool"]`, drives the filter pills |
| status | no | `live` (default) / `wip` (badge) / `archived` (dimmed, sorted last) |
| year | no | shown on the card; defaults to the year of `added` |
| role | no | e.g. "Design & code" |
| screenshot | no | filename in the app's `public/`; omit/null → gradient cover |
| accentHue | no | 0–360, hue of the gradient cover; defaults to a hash of the slug |
| featured | no | the featured card is the big 2×2 card at the top of the grid |
| repoUrl | no | "source" link; defaults to this repo's `apps/<slug>` folder |
| hidden | no | `true` removes the card entirely |

## Conventions

- TypeScript strict everywhere.
- Import `@portfolio/shared/tokens.css` and `@portfolio/shared/base.css` before
  app styles. ALL visual values come from tokens (`var(--...)`) — never
  hardcode colors. The design system is swapped by editing `shared/tokens.css`
  only.
- Fonts: Google Fonts `<link>` in each app's `index.html` (Space Grotesk,
  Instrument Sans, JetBrains Mono) — the generator templates include it.
- Supabase: browser + PUBLIC anon key + Row Level Security only. The anon key
  is committed on purpose; NEVER a service_role key. Use
  `import { createAppClient } from '@portfolio/shared/supabase'` plus a
  per-app `src/supabase-config.ts`. Start with one free-tier Supabase project
  shared by all apps (prefix tables per app, e.g. `myapp_scores`); RLS on
  every table, no exceptions.

## Troubleshooting

- Orchestration scripts spawn npm with `shell: true` — required on Windows.
- If Vite complains about `@portfolio/shared`: add
  `optimizeDeps: { exclude: ['@portfolio/shared'] }` to that app's
  vite.config.ts.
- `design/` is the visual comp for the portfolio shell — reference only, never
  deployed, never edited.
- `portfolio/src/generated/manifest.json` is generated (gitignored) — edit
  `apps/*/app.meta.json` or `external-apps.json` instead, then
  `npm run manifest`.
