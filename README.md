# Gyeboorovsky.github.io

Portfolio of hobby apps, live at **https://gyeboorovsky.github.io/**.

Static site on GitHub Pages. It's a **catalog hub**: a vanilla-TS grid at the
root that renders one tile per app, in English and Polish. Every app lives in
its **own repo** (each deployed on its own, linked from here) — the hub itself
builds no apps.

## Add an app — drop the folder in `ACTIVE/`

`ACTIVE/` is gitignored: it's where you drop an app's folder to publish it,
nothing there is tracked by this repo.

1. Put the whole app repo (or just its `io_<name>/` handoff bundle — see
   `../NEW-APP-CLAUDE.template.md`) anywhere under `ACTIVE/`, e.g.
   `ACTIVE/my-app/io_my-app/`. It needs `app.json` (title, description, links,
   tags, status) and `assets/grid-thumbnail.png` (the tile's cover, ~1200×900).
2. `npm run build` — scans `ACTIVE/` for every `io_<name>/` bundle and
   (re)generates `portfolio/src/generated/manifest.json` +
   `portfolio/public/external/<name>.png`. Both **are committed** (`ACTIVE/`
   isn't — CI never sees it, only what this step produced).
3. Optional: add an entry to [`grid-config.json`](grid-config.json) to set
   tile `size` (`"<cols>x<rows>"`, each 1–3), `paint` (`red`/`teal`/`amber`) or
   display order. No entry = `1x1`, paint from the app's first tag, appended
   at the end — the app still shows up.
4. Optional: add Polish copy for the tile (title/description/stat) under
   `apps.<name>` in [`i18n/pl.json`](i18n/pl.json). No entry = the English
   `app.json` text shows in both languages. Never translate proper names
   (the app's own title, unless it's genuinely a description like "Massage &
   Physiotherapy").
5. `npm run build && npm run preview` to verify, then commit + push.

## Remove or shelve an app

Delete its folder from `ACTIVE/` (and its `grid-config.json`/`i18n/pl.json`
entries, if any) and rebuild. To keep the code without publishing it, move the
folder to `../DETACHED/` instead of deleting it.

## Quick start

```
npm install
npm run dev        # portfolio shell at http://localhost:5173, regenerates the manifest first
npm run build && npm run preview   # build + serve the assembled dist/ at :4173
```

## Ship

```
npm run build && npm run preview       # verify the assembled site locally
git push                               # Actions builds + deploys (~2 min)
```

See `CLAUDE.md` for the full pipeline (manifest schema, offers, i18n
internals) and `offers/README.md` for password-gated client previews.
