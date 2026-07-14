import type { AppData, Card, Deck, Settings, StatsLog } from './types';

export const DATA_KEY = 'flashcards:v1';
export const SETTINGS_KEY = 'flashcards:settings:v1';
export const STATS_KEY = 'flashcards:stats:v1';

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' };

function loadRaw(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown): SaveResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    const quota = err instanceof DOMException && err.name === 'QuotaExceededError';
    return { ok: false, reason: quota ? 'quota' : 'unavailable' };
  }
}

/** True only when the data key has never been written — gates first-run seeding. */
export function hasStoredData(): boolean {
  try {
    return localStorage.getItem(DATA_KEY) !== null;
  } catch {
    return false;
  }
}

function isCard(c: unknown): c is Card {
  if (typeof c !== 'object' || c === null) return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.front === 'string' &&
    typeof o.back === 'string' &&
    typeof o.level === 'number' &&
    (o.lastReviewed === null || typeof o.lastReviewed === 'string')
  );
}

function isDeck(d: unknown): d is Deck {
  if (typeof d !== 'object' || d === null) return false;
  const o = d as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.name === 'string' && Array.isArray(o.cards) && o.cards.every(isCard);
}

export function loadData(): AppData | null {
  const parsed = loadRaw(DATA_KEY);
  if (typeof parsed !== 'object' || parsed === null) return null;
  const o = parsed as Record<string, unknown>;
  if (o.version !== 1 || !Array.isArray(o.decks) || !o.decks.every(isDeck)) return null;
  return parsed as AppData;
}

export function loadSettings(): Settings | null {
  const parsed = loadRaw(SETTINGS_KEY);
  if (typeof parsed !== 'object' || parsed === null) return null;
  const o = parsed as Record<string, unknown>;
  if (o.version !== 1 || typeof o.language !== 'string') return null;
  return parsed as Settings;
}

export function loadStats(): StatsLog | null {
  const parsed = loadRaw(STATS_KEY);
  if (typeof parsed !== 'object' || parsed === null) return null;
  const o = parsed as Record<string, unknown>;
  if (o.version !== 1 || typeof o.days !== 'object' || o.days === null) return null;
  return parsed as StatsLog;
}

/* ---------- file download / upload ---------- */

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, '_').replace(/^_+|_+$/g, '') || 'deck';
}

/* ---------- deck JSON export / import ---------- */

interface DeckExport {
  format: 'flashcards-deck';
  version: 1;
  deck: Deck;
}

export function exportDeckJSON(deck: Deck): void {
  const payload: DeckExport = { format: 'flashcards-deck', version: 1, deck };
  downloadFile(`${safeFilename(deck.name)}.deck.json`, JSON.stringify(payload, null, 2), 'application/json');
}

/** Parses an exported deck file into a fresh Deck (new ids). Throws Error with a message on bad input. */
export function parseDeckJSON(text: string): Deck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('not valid JSON');
  }
  const o = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Record<string, unknown>;
  const deck = o.format === 'flashcards-deck' ? o.deck : parsed; // also accept a bare Deck object
  if (!isDeck(deck)) throw new Error('not a flashcards deck file');
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: deck.name,
    createdAt: now,
    cards: deck.cards.map((c) => ({
      id: crypto.randomUUID(),
      front: c.front,
      back: c.back,
      level: typeof c.level === 'number' ? Math.max(0, Math.min(4, Math.floor(c.level))) : 0,
      lastReviewed: c.lastReviewed ?? null,
      createdAt: now,
    })),
  };
}

/* ---------- words CSV export / import ---------- */

function csvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function exportWordsCSV(deckName: string, cards: Card[]): void {
  const lines = cards.map((c) => `${csvField(c.front)},${csvField(c.back)}`);
  downloadFile(`${safeFilename(deckName)}.words.csv`, lines.join('\r\n') + '\r\n', 'text/csv');
}

/**
 * Parses "front,back" CSV (quoted fields may contain commas/newlines/"" escapes).
 * Rows with fewer than 2 non-empty fields are skipped. Extra columns are ignored.
 */
export function parseWordsCSV(text: string): { front: string; back: string }[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  rows.push(row);

  const pairs: { front: string; back: string }[] = [];
  for (const r of rows) {
    const front = (r[0] ?? '').trim();
    const back = (r[1] ?? '').trim();
    if (front && back) pairs.push({ front, back });
  }
  return pairs;
}

/** Opens a file picker and resolves with the chosen file's text (null if cancelled). */
export function pickFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      file.text().then(resolve, () => resolve(null));
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
