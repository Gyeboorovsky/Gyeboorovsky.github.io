# @portfolio/shared

The ONLY code shared across the portfolio shell and all apps. Keep it tiny —
every change here affects every app on the site.

- `tokens.css` — design tokens (the single design-system swap point)
- `base.css` — reset + base element styles built on the tokens
- `supabase.ts` — `createAppClient` helper (browser + PUBLIC anon key + RLS
  only). Optional: only apps that `import '@portfolio/shared/supabase'` pull
  in `supabase-js` at all. Apps using Firebase or another BaaS instead don't
  touch this file — their SDK is their own dependency, not shared's. See root
  `CLAUDE.md` → "Backend & database".

Rules:
- No app-specific logic here.
- No framework code — must work in vanilla-TS and React apps alike.
- Never hardcode a color anywhere else in the repo; add a token here instead.
