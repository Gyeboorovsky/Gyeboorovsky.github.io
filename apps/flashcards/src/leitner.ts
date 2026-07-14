import type { Card, Deck, SwipeDir } from './types';

export const MAX_LEVEL = 4;

/** Days until a card becomes due again, per level. Level 0 is always due. */
export const LEVEL_INTERVALS_DAYS = [0, 1, 2, 4, 8] as const;

/** Today as 'YYYY-MM-DD' from LOCAL date parts (toISOString would skew across UTC). */
export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Whole days from date `a` to date `b` (both 'YYYY-MM-DD'); DST-safe via Date.UTC. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export function isDue(card: Card, today = todayISO()): boolean {
  if (card.lastReviewed === null || card.level <= 0) return true;
  const interval = LEVEL_INTERVALS_DAYS[Math.min(card.level, MAX_LEVEL)];
  return daysBetween(card.lastReviewed, today) >= interval;
}

export function applySwipe(card: Card, dir: SwipeDir, today = todayISO()): Card {
  return {
    ...card,
    level: dir === 'know' ? Math.min(card.level + 1, MAX_LEVEL) : 0,
    lastReviewed: today,
  };
}

/** Cards due today, lowest level first, then least-recently reviewed first. */
export function dueCards(deck: Deck, today = todayISO()): Card[] {
  return deck.cards
    .filter((c) => isDue(c, today))
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return (a.lastReviewed ?? '') < (b.lastReviewed ?? '') ? -1 : 1;
    });
}

/** Earliest upcoming due date in the deck, or null (empty deck / something already due). */
export function nextDueDate(deck: Deck, today = todayISO()): string | null {
  let next: string | null = null;
  for (const c of deck.cards) {
    if (isDue(c, today) || c.lastReviewed === null) return null;
    const interval = LEVEL_INTERVALS_DAYS[Math.min(c.level, MAX_LEVEL)];
    const [y, m, d] = c.lastReviewed.split('-').map(Number);
    const due = new Date(Date.UTC(y, m - 1, d) + interval * 86_400_000);
    const iso = due.toISOString().slice(0, 10);
    if (next === null || iso < next) next = iso;
  }
  return next;
}

/** Cards considered "learned" for progress bars: reached at least level 1. */
export function learnedCount(deck: Deck): number {
  return deck.cards.filter((c) => c.level >= 1).length;
}
