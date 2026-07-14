# Demo (apps/demo)

<!-- Describe what this app does, its data model, and any Supabase tables here. -->

Small static app served at /apps/demo/ on GitHub Pages.

## Rules

- Work ONLY inside `apps/demo/` (plus `@portfolio/shared`). Never read
  other apps' code or `portfolio/src`.
- Static hosting: no secrets, no server code. Hash routing only (`#/...`).
- The base path is derived from the folder name in `vite.config.ts` — don't
  hardcode absolute asset paths; import assets or reference them relatively.
- All colors/typography come from `@portfolio/shared/tokens.css` variables.
- Supabase (if needed): `createAppClient` from `@portfolio/shared/supabase` +
  a committed `src/supabase-config.ts` with the PUBLIC anon key; RLS on every
  table.

## Card on the portfolio grid

Edit `app.meta.json` (title, description, tags, status, screenshot). The
screenshot file lives in `public/` — set `"screenshot": "screenshot.svg"` to
use the placeholder, or replace it with a real capture. Changes appear after
the next deploy.

## Commands

- `npm run dev` — from this folder; serves at `/apps/demo/`
- `npm run build` — output in `dist/`, assembled by the root build
- Root: `npm run build` + `npm run preview` to verify the assembled site
