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
  public. Backend = a BaaS called from the browser, chosen per app (see
  "Backend & database" below).
- Site ≤ 1 GB total; ~100 GB/month bandwidth (soft limit). Keep apps small.
- The CDN caches assets for ~10 minutes — after a deploy, changes can take a
  few minutes to show up. Hard-refresh when verifying.
- No history-mode SPA routing (no server rewrites). Use hash routing (`#/...`)
  or no routing at all.
- Every internal app builds with base `/apps/<slug>/` — derived automatically
  in its `vite.config.ts` from the folder name. Never hardcode absolute asset
  paths.
- Deploys take ~1–2 minutes via Actions after pushing to `main`.

## Backend & database (optional, per app)

Backend choice is **each app's own decision**, not a repo-wide one — this
follows directly from the isolation rules above. One app can use Supabase,
another Firebase, another nothing at all, and they never interact. This also
means each app can have its own database: you are not forced to share one
backend project across every app on the site.

Whatever you pick, the same rule applies everywhere: **static hosting only,
so only public/publishable keys are ever committed — never a secret/admin/
service-role key.** Access control lives in the backend itself (RLS for
Postgres/Supabase, Security Rules for Firebase/Firestore), not in keeping the
key hidden, because it can't be hidden on GitHub Pages.

### Supabase (the built-in path)

`shared/supabase.ts` provides `createAppClient({ url, anonKey })` for exactly
this reason. To use it in an app:

1. Create a table in your Supabase project's dashboard (SQL editor or table
   editor), then **enable Row Level Security on it** — RLS on every table, no
   exceptions. A minimal read-only-to-everyone policy looks like:
   ```sql
   alter table my_table enable row level security;
   create policy "public read" on my_table for select using (true);
   -- add a separate policy for insert/update/delete, scoped as tightly as
   -- your app needs — e.g. restrict writes entirely, or key them off a
   -- per-row secret/device id if you don't have real user auth.
   ```
2. `node scripts/new-app.mjs <slug> --supabase` scaffolds
   `src/supabase-config.ts` (paste your project URL + anon key from
   Settings → API) and `src/supabase-example.ts` (a working query to build
   from). Already have an app? Copy those two files by hand instead.
3. Import `createAppClient` from `@portfolio/shared/supabase` — nothing else
   needs to change; apps that never import it don't bundle `supabase-js` at
   all (the shared package's exports are per-file, so it's opt-in per app).

**Free-tier realities to plan around** (check Supabase's current pricing
page for exact numbers — these move over time, treat what follows as
directional, not a guarantee):
- Free projects **pause automatically after about a week with no API
  activity**. A hobby app that isn't visited often *will* go dark until
  someone opens the Supabase dashboard and manually resumes it — there's no
  free way to prevent this, so it's an accepted tradeoff of staying free, not
  a bug to fix.
- A free account has a **limited number of simultaneously active free
  projects**. Because of this, prefer **reusing one Supabase project across
  several small apps** (prefix tables per app, e.g. `tetris_scores`,
  `habits_entries`, or use a separate Postgres schema per app for stronger
  separation within one project) over spinning up a new project for every
  app — that's the fastest way to run out of free projects.
- Database size, bandwidth, and storage are all capped on the free tier too.
  Keep payloads small; this is a portfolio of hobby apps, not a product.

### Firebase or another BaaS (equally valid, per app)

Nothing here is Supabase-specific by requirement — it's just the one with a
shared helper. If an app is better served by Firebase (or anything else):
add its SDK as *that app's own* dependency in `apps/<slug>/package.json`
(never in `shared/`), commit a per-app public config file the same way, and
enforce access with that backend's own rules (Firestore/RTDB Security Rules
for Firebase). There's no scaffold for this yet — ask for a `--firebase`
generator template (mirroring `--supabase`) once you're actually building one
this way, rather than hand-rolling it each time.

Firebase's free **Spark** plan is worth knowing about as a contrast to
Supabase: it does **not** auto-pause on inactivity, and a free Google account
can hold many separate Spark projects, each with its own free quota — no
shared-project juggling the way Supabase's project limit forces. The
tradeoff is Spark's per-service quotas (Firestore reads/writes, Auth,
Hosting, etc.) are hard caps with no billing account attached, so check
Firebase's current pricing page for what those caps actually are before
relying on it for anything with real traffic.

**Rule of thumb:** many small, low-traffic apps that can tolerate an
occasional "asleep" backend → share one Supabase project. An app you want
always-on for free, or you're hitting Supabase's project-count ceiling →
consider a separate Firebase Spark project for just that app.

## How to add a new internal app

1. `node scripts/new-app.mjs <slug>` (add `--react` for a React app,
   `--supabase` to scaffold Supabase config, `--title "Display Name"` to
   override the title)
2. `npm install` (links the new workspace)
3. Build the app — work only inside `apps/<slug>/`
4. Fill in `apps/<slug>/app.meta.json`; optionally set
   `"screenshot": "screenshot.svg"` (the file lives in the app's own `public/`)
5. `npm run build` then `npm run preview` → verify the card and `/apps/<slug>/`
6. Commit and push to `main`. No other file in the repo needs to change.

## How to add an external app card (app lives in another repo)

Append one entry to `external-apps.json`. These show as a small link in the
"Other projects" list below the grid, not as a full tile — the main grid is
reserved for apps that actually run in-browser (internal apps). Optional
screenshot goes in `portfolio/public/external/` and is referenced as
`"external/<file>"`, though it's currently unused by the list view.

## Commands (repo root, Windows-friendly — all scripts are Node .mjs)

- `npm install` — install/link all workspaces
- `npm run dev` — portfolio shell dev server (regenerates the manifest first)
- `npm run build` — build everything into `dist/`
- `npm run preview` — serve the assembled `dist/` at http://localhost:4173
- `npm run manifest` — regenerate the app manifest only
- `npm run new-app -- <slug> [--react] [--supabase] [--title "..."]` —
  scaffold a new app
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
- Responsive by default: every app and the shell must work from ~360px mobile
  up to desktop. The `viewport` meta tag ships in every `index.html`; use fluid
  units (`clamp`, `%`, `min/max`) and media queries, and verify at both a phone
  width and a desktop width before shipping.
- Backend/database: see "Backend & database" above — it's a per-app choice.

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
