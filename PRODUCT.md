# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary visitors are friends, family, and casual players who arrive from a link
the author sent them personally, plus passers-by who land on the site from
GitHub or a shared URL. They are not evaluating a candidate and are not
technical by default. Their job is simple: scan what is here, find something
that looks fun, and start playing it immediately in the browser. Jargon,
stack lists, and hiring-portfolio framing work against them.

## Product Purpose

Gyeboorovsky.github.io is a catalog hub for the author's hobby apps, games, and
websites. Each project lives in its own public repo and is deployed to its own
GitHub Pages URL; the hub itself builds nothing and hosts nothing but the
catalog — its entire job is to make the collection legible and to hand the
visitor off to a project in one click. Success is a visitor leaving the hub
*into* a project, not lingering on it.

## Positioning

Every project in the catalog is free, needs no account, and runs entirely in the
browser — most of them fully offline. There is nothing to install, nothing to
sign up for, and no cost. The hub's differentiator is immediacy: from link to
playing in one click.

## Operating Context

- Visitors arrive by a shared link (messenger, chat, GitHub profile), most often
  on a phone, sometimes on a desktop.
- The site is a static GitHub Pages user site. No backend, no secrets,
  everything public. Site ≤ 1 GB, ~100 GB/mo bandwidth, ~1–2 min deploys,
  ~10 min CDN cache after a deploy.
- Every tile links out to a separate deployment and opens in a new tab.
- Curation is manual and deliberate: the author decides display order,
  relative tile prominence, and per-project accent colour by hand.

## Capabilities and Constraints

- Content per project lives in an `io_<name>/` bundle dropped anywhere under
  `ACTIVE/` (`app.json` + optional `assets/grid-thumbnail.png`, ~1200×900, plus
  a one-line `stat` of fact taken from the project's own description).
  Presentation knobs are an optional override in `grid-config.json` (`size`
  `"<cols>x<rows>"` 1–3, `paint` `red`/`teal`/`amber`, `weight` 0–3, array
  order = display order); a project with no entry still ships at 1x1. Polish
  copy is an optional override in `i18n/pl.json`.
  `scripts/build-manifest.mjs` joins them into a generated manifest — never
  hand-edited, but committed, because `ACTIVE/` is gitignored and CI builds
  from the manifest alone.
- Categories in use: `app`, `game`, `website`, `offer`. `tool` and `mobile` are
  supported by the code but unused. `website` covers the standalone static site
  at `/site/fizjo` (a Next.js static export served by this repo, not an
  external repo). `offer` is a password-gated client preview: the cover and
  title are public, the page behind them lives at an address derived from a
  per-project password (`offers/README.md`). That is a capability URL, not
  access control — drafts for approval, never confidential data.
- Tag filtering is a confirmed, must-keep navigation mechanism.
- Both a dark and a light theme are required, honouring the visitor's OS
  preference with a manual override.
- Responsive from ~360 px up. TypeScript strict. All visual values must come
  from `shared/tokens.css` — no hardcoded colours anywhere else in the repo.

## Brand Commitments

- Name: **Gyeboorovsky**. Nothing else is pinned — the header badge
  ("Hobby projects"), subtitle, and the entire current visual treatment are
  explicitly open for replacement.
- Voice: plain and warm, no recruiter framing, no technical jargon.

## Evidence on Hand

- Live projects with real descriptions and real URLs: wiseperk, Crazy
  Flashcards, TypeBlitz, Typing RPG (see `ACTIVE/**/io_*/app.json`).
- Real, authored cover art for each: `io_<name>/assets/grid-thumbnail.png` —
  colourful, playful, in each project's own art style, varying aspect ratios.
- One standalone website carrying its own tile: the physiotherapy/massage site
  at `/site/fizjo`, built from `masaz-fizjoterapia`.
- Client previews under `offers/`, one sealed behind a password-derived
  address.
- There are no user counts, download numbers, reviews, testimonials, or press.
  None may be invented.

## Product Principles

1. **The projects are the product; the hub is a doorway.** Anything that keeps
   a visitor on the hub instead of moving them into a project is decoration.
2. **Written for someone who was sent the link, not someone assessing a CV.**
   No stack lists, no role labels, no case-study framing.
3. **Curation is expressed, not automated.** The author's per-project size,
   order, and accent choices must remain visible design decisions.
4. **One click to play.** Free, no account, runs in the browser — and the
   surface should make that obvious without saying it three times.
5. **Cheap to run, cheap to deploy.** Static output only, within the Pages
   budget; no service the author has to pay for or maintain.

## Accessibility & Inclusion

No formal standard was set by the user. The audience skews non-technical and
mobile, so: legible type at phone sizes, real focus states, tap targets that
work with a thumb, and full respect for `prefers-reduced-motion` and
`prefers-color-scheme`.
