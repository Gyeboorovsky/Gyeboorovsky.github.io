# {{TITLE}} (apps/{{SLUG}})

<!-- Describe what this app does, its data model, and any Supabase tables here. -->

Small static app served at /apps/{{SLUG}}/ on GitHub Pages.

## Rules

- Work ONLY inside `apps/{{SLUG}}/` (plus `@portfolio/shared`). Never read
  other apps' code or `portfolio/src`.
- Static hosting: no secrets, no server code. Hash routing only (`#/...`).
- The base path is derived from the folder name in `vite.config.ts` — don't
  hardcode absolute asset paths; import assets or reference them relatively.
- All colors/typography come from `@portfolio/shared/tokens.css` variables.
- Responsive for web AND mobile: the layout must work from ~360px phones up to
  desktop. Use fluid units / media queries and verify at both sizes — the
  viewport meta tag is already set in `index.html`.
- Backend is this app's own choice — Supabase, Firebase, another BaaS, or
  none. See the root `CLAUDE.md` → "Backend & database" for the full picture
  (free-tier tradeoffs, RLS example, how other apps do it).
- If using Supabase (scaffolded here via `--supabase`): `src/supabase-config.ts`
  holds the PUBLIC anon key (safe to commit) and `src/supabase-example.ts`
  shows a minimal query — replace the placeholder table once you've created
  one in the dashboard with RLS enabled.

## Card on the portfolio grid

Edit `app.meta.json` (title, description, tags, status, screenshot). The
screenshot file lives in `public/` — set `"screenshot": "screenshot.svg"` to
use the placeholder, or replace it with a real capture. Changes appear after
the next deploy.

## Commands

- `npm run dev` — from this folder; serves at `/apps/{{SLUG}}/`
- `npm run build` — output in `dist/`, assembled by the root build
- Root: `npm run build` + `npm run preview` to verify the assembled site
