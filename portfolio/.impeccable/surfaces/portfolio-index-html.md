---
version: 1
slug: "portfolio-index-html"
primary_target: "portfolio/index.html"
related_targets: ["portfolio/src/render.ts","portfolio/src/styles.css"]
---

Scope: the site root — the catalog sheet listing every project. Visitor mode: Experience.

Audience: friends, family and casual players who were sent the link personally, mostly on a phone. Non-technical. No jargon, no CV framing.

Job: scan what is here, find something that looks fun, open it in one click. Success is the visitor leaving the hub *into* a project.

Proof/content: five live browser games and apps plus one website, each with real authored cover art (`APPS/io_<name>/grid-thumbnail.png`) and one true `stat` line taken from its own description. No user counts, reviews or press exist — none may be invented.

Constraints: static GitHub Pages, everything public, no backend. Tag filtering is a confirmed must-keep. Both a board (light) and a night (dark) printing, honouring the OS with a manual override. Responsive from ~360px. All colour comes from `shared/tokens.css`.

Chosen direction: the 1900 W.E.B. Du Bois data portraits — a dealt challenger that won both axes in the bolder re-roll, seed `da13c077`, chosen over the assigned "painted playground court". Aged board, three inks, a ruled ledger, zero radius and zero elevation.

Memorable moment: the curator's emphasis knob printed as the *length* of each plate's ink bar — the plainest figure in the source world, and the one thing on the page that is data rather than decoration.

Deliberate divergence from the direction card: the sketch put an abstract inked data figure in each plate. The user required real project thumbnails there instead, so the figure is the cover and the inked datum survives as the bar plus the tracked `stat` line.

Offers: a plate variant for password-gated client previews. The password derives the address (`/offers/<sha256("slug:password")[0..32]>/`) rather than being compared, so no secret ships. It is a capability URL, not access control — documented in `offers/README.md` and disclosed to the user.

Unresolved: (1) copy language — all plate content is currently English from `app.json`, but the audience is Polish; switching is a content decision the user has not made. (2) the `offer-demo` plate and its `offers/d664.../` folder are a shipped example, to be deleted once real offers exist. (3) whether the offer gate should be upgraded to AES-encrypted payloads if the previews ever hold anything sensitive.
