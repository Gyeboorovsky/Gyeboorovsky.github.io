import type { Deck } from '../types';
import { isDue } from '../leitner';
import { fmt, useI18n } from '../i18n';
import Drawer from './Drawer';

interface DeckCardsDrawerProps {
  deck: Deck;
  currentCardId: string | null;
  open: boolean;
  onClose: () => void;
}

/** Left panel in a study session: every card in the deck with its Leitner level.
    Non-modal — stays open while swiping, until the user closes it. */
export default function DeckCardsDrawer({ deck, currentCardId, open, onClose }: DeckCardsDrawerProps) {
  const t = useI18n();
  return (
    <Drawer side="left" open={open} title={t.study.cardsPanel} onClose={onClose} modal={false}>
      <ul className="drawer-card-list">
        {deck.cards.map((card) => (
          <li key={card.id} className={`drawer-card-row${card.id === currentCardId ? ' current' : ''}`}>
            <span className={`level-chip lv-${card.level}`}>{fmt(t.deck.level, { n: card.level })}</span>
            <span className="drawer-card-front">{card.front}</span>
            {isDue(card) && <span className="due-dot" title={t.deck.dueTag} />}
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
