# Gyeboorovsky.github.io

Portfolio of hobby apps, live at **https://gyeboorovsky.github.io/**.

Static site on GitHub Pages. It's a **catalog hub**: a vanilla-TS grid at the
root that renders one tile per app. Every app lives in its **own public repo**
(each deployed to its own GitHub Pages, linked from here) — the hub itself builds
no apps.

Each app is described by two things:
- **Content** — `APPS/io_<name>/` holds `app.json` (title, description, links,
  tags, status) and `grid-thumbnail.png` (the tile's cover image).
- **Presentation** — one entry in [`grid-config.json`](grid-config.json) with the
  design knobs: `size`, `accentHue`/`accentHue2`, `glow`, and array order.

## Quick start

```
npm install
npm run dev        # portfolio shell at http://localhost:5173
```

## Add an app

1. Drop the app's handoff folder into `APPS/` as `APPS/io_<name>/` (the app repo
   generates it — `app.json` + `grid-thumbnail.png`). See
   `../NEW-APP-CLAUDE.template.md` for how apps produce it.
2. Append one entry to `grid-config.json`:
   ```json
   { "name": "<name>", "size": "2x2", "accentHue": 330, "accentHue2": 275, "glow": 3 }
   ```
   - `name` → `APPS/io_<name>/`. `size` = `"<cols>x<rows>"`, each 1–3 (default
     `"1x1"`). `accentHue`(+`accentHue2`) is the gradient shown when there's no
     thumbnail. `glow` 0–3 highlights favourites. Array order = display order.
3. `npm run build && npm run preview` to verify, then push.

## Ship

```
npm run build && npm run preview       # verify the assembled site locally
git push                               # Actions builds + deploys (~2 min)
```
