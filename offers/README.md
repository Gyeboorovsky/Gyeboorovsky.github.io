# offers/

Password-gated client previews. Copied verbatim into `dist/offers/` by
`scripts/build-all.mjs` and served at `/offers/<hash>/`.

## How the gate works

The password is never stored and never compared. It **derives** the folder
name:

```
folder = sha256("<slug>:<password>").hex.slice(0, 32)
```

The site ships no secret, and the path cannot be guessed or listed. A visitor
types the password into the offer's plate on the home page; the browser
computes the same hash and opens that address.

**This is a capability URL, not access control.** GitHub Pages is public, so
anyone who is handed the resulting link — or is forwarded it — keeps access for
as long as the folder exists. Use it for drafts a client should look at and
approve. Never put confidential data here.

## Adding an offer

1. Pick a slug and a password, and get the folder:
   ```
   node scripts/offer-path.mjs acme-rebrand "correct-horse"
   ```
   Jot the slug/password into `../offer-passwords.txt` (plain text, on
   purpose — see that file's header) so you don't lose track of it. That file
   is gitignored: this repo is public, and a committed password publishes the
   address of the draft it unlocks.
2. Create that folder under `offers/` and put the preview's `index.html` (plus
   any assets, referenced relatively) inside it.
3. Add the content bundle `ACTIVE/io_acme-rebrand/` (or drop it inside the
   preview's own repo folder under `ACTIVE/`) with an `app.json` carrying
   `"tags": ["offer"]` and no `demoUrl`/`repoUrl`, plus
   `assets/grid-thumbnail.png` — the cover is public, only the page behind it
   is not.
4. Optionally add a `grid-config.json` entry to override its size/paint/order.
5. `npm run build && npm run preview`, check the plate unlocks, then push.

To revoke access, delete the folder (or rename it by changing the password).
