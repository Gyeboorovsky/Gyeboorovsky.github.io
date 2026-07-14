import { useState, type CSSProperties } from 'react';
import type { Deck } from '../types';
import { dueCards, learnedCount } from '../leitner';
import { fmt, useI18n } from '../i18n';

const ACCENTS = ['var(--fc-pink)', 'var(--fc-yellow)', 'var(--fc-cyan)'];

export function deckAccent(index: number): string {
  return ACCENTS[index % ACCENTS.length];
}

interface DeckListProps {
  decks: Deck[];
  onOpenDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => void;
  onImportDeck: () => Promise<string | null>;
}

export default function DeckList({ decks, onOpenDeck, onCreateDeck, onImportDeck }: DeckListProps) {
  const t = useI18n();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateDeck(trimmed);
    setName('');
    setCreating(false);
  };

  const importDeck = async () => {
    setImportError(null);
    const error = await onImportDeck();
    if (error) setImportError(fmt(t.decks.importFailed, { reason: error }));
  };

  return (
    <section className="deck-list">
      <div className="deck-list-head tilt-l">
        <h1 className="screen-title">{t.decks.heading}</h1>
        <p className="screen-sub">{t.decks.subheading}</p>
      </div>

      {decks.length === 0 ? (
        <div className="empty-hero tilt-l">
          <h2 className="empty-title">{t.decks.emptyTitle}</h2>
          <p className="empty-text">{t.decks.emptyText}</p>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            {t.decks.createDeck}
          </button>
        </div>
      ) : (
        <div className="deck-grid">
          {decks.map((deck, i) => {
            const total = deck.cards.length;
            const learned = learnedCount(deck);
            const due = dueCards(deck).length;
            const pct = total === 0 ? 0 : Math.round((learned / total) * 100);
            return (
              <button
                key={deck.id}
                className={`deck-card ${i % 2 === 0 ? 'tilt-l' : 'tilt-r'}`}
                style={{ '--deck-accent': deckAccent(i) } as CSSProperties}
                onClick={() => onOpenDeck(deck.id)}
              >
                <span className="deck-card-name">{deck.name}</span>
                <span className="deck-progress">
                  <span className="deck-progress-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="deck-card-meta">
                  <span>{fmt(t.decks.learned, { learned, total })}</span>
                  {due > 0 && <span className="due-badge">{fmt(t.decks.due, { n: due })}</span>}
                </span>
              </button>
            );
          })}
          <button className="deck-card deck-card-new tilt-r" onClick={() => setCreating(true)}>
            <span className="deck-card-name">{t.decks.newDeck}</span>
          </button>
        </div>
      )}

      <div className="deck-list-foot">
        <button className="btn btn-ghost" onClick={importDeck}>
          📥 {t.decks.importDeck}
        </button>
        {importError && <p className="error-text">{importError}</p>}
      </div>

      {creating && (
        <div className="modal-backdrop" onClick={() => setCreating(false)}>
          <div className="modal" role="dialog" aria-label={t.decks.createDeck} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{t.decks.createDeck}</h2>
            <input
              className="field-input"
              value={name}
              placeholder={t.decks.deckNamePlaceholder}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') create();
                if (e.key === 'Escape') setCreating(false);
              }}
            />
            <div className="card-modal-actions">
              <button className="btn btn-ghost" onClick={() => setCreating(false)}>
                {t.decks.cancel}
              </button>
              <button className="btn btn-primary" onClick={create}>
                {t.decks.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
