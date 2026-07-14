# Gyeboorovsky.github.io

Portfolio of hobby apps, live at **https://gyeboorovsky.github.io/**.

Static site on GitHub Pages: a vanilla-TS portfolio grid at the root, each app
an independent Vite + TypeScript project under `apps/<slug>/`, optional light
backend on Supabase (free tier, public anon key + RLS).

## Quick start

```
npm install
npm run dev        # portfolio shell at http://localhost:5173
```

## Add an app

```
node scripts/new-app.mjs my-app        # add --react for a React app
npm install
cd apps/my-app
npm run dev
```

Fill in `apps/my-app/app.meta.json` — that's all the grid needs.
Apps hosted in other repos: add an entry to `external-apps.json`.

## Ship

```
npm run build && npm run preview       # verify the assembled site locally
git push                               # Actions builds + deploys (~2 min)
```

See [CLAUDE.md](CLAUDE.md) for conventions, constraints, and the full command
reference.
