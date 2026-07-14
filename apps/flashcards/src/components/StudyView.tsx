import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Deck, SwipeDir } from '../types';
import { fitFont } from '../fitFont';
import { fmt, useI18n } from '../i18n';
import DeckCardsDrawer from './DeckCardsDrawer';

const SWIPE_THRESHOLD = 90;
const TAP_TOLERANCE = 6;
const FLING_MS = 260;

interface StudyViewProps {
  deck: Deck;
  queue: string[];
  onSwipe: (cardId: string, dir: SwipeDir) => void;
  onFinish: (known: number, unknown: number) => void;
  onExit: () => void;
}

export default function StudyView({ deck, queue, onSwipe, onFinish, onExit }: StudyViewProps) {
  const t = useI18n();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pointerId = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const committing = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const card = deck.cards.find((c) => c.id === queue[index]);

  const commit = (dir: SwipeDir) => {
    if (committing.current || !card) return;
    committing.current = true;
    pointerId.current = null;
    setDragging(false);
    const fling = Math.max(window.innerWidth, 700);
    setDragX(dir === 'know' ? fling : -fling);
    const nextKnown = known + (dir === 'know' ? 1 : 0);
    const nextUnknown = unknown + (dir === 'dontKnow' ? 1 : 0);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      onSwipe(card.id, dir);
      setKnown(nextKnown);
      setUnknown(nextUnknown);
      committing.current = false;
      if (index + 1 >= queue.length) {
        onFinish(nextKnown, nextUnknown);
      } else {
        setIndex(index + 1);
        setFlipped(false);
        setDragX(0);
      }
    }, FLING_MS);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (committing.current || pointerId.current !== null) return;
    pointerId.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic events (tests) have no real pointer to capture — drag still works.
    }
    start.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    setDragX(0);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    setDragX(e.clientX - start.current.x);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setDragging(false);
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < TAP_TOLERANCE) {
      setDragX(0);
      setFlipped((f) => !f);
      return;
    }
    if (dx > SWIPE_THRESHOLD) commit('know');
    else if (dx < -SWIPE_THRESHOLD) commit('dontKnow');
    else setDragX(0);
  };

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setDragging(false);
    setDragX(0);
  };

  if (!card) return null;

  const rot = Math.max(-18, Math.min(18, dragX / 12));
  const knowOpacity = Math.max(0, Math.min(1, dragX / SWIPE_THRESHOLD));
  const studyOpacity = Math.max(0, Math.min(1, -dragX / SWIPE_THRESHOLD));

  return (
    <section className="study">
      <div className="study-head">
        <button className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label={t.study.cardsPanel}>
          ☰
        </button>
        <span className="study-deck-name">{deck.name}</span>
        <span className="study-counter">
          {fmt(t.study.counter, { n: Math.min(index + 1, queue.length), total: queue.length })}
        </span>
        <button className="icon-btn" onClick={onExit} title={t.study.endSession} aria-label={t.study.endSession}>
          ✕
        </button>
      </div>

      <div className="card-stage">
        <div className="stack-layer stack-layer-1" />
        <div className="stack-layer stack-layer-2" />
        <div
          key={card.id}
          className="swipe-card"
          style={{
            transform: `translateX(${dragX}px) rotate(${rot}deg)`,
            transition: dragging ? 'none' : 'transform .35s cubic-bezier(.2,.8,.2,1)',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div className="flip-inner" style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0.01deg)' }}>
            <div className="flip-face flip-front">
              <span className="card-text" style={{ fontSize: fitFont(card.front) }}>
                {card.front}
              </span>
              <span className="flip-hint">{t.study.tapToFlip}</span>
            </div>
            <div className="flip-face flip-back">
              <span className="card-text" style={{ fontSize: fitFont(card.back) }}>
                {card.back}
              </span>
            </div>
          </div>
          <div className="stamp stamp-know" style={{ opacity: knowOpacity }}>
            {t.study.knowStamp}
          </div>
          <div className="stamp stamp-study" style={{ opacity: studyOpacity }}>
            {t.study.studyStamp}
          </div>
        </div>
      </div>

      <div className="study-controls">
        <button className="round-btn round-btn-no" onClick={() => commit('dontKnow')} aria-label={t.study.dontKnow}>
          ✕
        </button>
        <span className="swipe-hint">{t.study.swipeHint}</span>
        <button className="round-btn round-btn-yes" onClick={() => commit('know')} aria-label={t.study.know}>
          ✓
        </button>
      </div>

      <DeckCardsDrawer
        deck={deck}
        currentCardId={card.id}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}
