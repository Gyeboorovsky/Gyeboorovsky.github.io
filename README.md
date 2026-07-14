# Gyeboorovsky.github.io

Portfolio of hobby apps, live at **https://gyeboorovsky.github.io/**.

Static site on GitHub Pages. It's a **hub**: a vanilla-TS grid at the root that
renders a tile per app. Most apps now live in their **own public repos** (each
deployed to its own GitHub Pages, linked from here); the hub can also still host
small in-repo apps under `apps/<slug>/`.

## Quick start

```
npm install
npm run dev        # portfolio shell at http://localhost:5173
```

## Add an app (in its own repo — the usual way)

Append one entry to [`external-apps.json`](external-apps.json) pointing at the
app's live URL and repo, then push. Each entry renders as a full grid tile.
Key fields: `demoUrl` (what the tile opens), `size` (`"<cols>x<rows>"`, each
1–3, default `"1x1"` — e.g. `"2x2"`, `"1x3"`), `accentHue`/`accentHue2` (cover
gradient), `screenshot`. See the file's `note` for the full list. A copyable
`CLAUDE.md` starter for new app repos lives at
`../NEW-APP-CLAUDE.template.md` (repo root's sibling).

## Add an in-repo app (optional)

```
node scripts/new-app.mjs my-app        # add --react for a React app
npm install
cd apps/my-app
npm run dev
```

Fill in `apps/my-app/app.meta.json` (same appearance fields as above).

## Ship

```
npm run build && npm run preview       # verify the assembled site locally
git push                               # Actions builds + deploys (~2 min)
```
