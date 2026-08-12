# static-sites/

Pre-built static sites that get copied verbatim into `dist/site/<name>/` by
`scripts/build-all.mjs`, served only at that path — not part of the portfolio
catalog (no tile, no manifest entry, no backend).

## fizjo

Static export of the `masaz-fizjoterapia` Next.js project
(`next build` with `output: "export"`, `basePath`/`assetPrefix: "/site/fizjo"`).
Served at `/site/fizjo`. To update: rebuild the source project and overwrite
this folder's contents with its `out/` output.
