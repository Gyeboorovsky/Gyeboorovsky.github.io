import { useState, type CSSProperties } from 'react';
import type { Card, Deck } from '../types';
import { dueCards, isDue, nextDueDate } from '../leitner';
import { exportDeckJSON, exportWordsCSV } from '../storage';
import { fmt, useI18n } from '../i18n';
import CardModal from './CardModal';
import ConfirmDialog from './ConfirmDialog';
import ExportWordsModal from './ExportWordsModal';

type ModalState = null | { type: 'add' } | { type: 'edit'; card: Card } | { type: 'exportWords' };
type ConfirmState = null | { type: 'deck' } | { type: 'card'; cardId: string };

interface DeckDetailProps {
  deck: Deck;
  accent: string;
  onBack: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddCard: (front: string, back: string) => void;
  onEditCard: (cardId: string, front: string, back: string) => void;
  onDeleteCard: (cardId: string) => void;
  onImportWords: () => Promise<number | null>;
  onStudy: (mode: 'due' | 'all') => void;
}

export default function DeckDetail(props: DeckDetailProps) {
  const { deck, accent } = props;
  const t = useI18n();
  const [modal, setModal] = useState<ModalState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(deck.name);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const due = dueCards(deck).length;
  const nextDue = nextDueDate(deck);

  const saveRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) props.onRename(trimmed);
    setRenaming(false);
  };

  const importWords = async () => {
    setImportMsg(null);
    const n = await props.onImportWords();
    if (n === null) return; // cancelled picker
    setImportMsg(n > 0 ? fmt(t.deck.importWordsDone, { n }) : t.deck.importWordsNone);
    window.setTimeout(() => setImportMsg(null), 4000);
  };

  return (
    <section className="deck-detail" style={{ '--deck-accent': accent } as CSSProperties}>
      <div className="detail-head">
        <button className="icon-btn" onClick={props.onBack} aria-label={t.deck.back}>
          ‹
        </button>
        {renaming ? (
          <input
            className="field-input rename-input"
            value={nameDraft}
            autoFocus
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename();
              if (e.key === 'Escape') setRenaming(false);
            }}
            onBlur={saveRename}
          />
        ) : (
          <h1
            className="detail-title"
            title={t.deck.rename}
            onClick={() => {
              setNameDraft(deck.name);
              setRenaming(true);
            }}
          >
            {deck.name} <span className="rename-pen">✏️</span>
          </h1>
        )}
        <span className="detail-count">{fmt(t.deck.cardsCount, { n: deck.cards.length })}</span>
      </div>

      {deck.cards.length === 0 ? (
        <div className="empty-hero tilt-l">
          <h2 className="empty-title">{t.deck.emptyTitle}</h2>
          <p className="empty-text">{t.deck.emptyText}</p>
        </div>
      ) : (
        <div className="study-cta tilt-l">
          {due > 0 ? (
            <button className="btn btn-big btn-primary" onClick={() => props.onStudy('due')}>
              🔀 {fmt(t.deck.study, { n: due })}
            </button>
          ) : (
            <div className="caught-up">
              <span className="caught-up-title">{t.deck.allCaughtUp}</span>
              {nextDue && <span className="caught-up-sub">{fmt(t.deck.nextDue, { date: nextDue })}</span>}
            </div>
          )}
          <button className="btn btn-ghost" onClick={() => props.onStudy('all')}>
            {t.deck.practiceAll}
          </button>
        </div>
      )}

      <div className="detail-toolbar">
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          {t.deck.addCards}
        </button>
        <button className="btn btn-ghost" onClick={() => exportDeckJSON(deck)}>
          📤 {t.deck.exportDeck}
        </button>
        <button
          className="btn btn-ghost"
          disabled={deck.cards.length === 0}
          onClick={() => setModal({ type: 'exportWords' })}
        >
          📤 {t.deck.exportWords}
        </button>
        <button className="btn btn-ghost" onClick={importWords}>
          📥 {t.deck.importWords}
        </button>
        <button className="btn btn-danger-ghost" onClick={() => setConfirm({ type: 'deck' })}>
          🗑 {t.deck.deleteDeck}
        </button>
      </div>
      {importMsg && <p className="import-msg">{importMsg}</p>}

      <ul className="card-rows">
        {deck.cards.map((card) => (
          <li key={card.id} className="card-row">
            <span className={`level-chip lv-${card.level}`}>{fmt(t.deck.level, { n: card.level })}</span>
            <span className="card-row-text">
              <span className="card-row-front">{card.front}</span>
              <span className="card-row-back">{card.back}</span>
            </span>
            {isDue(card) && <span className="due-dot" title={t.deck.dueTag} />}
            <span className="card-row-actions">
              <button
                className="icon-btn"
                title={t.deck.edit}
                onClick={() => setModal({ type: 'edit', card })}
              >
                ✏️
              </button>
              <button
                className="icon-btn"
                title={t.deck.delete}
                onClick={() => setConfirm({ type: 'card', cardId: card.id })}
              >
                🗑
              </button>
            </span>
          </li>
        ))}
      </ul>

      {modal?.type === 'add' && (
        <CardModal mode="add" onAdd={props.onAddCard} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <CardModal
          mode="edit"
          initialFront={modal.card.front}
          initialBack={modal.card.back}
          onSave={(front, back) => props.onEditCard(modal.card.id, front, back)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'exportWords' && (
        <ExportWordsModal
          cards={deck.cards}
          onExport={(cards) => {
            exportWordsCSV(deck.name, cards);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {confirm?.type === 'deck' && (
        <ConfirmDialog
          message={fmt(t.deck.deleteDeckConfirm, { name: deck.name, n: deck.cards.length })}
          onConfirm={props.onDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'card' && (
        <ConfirmDialog
          message={t.deck.deleteCardConfirm}
          onConfirm={() => {
            props.onDeleteCard(confirm.cardId);
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </section>
  );
}
