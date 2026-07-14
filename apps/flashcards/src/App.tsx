import { useState } from 'react';
import type { AppData, Card, Deck, Settings, StatsLog, SwipeDir } from './types';
import { applySwipe, dueCards, todayISO } from './leitner';
import {
  DATA_KEY,
  SETTINGS_KEY,
  STATS_KEY,
  loadData,
  loadSettings,
  loadStats,
  parseDeckJSON,
  parseWordsCSV,
  pickFile,
} from './storage';
import { useAutosaved } from './usePersistence';
import { seedData } from './seed';
import { I18nProvider, useI18n } from './i18n';
import DeckList, { deckAccent } from './components/DeckList';
import DeckDetail from './components/DeckDetail';
import StudyView from './components/StudyView';
import SummaryView from './components/SummaryView';
import Dashboard from './components/Dashboard';
import OptionsDrawer from './components/OptionsDrawer';

const DEFAULT_SETTINGS: Settings = {
  version: 1,
  language: 'en',
  cardsPerSession: 20,
  dashboardMode: 'basic',
  dashboardWidgets: {
    levelsGained: true,
    reviews: true,
    accuracy: true,
    levelDistribution: true,
    perDeck: true,
    activity: true,
  },
};

/** Merge stored settings over defaults so new fields/widgets get sane values. */
function initSettings(): Settings {
  const loaded = loadSettings();
  if (!loaded) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...loaded,
    dashboardWidgets: { ...DEFAULT_SETTINGS.dashboardWidgets, ...loaded.dashboardWidgets },
  };
}

type View =
  | { name: 'decks' }
  | { name: 'dashboard' }
  | { name: 'deck'; deckId: string }
  | { name: 'study'; deckId: string; queue: string[]; mode: 'due' | 'all' }
  | { name: 'summary'; deckId: string; known: number; unknown: number; mode: 'due' | 'all' };

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [settings, updateSettings] = useAutosaved<Settings>(SETTINGS_KEY, initSettings);
  return (
    <I18nProvider language={settings.language}>
      <Shell
        settings={settings}
        onChangeSettings={(patch) => updateSettings((s) => ({ ...s, ...patch }))}
      />
    </I18nProvider>
  );
}

function Shell({
  settings,
  onChangeSettings,
}: {
  settings: Settings;
  onChangeSettings: (patch: Partial<Settings>) => void;
}) {
  const t = useI18n();
  const [data, updateData, saveStatus] = useAutosaved<AppData>(DATA_KEY, () => loadData() ?? seedData());
  const [stats, updateStats] = useAutosaved<StatsLog>(STATS_KEY, () => loadStats() ?? { version: 1, days: {} });
  const [view, setView] = useState<View>({ name: 'decks' });
  const [optionsOpen, setOptionsOpen] = useState(false);

  const findDeck = (deckId: string): Deck | undefined => data.decks.find((d) => d.id === deckId);
  const deckIndex = (deckId: string): number => data.decks.findIndex((d) => d.id === deckId);

  const updateDeck = (deckId: string, fn: (deck: Deck) => Deck) =>
    updateData((d) => ({ ...d, decks: d.decks.map((deck) => (deck.id === deckId ? fn(deck) : deck)) }));

  const createDeck = (name: string) => {
    const now = new Date().toISOString();
    updateData((d) => ({
      ...d,
      decks: [...d.decks, { id: crypto.randomUUID(), name, createdAt: now, cards: [] }],
    }));
  };

  const deleteDeck = (deckId: string) => {
    updateData((d) => ({ ...d, decks: d.decks.filter((deck) => deck.id !== deckId) }));
    setView({ name: 'decks' });
  };

  const addCard = (deckId: string, front: string, back: string) => {
    const card: Card = {
      id: crypto.randomUUID(),
      front,
      back,
      level: 0,
      lastReviewed: null,
      createdAt: new Date().toISOString(),
    };
    updateDeck(deckId, (deck) => ({ ...deck, cards: [...deck.cards, card] }));
  };

  const importDeck = async (): Promise<string | null> => {
    const text = await pickFile('.json,application/json');
    if (text === null) return null;
    try {
      const deck = parseDeckJSON(text);
      updateData((d) => ({ ...d, decks: [...d.decks, deck] }));
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'unknown error';
    }
  };

  const importWords = async (deckId: string): Promise<number | null> => {
    const text = await pickFile('.csv,text/csv,text/plain');
    if (text === null) return null;
    const pairs = parseWordsCSV(text);
    if (pairs.length > 0) {
      const now = new Date().toISOString();
      const cards: Card[] = pairs.map(({ front, back }) => ({
        id: crypto.randomUUID(),
        front,
        back,
        level: 0,
        lastReviewed: null,
        createdAt: now,
      }));
      updateDeck(deckId, (deck) => ({ ...deck, cards: [...deck.cards, ...cards] }));
    }
    return pairs.length;
  };

  const startStudy = (deckId: string, mode: 'due' | 'all') => {
    const deck = findDeck(deckId);
    if (!deck) return;
    const pool = mode === 'due' ? dueCards(deck) : shuffle(deck.cards);
    const limit = settings.cardsPerSession;
    const queue = (limit > 0 ? pool.slice(0, limit) : pool).map((c) => c.id);
    if (queue.length === 0) return;
    setView({ name: 'study', deckId, queue, mode });
  };

  const handleSwipe = (deckId: string, cardId: string, dir: SwipeDir) => {
    const card = findDeck(deckId)?.cards.find((c) => c.id === cardId);
    if (!card) return;
    const today = todayISO();
    const updated = applySwipe(card, dir, today);
    updateDeck(deckId, (deck) => ({
      ...deck,
      cards: deck.cards.map((c) => (c.id === cardId ? updated : c)),
    }));
    updateStats((s) => {
      const day = s.days[today] ?? { reviews: 0, known: 0, unknown: 0, levelsGained: 0, levelsLost: 0, byDeck: {} };
      const deckDay = day.byDeck[deckId] ?? { reviews: 0, known: 0, unknown: 0 };
      const know = dir === 'know';
      return {
        ...s,
        days: {
          ...s.days,
          [today]: {
            reviews: day.reviews + 1,
            known: day.known + (know ? 1 : 0),
            unknown: day.unknown + (know ? 0 : 1),
            levelsGained: day.levelsGained + Math.max(0, updated.level - card.level),
            levelsLost: day.levelsLost + Math.max(0, card.level - updated.level),
            byDeck: {
              ...day.byDeck,
              [deckId]: {
                reviews: deckDay.reviews + 1,
                known: deckDay.known + (know ? 1 : 0),
                unknown: deckDay.unknown + (know ? 0 : 1),
              },
            },
          },
        },
      };
    });
  };

  // Guard views whose deck may have been deleted.
  const activeDeck =
    view.name === 'deck' || view.name === 'study' || view.name === 'summary' ? findDeck(view.deckId) : undefined;
  const effectiveView: View =
    (view.name === 'deck' || view.name === 'study' || view.name === 'summary') && !activeDeck
      ? { name: 'decks' }
      : view;

  return (
    <div className="app">
      <div className="bg-blob bg-blob-pink" aria-hidden />
      <div className="bg-blob bg-blob-yellow" aria-hidden />

      <header className="app-head">
        <button className="wordmark tilt-l" onClick={() => setView({ name: 'decks' })}>
          {t.app.wordmark}
        </button>
        <nav className="app-nav">
          <button
            className={`nav-pill${effectiveView.name === 'decks' ? ' nav-active' : ''}`}
            onClick={() => setView({ name: 'decks' })}
          >
            🃏 {t.app.navDecks}
          </button>
          <button
            className={`nav-pill${effectiveView.name === 'dashboard' ? ' nav-active' : ''}`}
            onClick={() => setView({ name: 'dashboard' })}
          >
            📈 {t.app.navDashboard}
          </button>
          <button className="nav-pill" onClick={() => setOptionsOpen(true)} title={t.app.optionsButton}>
            ⚙️
          </button>
        </nav>
      </header>

      {!saveStatus.ok && (
        <p className="storage-banner">
          {saveStatus.reason === 'quota' ? t.app.storageQuota : t.app.storageUnavailable}
        </p>
      )}

      <main className="app-main">
        {effectiveView.name === 'decks' && (
          <DeckList
            decks={data.decks}
            onOpenDeck={(deckId) => setView({ name: 'deck', deckId })}
            onCreateDeck={createDeck}
            onImportDeck={importDeck}
          />
        )}

        {effectiveView.name === 'dashboard' && (
          <Dashboard data={data} stats={stats} settings={settings} onChangeSettings={onChangeSettings} />
        )}

        {effectiveView.name === 'deck' && activeDeck && (
          <DeckDetail
            deck={activeDeck}
            accent={deckAccent(deckIndex(activeDeck.id))}
            onBack={() => setView({ name: 'decks' })}
            onRename={(name) => updateDeck(activeDeck.id, (deck) => ({ ...deck, name }))}
            onDelete={() => deleteDeck(activeDeck.id)}
            onAddCard={(front, back) => addCard(activeDeck.id, front, back)}
            onEditCard={(cardId, front, back) =>
              updateDeck(activeDeck.id, (deck) => ({
                ...deck,
                cards: deck.cards.map((c) => (c.id === cardId ? { ...c, front, back } : c)),
              }))
            }
            onDeleteCard={(cardId) =>
              updateDeck(activeDeck.id, (deck) => ({
                ...deck,
                cards: deck.cards.filter((c) => c.id !== cardId),
              }))
            }
            onImportWords={() => importWords(activeDeck.id)}
            onStudy={(mode) => startStudy(activeDeck.id, mode)}
          />
        )}

        {effectiveView.name === 'study' && activeDeck && (
          <StudyView
            deck={activeDeck}
            queue={effectiveView.queue}
            onSwipe={(cardId, dir) => handleSwipe(activeDeck.id, cardId, dir)}
            onFinish={(known, unknown) =>
              setView({ name: 'summary', deckId: activeDeck.id, known, unknown, mode: effectiveView.mode })
            }
            onExit={() => setView({ name: 'deck', deckId: activeDeck.id })}
          />
        )}

        {effectiveView.name === 'summary' && activeDeck && (
          <SummaryView
            known={effectiveView.known}
            unknown={effectiveView.unknown}
            canStudyAgain={
              effectiveView.mode === 'due' ? dueCards(activeDeck).length > 0 : activeDeck.cards.length > 0
            }
            onStudyAgain={() => startStudy(activeDeck.id, effectiveView.mode)}
            onBack={() => setView({ name: 'deck', deckId: activeDeck.id })}
          />
        )}
      </main>

      <OptionsDrawer
        open={optionsOpen}
        settings={settings}
        onChange={onChangeSettings}
        onClose={() => setOptionsOpen(false)}
      />
    </div>
  );
}
