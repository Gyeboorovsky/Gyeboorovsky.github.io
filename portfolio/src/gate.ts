/**
 * Password-gated client offers.
 *
 * The password is never compared against anything — it derives the offer's
 * folder name, so the site ships no secret and the path cannot be guessed or
 * listed. `scripts/offer-path.mjs` produces the same hash for the author.
 *
 * This is a capability URL, not access control: the host is public, so anyone
 * handed the resulting link keeps access. Drafts for approval, not secrets.
 */

/** Must stay byte-identical to offerHash() in scripts/offer-path.mjs. */
export async function offerPath(slug: string, password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${slug}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `/offers/${hex.slice(0, 32)}/`;
}

/**
 * Resolve a password to an offer URL, or null when no offer sits at that path.
 * A HEAD request keeps a wrong password from navigating into a 404.
 */
export async function unlockOffer(slug: string, password: string): Promise<string | null> {
  const path = await offerPath(slug, password);
  try {
    const res = await fetch(path, { method: 'HEAD' });
    return res.ok ? path : null;
  } catch {
    return null;
  }
}
