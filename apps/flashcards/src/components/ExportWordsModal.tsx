import { useState } from 'react';
import type { Card } from '../types';
import { fmt, useI18n } from '../i18n';

interface ExportWordsModalProps {
  cards: Card[];
  onExport: (cards: Card[]) => void;
  onClose: () => void;
}

/** Pick which cards to export as CSV — all selected by default. */
export default function ExportWordsModal({ cards, onExport, onClose }: ExportWordsModalProps) {
  const t = useI18n();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(cards.map((c) => c.id)));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal export-modal" role="dialog" aria-label={t.exportWords.title} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t.exportWords.title}</h2>
        <p className="modal-hint">{t.exportWords.hint}</p>
        <div className="export-select-row">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set(cards.map((c) => c.id)))}>
            {t.exportWords.selectAll}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
            {t.exportWords.selectNone}
          </button>
        </div>
        <ul className="export-list">
          {cards.map((card) => (
            <li key={card.id}>
              <label className="export-item">
                <input
                  type="checkbox"
                  checked={selected.has(card.id)}
                  onChange={() => toggle(card.id)}
                />
                <span className="export-item-front">{card.front}</span>
                <span className="export-item-back">{card.back}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="card-modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            {t.exportWords.cancel}
          </button>
          <button
            className="btn btn-primary"
            disabled={selected.size === 0}
            onClick={() => onExport(cards.filter((c) => selected.has(c.id)))}
          >
            {fmt(t.exportWords.exportN, { n: selected.size })}
          </button>
        </div>
      </div>
    </div>
  );
}
