---
name: Gyeboorovsky Portfolio Catalog
description: One car under printed vinyl — painted body panels split by seams, every graphic sheared to the same angle.
colors:
  body: "#ece8e0"
  body-2: "#dcd7cc"
  seam: "#12151a"
  ink: "#12151a"
  ink-2: "#5a5f68"
  on-seam: "#ece8e0"
  lacquer: "rgba(255, 255, 255, 0.42)"
  gloss: "rgba(255, 255, 255, 0.9)"
  paint-red: "#d81b3f"
  paint-teal: "#00897a"
  paint-amber: "#d99000"
  on-red: "#ffffff"
  on-teal: "#ffffff"
  on-amber: "#241a00"
  red-text: "#b8102f"
  teal-text: "#006b5f"
  amber-text: "#8a5c00"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(38px, 6.6vw, 92px)"
    fontWeight: 900
    lineHeight: 0.84
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 48px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "0.01em"
  title:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(19px, 2vw, 26px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "0.01em"
  body:
    fontFamily: "Saira, system-ui, sans-serif"
    fontSize: "clamp(11px, 1.1vw, 12px)"
    fontWeight: 600
    lineHeight: "normal"
  label:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    letterSpacing: "0.12em"
  sponsor:
    fontFamily: "Saira, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  none: "0"
  roundel: "50%"
spacing:
  seam: "5px"
  gutter: "clamp(12px, 2vw, 22px)"
  caption: "10px 15px 12px"
  caption-lead: "15px 22px 19px"
  hoodplate: "18px clamp(16px, 2.4vw, 30px)"
components:
  panel:
    backgroundColor: "{colors.body}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  panel-caption:
    backgroundColor: "{colors.body-2}"
    textColor: "{colors.ink}"
    padding: "{spacing.caption}"
    typography: "{typography.title}"
  panel-caption-lead:
    backgroundColor: "{colors.body-2}"
    textColor: "{colors.ink}"
    padding: "{spacing.caption-lead}"
    typography: "{typography.headline}"
  decal:
    backgroundColor: "{colors.paint-red}"
    textColor: "{colors.on-red}"
    padding: "5px 13px 3px"
    typography: "{typography.label}"
  status-tab:
    backgroundColor: "{colors.seam}"
    textColor: "{colors.on-seam}"
    padding: "5px 13px 3px"
    typography: "{typography.label}"
  sponsor-strip:
    backgroundColor: "{colors.body-2}"
    textColor: "{colors.ink}"
    padding: "12px 4px 9px"
    typography: "{typography.label}"
  sponsor-strip-on:
    backgroundColor: "{colors.paint-red}"
    textColor: "{colors.on-red}"
    padding: "12px 4px 9px"
  theme-toggle:
    backgroundColor: "{colors.seam}"
    textColor: "{colors.on-seam}"
    padding: "8px 14px 6px"
  gate-submit:
    backgroundColor: "{colors.paint-red}"
    textColor: "{colors.on-red}"
    padding: "7px 16px 5px"
    typography: "{typography.label}"
  gate-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "4px 0 5px"
---

# Design System: Gyeboorovsky Portfolio Catalog

## Overview

**Creative North Star: "The Itasha Wrap"**

The catalog is not a page of cards on a background. It is one car, and the screen
is its bodywork: rigid painted panels butted against each other, split only by a
5px seam that shows the dark structure underneath. Nothing floats, nothing has a
soft edge, nothing casts a shadow, because sheet metal does none of those things.
Where a conventional grid would leave empty page between tiles, this one leaves a
panel joint — the gap is a material, not an absence.

Over that bodywork sits printed vinyl in exactly three colours: red, teal, amber.
They are the only chromatic voices in the system. Every graphic printed on the
car — wordmark, race number, panel title, decal, stat line, filter strip — is
sheared by the same −9° lean, so the whole surface reads as one wrap applied by
one printer in one pass. A clear coat lies over each panel as a fixed raking
highlight, and on hover a narrow gloss band travels across it and off the far
edge, damped and heavy, the way light moves over a lacquered body as you walk
past it.

The car exists in two printings of the same livery. Pearl is a warm off-white
body with dark ink; midnight is the same car painted dark, with the three vinyl
colours pushed to their high-key versions so they still burn against black paint.
Both printings are complete token sets — this is one design in two finishes, not
a light theme with a dark patch over it. Confirmed rejection: the floating,
rounded, drop-shadowed card grid that this category ships by default.

**Key Characteristics:**
- Zero border-radius and zero shadows anywhere; the sole curve is the number roundel, which is a real circle.
- Separation is always a 5px seam of dark structure, never empty page and never elevation.
- Three vinyl paints only, each carrying a field colour, an on-field text colour, and a small-type-on-bodywork colour.
- One shear angle (−9°) applied to every graphic on the car.
- Captions are their own strip of bodywork below the artwork, never overlaid on it.
- Two full printings (pearl, midnight), each defined as a complete token set.

## Colors

Three printed vinyl colours over a two-value painted body, with the dark
structure beneath the shell doing all the separation work.

### Primary
- **Vinyl Red** (`{colors.paint-red}`): the house colour. It prints the wordmark, the focus ring, the sealed-preview stamp, the active password rule, the error line, and the underline on the colophon link. Any single accent decision with no other reason defaults here.

### Secondary
- **Vinyl Teal** (`{colors.paint-teal}`): the second printing colour, default paint for anything tagged `game`. Panels routed to teal carry it on their decal, their stat line, and their filter strip.

### Tertiary
- **Vinyl Amber** (`{colors.paint-amber}`): the third printing colour, default paint for anything tagged `website`. Its on-field lettering is the one dark-on-paint pairing in the set (`{colors.on-amber}`), because white on amber does not hold.

### Neutral
- **Pearl Body** (`{colors.body}`): the panel's paint. Every panel is a soft 168° gradient from `{colors.body-2}` through this at 42% and back, so a large panel reads as a curved surface rather than a flat fill.
- **Shaded Body** (`{colors.body-2}`): the panel's shaded flank — also the flat fill for caption strips and resting filter strips, which is what makes a caption read as its own piece of bodywork.
- **Structure** (`{colors.seam}`): the dark chassis under the shell. It is the page background, the fill of every seam, the border of the roundel, the fill of the status tab and the theme toggle, and the stroke around the race number. It is never a text colour on bodywork.
- **Ink** (`{colors.ink}`) / **Ink Soft** (`{colors.ink-2}`): panel lettering and its quieter register (straplines, descriptions, colophon, field labels).
- **On Structure** (`{colors.on-seam}`): lettering on anything filled with the seam colour. It is light in both printings by definition, which is what keeps the theme toggle legible in either direction.
- **Lacquer** (`{colors.lacquer}`) / **Gloss** (`{colors.gloss}`): the clear coat. Lacquer is the fixed raking highlight on every panel; gloss is the travelling band on hover.

### Named Rules

**The Three Paints Rule.** There are exactly three vinyl colours, and every one
of them carries all three forms: `--paint-*` colours a field, `--on-*` letters on
top of that field, `--*-text` sets that paint as small type against bare
bodywork. A new accent is not a new colour — it is one of the three, in one of
the three forms. Adding a fourth paint is a different car.

**The Seam Rule.** Separation is `{spacing.seam}` of `{colors.seam}` showing
through. Not a border, not a margin of page, not a shadow. If two things need to
be apart, a seam runs between them.

**The Two Printings Rule.** Pearl and midnight are defined twice on purpose:
once under `prefers-color-scheme: dark` guarded by `:root:not([data-theme='light'])`,
and again under `:root[data-theme='dark']` so a manual toggle wins in both
directions. Both blocks must always carry an identical token set — a token added
to one and not the other ships a pearl value on a midnight car.

## Typography

**Display Font:** Big Shoulders Display (with Arial Narrow, sans-serif)
**Body Font:** Saira (with system-ui, sans-serif)

**Character:** A tall, tightly-set condensed grotesque against a squared
technical sans — race numbers and sponsor decals, not editorial. Display carries
every piece of lettering that is *printed on the car*; Saira carries the two
things a person actually reads at length: the description and the sponsor stat.

### Hierarchy
- **Wordmark / Display** (900, `clamp(38px, 6.6vw, 92px)`, line-height 0.84, uppercase): the hood wordmark only. Printed in vinyl red and cut by real panel seams.
- **Roundel** (900, `clamp(46px, 5.4vw, 78px)`, line-height 1): the app count, alone inside the circle on bare paint. One instance per page.
- **Race Number** (900, `clamp(40px, 4.4vw, 62px)`, 3px seam-coloured stroke over body-coloured fill; `clamp(64px, 7.6vw, 108px)` with a 4px stroke on a lead panel): the panel's position on the deck, top-right over the artwork.
- **Headline / Lead Title** (800, `clamp(28px, 3.6vw, 48px)`, line-height 0.92, uppercase): the title on a panel covering four cells or more.
- **Title** (800, `clamp(19px, 2vw, 26px)`, line-height 0.92, uppercase): every other panel title.
- **Label / Decal** (800, 13–14px, 0.12em, uppercase): the category decal, the status tab, the sealed stamp, the gate button. Filter strips are the same voice at `clamp(14px, 1.5vw, 19px)` / 0.1em.
- **Body** (600, `clamp(11px, 1.1vw, 12px)`; `clamp(12.5px, 1.3vw, 14px)` and max 54ch on a lead panel): the app description, in ink-soft.
- **Sponsor line** (700, 10.5px, 0.14em, uppercase, in the panel's `--*-text` paint; `clamp(11px, 1.2vw, 13px)` on a lead panel): the one true fact per project. Same voice at 0.2em serves the strapline and colophon, and at 9.5px the gate field label.

### Named Rules

**The Everything Leans Rule.** Every graphic on the car is sheared by
`skewX(-9deg)` — wordmark, strapline, roundel figure, race number, panel title,
description, stat, decal text, strip text. This is the world's single most
identifying rule. Panels themselves stay square; their contents lean. An
unsheared graphic on bodywork reads as a sticker someone else applied.

**The Sponsor Line Rule.** Descriptions are line-clamped — two lines, three on a
lead panel. A long description can never grow the caption strip enough to squeeze
a panel's paint. If it does not fit in the clamp, the copy is wrong, not the panel.

## Layout

The page is a vertical stack at `{spacing.seam}` of body padding and `{spacing.seam}`
between regions: hood, sponsor sill, deck, colophon. Every gap in the stack is a
seam.

**The hood** is one panel with a fixed-width roundel bay (`clamp(130px, 16vw, 245px)`)
and a flexible hoodplate carrying the wordmark and strapline. Two absolutely
positioned seam cuts fall at 33.333% and 66.667% — the deck's own column
positions — so the wordmark breaks across joints that line up with the panels
below it, and the last third of the hood stays bare paint. The theme toggle sits
on bare structure in the top-right corner.

**The sill** is a single row of equal-width sponsor strips (`grid-auto-flow: column`,
`1fr` columns), one per tag plus "Everything".

**The deck** is a 3-column grid with `minmax(180px, 1fr)` rows and
`grid-auto-flow: dense`, so smaller panels backfill the holes a 2x2 or 3x1 leaves.
Panel size is the curator's `"<cols>x<rows>"` (1–3 each); area ≥ 4 promotes the
panel to lead typography.

**Breakpoints.** At ≤1023px the deck drops to 2 columns, `w3` panels span 2, and
the hood keeps one cut recentred at 50% with the second removed. At ≤719px the
hood stacks vertically, both cuts are removed, the sill wraps to a 2-column grid
so every category stays reachable in the first viewport, rows relax to
`minmax(150px, 1fr)`, `h3` panels collapse to 2 rows, and captions tighten.

**The Gap Is The Only Rhythm Rule.** `{spacing.seam}` is the only spacing value
that shows between elements. Internal padding is per-component and specified
there; there is no general spacing scale, and none should be invented.

## Elevation & Depth

**There are no shadows in this system.** Not on panels, not on hover, not on the
toggle, not on the gate. Depth is entirely material: a panel's own 168° gradient
gives it curvature, the fixed lacquer highlight (`linear-gradient(163deg, lacquer 0 18%, transparent 46%)`)
puts a light source on it, and the seam beneath the shell reads as the thickness
of the panel above it. Layering is done with `z-index` on a single plane —
artwork at 1, hood graphics at 2, decals and cuts at 3, the travelling gloss at 4,
the theme toggle at 5 — not with elevation.

### Named Rules

**The No-Shadow Rule.** A `box-shadow` anywhere in this world is a defect. If an
element needs to separate from what is behind it, give it a seam or a different
paint value.

**The Travelling Gloss Rule.** Hover is the only motion in the system: a 26%-wide
gloss band, skewed −12°, moves from `left: -40%` to `left: 130%` over 0.62s on
`cubic-bezier(0.16, 1, 0.3, 1)` — damped, with mass, never bouncing. It is
removed under `prefers-reduced-motion: reduce`. Nothing lifts, scales, or glows
on hover; the light moves instead of the object.

## Shapes

Radius is zero everywhere. The single exception is the number roundel, which is a
true circle (`border-radius: 50%`) with a 5px seam-coloured border — it is a real
roundel on bare paint, not a rounded box. Borders are used only where a physical
edge exists: the roundel's ring, the 3px rule under the password field, and the
3px stamp outline on a sealed preview. Panels have no borders at all; the seam
between them does that work.

The recurring geometry is the parallelogram: everything printed leans −9°, so
edges of lettering and the travelling gloss band all rake the same way. The
sealed stamp is the one rotated element (`rotate(-6deg)`) — a stamp is applied by
hand, so it is the only thing on the car that is not parallel to the print.

## Components

### Panel

The single primitive; everything else is a panel or sits on one. Square corners,
`overflow: hidden`, a 168° body gradient, a fixed lacquer highlight over the whole
face, and a gloss band that travels across it on hover or focus. The hood, every
filter strip, every app tile, and the colophon are all panels.

### Car Panel (signature component)

An app tile. Anatomy, top to bottom: **artwork** filling the flexible top area
(`background-size: cover`, `min-height: 104px` so the paint never collapses; a
teal→amber gradient stands in when a project has no cover), carrying the
**category decal** flush in the top-left corner, an optional **status tab** in
seam colour flush top-right, the **race number** stroked out of the paint below
it, and — on a sealed preview — the stamp bottom-right. Beneath the artwork sits
the **caption strip**: its own piece of shaded bodywork carrying the title, the
sponsor stat in the panel's `--*-text` paint, and the clamped description.
Retired projects render at 0.6 opacity. Paint is routed by a single `data-paint`
attribute on the panel, which rebinds the panel's field, on-field, and text
colours in one step.

**The Caption Is Bodywork Rule.** The title never sits over the artwork. It sits
below it on its own strip, so no title can collide with a cover at any length or
aspect ratio.

### Sponsor Strip (navigation)

The filter row. At rest a strip is shaded bodywork at 0.68 opacity and
`saturate(0.25)` — visibly a decal that has not been lit. Selected, it fills with
its tag's paint, takes the matching on-paint lettering, returns to full
saturation, and rises 2px, over 0.2s. Selection state is carried on the element,
not implied by colour alone.

### Gate (sealed preview)

A car panel variant. The caption strip gains a second bodywork strip: a ruled
password field (transparent, no box, a 3px ink underline that turns vinyl red on
focus, 0.18em tracking) beside a paint-filled **Open** button. Errors print as a
10px uppercase red line under the row. The disabled/submitting button drops to
0.55 opacity with a `progress` cursor.

### Theme Toggle

Sits on bare structure in the hood's corner, filled with the seam colour and
lettered in on-seam. Because both tokens flip together, its lettering stays light
in both printings.

### Focus

A 3px vinyl-red outline inset by 3px (`outline-offset: -3px`), so it draws inside
the panel edge rather than breaking the seam line.

## Do's and Don'ts

### Do:
- **Do** put every visual value in `shared/tokens.css` and reference it as a custom property; that file is the only design-system swap point in the repo.
- **Do** shear every printed graphic by `var(--lean)` (−9°), and leave the panel itself square.
- **Do** separate anything from anything with `var(--gap)` (5px) of `var(--seam)`.
- **Do** add a token to both the `prefers-color-scheme` block and the `[data-theme='dark']` block, always as an identical pair.
- **Do** pick a paint's correct form: `--paint-*` for a field, `--on-*` for type on that field, `--*-text` for that paint as small type on bodywork.
- **Do** stack captions below artwork as their own strip of bodywork, and clamp the description so a long one can never squeeze the paint.
- **Do** letter anything filled with `--seam` in `--on-seam`, so it survives both printings.

### Don't:
- **Don't** use `box-shadow` anywhere, for any state.
- **Don't** use `border-radius` on anything but the roundel, which is a full circle.
- **Don't** introduce a fourth colour. The three vinyl paints plus the body/ink/seam neutrals are the whole palette.
- **Don't** lay lettering over a project's cover art.
- **Don't** separate panels with empty page or a margin; the space between panels is always filled with the seam.
- **Don't** add hover motion beyond the travelling gloss — no lift, no scale, no glow — and keep whatever motion exists behind `prefers-reduced-motion`.
- **Don't** replace the display face with a system stack; the condensed grotesque is the livery's voice, and Arial Narrow is a fallback, not an option.
