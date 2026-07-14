import { useEffect, useState } from 'react';
import type { AppData, Card, Deck, SessionsLog, Settings, StatsLog, SwipeDir } from './types';
import { applySwipe, dueCards, todayISO } from './leitner';
import {
  DATA_KEY,
  SESSIONS_KEY,
  SETTINGS_KEY,
  STATS_KEY,
  loadData,
  loadSessions,
  loadSettings,
  loadStats,
  parseDeckJSON,
  parseWordsCSV,
  pickFile,
} from './storage';
import { useAutosaved } from './usePersistence';
import { seedData } from './seed';
import {
  type FolderStatus,
  isFolderSupported,
  loadStoredHandle,
  pickDataFolder,
  verifyPermission,
  writeBackup,
} from './localFolder';
import { I18nProvider, useI18n } from './i18n';
import DeckList, { deckAccent } from './components/DeckList';
import DeckDetail from './components/DeckDetail';
import StudyView from './components/StudyView';
import SummaryView from './components/SummaryView';
import Dashboard from './components/Dashboard';
import OptionsDrawer from './components/OptionsDrawer';
import LanguageMenu from './components/LanguageMenu';
import OverviewPanel from './components/OverviewPanel';

const MAX_STORED_SESSIONS = 50;

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
  | { name: 'study'; deckId: string; queue: string[]; mode: 'due' | 'all'; sessionId: string }
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
  const [sessions, updateSessions] = useAutosaved<SessionsLog>(
    SESSIONS_KEY,
    () => loadSessions() ?? { version: 1, sessions: [] },
  );
  const [view, setView] = useState<View>({ name: 'decks' });
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [folder, setFolder] = useState<FolderStatus>(() =>
    isFolderSupported() ? { state: 'none' } : { state: 'unsupported' },
  );

  // Restore a previously chosen data folder (permission may need a click).
  useEffect(() => {
    if (!isFolderSupported()) return;
    let cancelled = false;
    loadStoredHandle().then(async (handle) => {
      if (!handle || cancelled) return;
      const granted = await verifyPermission(handle, false);
      if (cancelled) return;
      setFolder({ state: granted ? 'active' : 'need-permission', handle, name: handle.name });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live JSON copy of everything into the chosen folder, debounced.
  useEffect(() => {
    if (folder.state !== 'active') return;
    const timer = window.setTimeout(() => {
      writeBackup(folder.handle, {
        exportedAt: new Date().toISOString(),
        data,
        settings,
        stats,
        sessions,
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [folder, data, settings, stats, sessions]);

  const chooseFolder = async () => {
    const handle = await pickDataFolder();
    if (handle) setFolder({ state: 'active', handle, name: handle.name });
  };

  const resumeFolder = async () => {
    if (folder.state !== 'need-permission') return;
    if (await verifyPermission(folder.handle, true)) {
      setFolder({ state: 'active', handle: folder.handle, name: folder.name });
    }
  };

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
    // Newest cards go to the top of the deck view.
    updateDeck(deckId, (deck) => ({ ...deck, cards: [card, ...deck.cards] }));
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
      updateDeck(deckId, (deck) => ({ ...deck, cards: [...cards, ...deck.cards] }));
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
    const sessionId = crypto.randomUUID();
    updateSessions((sl) => ({
      ...sl,
      sessions: [
        {
          id: sessionId,
          deckId,
          deckName: deck.name,
          startedAt: new Date().toISOString(),
          total: queue.length,
          known: 0,
          unknown: 0,
        },
        ...sl.sessions,
      ].slice(0, MAX_STORED_SESSIONS),
    }));
    setView({ name: 'study', deckId, queue, mode, sessionId });
  };

  const handleSwipe = (deckId: string, cardId: string, dir: SwipeDir, sessionId: string) => {
    const card = findDeck(deckId)?.cards.find((c) => c.id === cardId);
    if (!card) return;
    const today = todayISO();
    const know = dir === 'know';
    const updated = applySwipe(card, dir, today);
    updateDeck(deckId, (deck) => ({
      ...deck,
      cards: deck.cards.map((c) => (c.id === cardId ? updated : c)),
    }));
    updateStats((s) => {
      const day = s.days[today] ?? { reviews: 0, known: 0, unknown: 0, levelsGained: 0, levelsLost: 0, byDeck: {} };
      const deckDay = day.byDeck[deckId] ?? { reviews: 0, known: 0, unknown: 0 };
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
    // Per-swipe session progress — an interrupted session keeps what was done.
    updateSessions((sl) => ({
      ...sl,
      sessions: sl.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, known: s.known + (know ? 1 : 0), unknown: s.unknown + (know ? 0 : 1) }
          : s,
      ),
    }));
  };

  // Guard views whose deck may have been deleted.
  const activeDeck =
    view.name === 'deck' || view.name === 'study' || view.name === 'summary' ? findDeck(view.deckId) : undefined;
  const effectiveView: View =
    (view.name === 'deck' || view.name === 'study' || view.name === 'summary') && !activeDeck
      ? { name: 'decks' }
      : view;

  return (
    <div className={`app${effectiveView.name === 'decks' ? ' app-wide' : ''}`}>
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
          <LanguageMenu language={settings.language} onChange={(language) => onChangeSettings({ language })} />
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
          <div className="decks-layout">
            <OverviewPanel sessions={sessions.sessions} />
            <DeckList
              decks={data.decks}
              onOpenDeck={(deckId) => setView({ name: 'deck', deckId })}
              onCreateDeck={createDeck}
              onImportDeck={importDeck}
            />
          </div>
        )}

        {effectiveView.name === 'dashboard' && (
          <Dashboard data={data} stats={stats} settings={settings} onChangeSettings={onChangeSettings} />
        )}

        {effectiveView.name === 'deck' && activeDeck && (
          <DeckDetail
            deck={activeDeck}
            accent={deckAccent(deckIndex(activeDeck.id))}
            settings={settings}
            onChangeSettings={onChangeSettings}
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
            settings={settings}
            onChangeSettings={onChangeSettings}
            onSwipe={(cardId, dir) => handleSwipe(activeDeck.id, cardId, dir, effectiveView.sessionId)}
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
        onChangeLanguage={(language) => onChangeSettings({ language })}
        folder={folder}
        onChooseFolder={chooseFolder}
        onResumeFolder={resumeFolder}
        onClose={() => setOptionsOpen(false)}
      />
    </div>
  );
}
