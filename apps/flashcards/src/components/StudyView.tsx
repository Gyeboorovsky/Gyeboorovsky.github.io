import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Deck, Settings, SwipeDir } from '../types';
import { fitFont } from '../fitFont';
import { fmt, useI18n } from '../i18n';
import DeckCardsDrawer from './DeckCardsDrawer';
import ViewOptionsPanel from './ViewOptionsPanel';

const SWIPE_THRESHOLD = 90;
const TAP_TOLERANCE = 6;
const FLING_MS = 260;

/* Card front colors cycle through these; the stack layers show the actual
   colors of the next cards, so what peeks out below matches what comes next. */
const CARD_COLORS = ['var(--fc-pink)', 'var(--fc-yellow)', 'var(--fc-cyan)'];

interface StudyViewProps {
  deck: Deck;
  queue: string[];
  settings: Settings;
  onChangeSettings: (patch: Partial<Settings>) => void;
  onSwipe: (cardId: string, dir: SwipeDir) => void;
  onFinish: (known: number, unknown: number) => void;
  onExit: () => void;
}

export default function StudyView({
  deck,
  queue,
  settings,
  onChangeSettings,
  onSwipe,
  onFinish,
  onExit,
}: StudyViewProps) {
  const t = useI18n();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [colorOffset] = useState(() => Math.floor(Math.random() * CARD_COLORS.length));

  const colorAt = (i: number) => CARD_COLORS[(colorOffset + i) % CARD_COLORS.length];

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

  // Keyboard controls: ← don't know, → know, space = flip.
  // No dependency array on purpose — re-subscribes each render so the handlers
  // always see the current card/queue index.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        commit('know');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        commit('dontKnow');
      } else if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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
        <button className="icon-btn" onClick={() => setDrawerOpen((o) => !o)} aria-label={t.study.cardsPanel}>
          ☰
        </button>
        <span className="study-deck-name">{deck.name}</span>
        <span className="study-counter">
          {fmt(t.study.counter, { n: Math.min(index + 1, queue.length), total: queue.length })}
        </span>
        <button
          className="icon-btn"
          onClick={() => setViewOptionsOpen((o) => !o)}
          title={t.options.viewTitle}
          aria-label={t.options.viewTitle}
        >
          ⚙
        </button>
        <button className="icon-btn" onClick={onExit} title={t.study.endSession} aria-label={t.study.endSession}>
          ✕
        </button>
      </div>

      <div className="card-stage">
        {index + 2 < queue.length && (
          <div className="stack-layer stack-layer-1" style={{ background: colorAt(index + 2) }} />
        )}
        {index + 1 < queue.length && (
          <div className="stack-layer stack-layer-2" style={{ background: colorAt(index + 1) }} />
        )}
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
            <div className="flip-face flip-front" style={{ background: colorAt(index) }}>
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
      <span className="key-hint keyboard-hint">{t.study.keyboardHint}</span>

      <DeckCardsDrawer
        deck={deck}
        currentCardId={card.id}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <ViewOptionsPanel
        kind="session"
        open={viewOptionsOpen}
        settings={settings}
        onChange={onChangeSettings}
        onClose={() => setViewOptionsOpen(false)}
      />
    </section>
  );
}
