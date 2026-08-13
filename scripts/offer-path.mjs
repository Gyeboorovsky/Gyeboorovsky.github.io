#!/usr/bin/env node
// Prints the folder a password-gated client offer must live in.
//
//   node scripts/offer-path.mjs <slug> "<password>"
//
// The password is never stored anywhere — it *derives* the folder name, so the
// only way to reach an offer is to know its password. Nothing on the public
// site reveals the path, and the site ships no secret to compare against.
//
// This is a capability URL, not access control: GitHub Pages is public, so
// anyone who is given the resulting link (or is forwarded it) keeps access.
// Use it for drafts a client should approve, never for confidential data.
import { createHash } from 'node:crypto';

/** Must stay byte-identical to offerPath() in portfolio/src/gate.ts. */
export function offerHash(slug, password) {
  return createHash('sha256').update(`${slug}:${password}`).digest('hex').slice(0, 32);
}

const [slug, password] = process.argv.slice(2);
if (!slug || !password) {
  console.error('usage: node scripts/offer-path.mjs <slug> "<password>"');
  process.exit(1);
}

const hash = offerHash(slug, password);
console.log(`offers/${hash}/`);
console.log('');
console.log(`Put the offer's index.html (and its assets) in that folder.`);
console.log(`It ships to https://gyeboorovsky.github.io/offers/${hash}/`);
console.log(`The tile for "${slug}" unlocks it when the client types this password.`);
