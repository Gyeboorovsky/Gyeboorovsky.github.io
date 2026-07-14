/** Leitner level 0–4; 0 = always due, 4 = longest interval. */
export interface Card {
  id: string;
  front: string;
  back: string;
  level: number;
  /** Local date 'YYYY-MM-DD' of the last review; null = never studied. */
  lastReviewed: string | null;
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  createdAt: string;
  cards: Card[];
}

export interface AppData {
  version: 1;
  decks: Deck[];
}

export type SwipeDir = 'know' | 'dontKnow';

export type Language = 'en' | 'pl';

export type WidgetId =
  | 'levelsGained'
  | 'reviews'
  | 'accuracy'
  | 'levelDistribution'
  | 'perDeck'
  | 'activity';

export interface Settings {
  version: 1;
  language: Language;
  /** Max cards per study session; 0 = no limit. */
  cardsPerSession: number;
  dashboardMode: 'basic' | 'detail';
  dashboardWidgets: Record<WidgetId, boolean>;
}

export interface DeckDayStats {
  reviews: number;
  known: number;
  unknown: number;
}

export interface DayStats {
  reviews: number;
  known: number;
  unknown: number;
  /** Sum of positive level deltas (a capped 'know' swipe adds 0). */
  levelsGained: number;
  /** Sum of levels dropped by 'don't know' swipes (level → 0). */
  levelsLost: number;
  byDeck: Record<string, DeckDayStats>;
}

export interface StatsLog {
  version: 1;
  /** Keyed by local date 'YYYY-MM-DD'. */
  days: Record<string, DayStats>;
}
