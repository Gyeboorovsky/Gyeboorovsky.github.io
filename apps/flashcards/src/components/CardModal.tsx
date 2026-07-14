import { useRef, useState, type KeyboardEvent } from 'react';
import { fmt, useI18n } from '../i18n';

type CardModalProps =
  | { mode: 'add'; onAdd: (front: string, back: string) => void; onClose: () => void }
  | {
      mode: 'edit';
      initialFront: string;
      initialBack: string;
      onSave: (front: string, back: string) => void;
      onClose: () => void;
    };

/** Enter must not submit mid-IME-composition (229 = legacy composition keyCode). */
function isComposing(e: KeyboardEvent<HTMLTextAreaElement>): boolean {
  return e.nativeEvent.isComposing || e.keyCode === 229;
}

/**
 * Add/edit card modal. Rapid-entry keyboard flow (add mode):
 * front + Enter → focus back; back + Enter → add card, clear fields, focus
 * front again. Shift+Enter is never intercepted (newline in either field).
 */
export default function CardModal(props: CardModalProps) {
  const t = useI18n();
  const [front, setFront] = useState(props.mode === 'edit' ? props.initialFront : '');
  const [back, setBack] = useState(props.mode === 'edit' ? props.initialBack : '');
  const [addedCount, setAddedCount] = useState(0);
  const [entryKey, setEntryKey] = useState(0);
  const [shake, setShake] = useState<'front' | 'back' | null>(null);
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) {
      const missing = !f ? 'front' : 'back';
      setShake(missing);
      window.setTimeout(() => setShake(null), 400);
      (missing === 'front' ? frontRef : backRef).current?.focus();
      return;
    }
    if (props.mode === 'add') {
      props.onAdd(f, b);
      setFront('');
      setBack('');
      setAddedCount((n) => n + 1);
      setEntryKey((k) => k + 1); // remounts the fieldset → autoFocus lands on front
    } else {
      props.onSave(f, b);
      props.onClose();
    }
  };

  const onFrontKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing(e)) {
      e.preventDefault();
      backRef.current?.focus();
    }
  };

  const onBackKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing(e)) {
      e.preventDefault();
      submit();
    }
  };

  const onModalKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') props.onClose();
  };

  return (
    <div className="modal-backdrop" onClick={props.onClose}>
      <div
        className="modal card-modal"
        role="dialog"
        aria-label={props.mode === 'add' ? t.cardModal.addTitle : t.cardModal.editTitle}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onModalKeyDown}
      >
        <div className="card-modal-head">
          <h2 className="modal-title">
            {props.mode === 'add' ? t.cardModal.addTitle : t.cardModal.editTitle}
          </h2>
          {props.mode === 'add' && addedCount > 0 && (
            <span className="added-pill">{fmt(t.cardModal.addedCount, { n: addedCount })}</span>
          )}
        </div>

        <div className="card-modal-fields" key={entryKey}>
          <label className="field-label" htmlFor="fc-front">
            {t.cardModal.frontLabel}
          </label>
          <textarea
            id="fc-front"
            ref={frontRef}
            className={`field-input${shake === 'front' ? ' shake' : ''}`}
            value={front}
            placeholder={t.cardModal.frontPlaceholder}
            rows={2}
            autoFocus
            onChange={(e) => setFront(e.target.value)}
            onKeyDown={onFrontKeyDown}
          />
          <label className="field-label" htmlFor="fc-back">
            {t.cardModal.backLabel}
          </label>
          <textarea
            id="fc-back"
            ref={backRef}
            className={`field-input${shake === 'back' ? ' shake' : ''}`}
            value={back}
            placeholder={t.cardModal.backPlaceholder}
            rows={2}
            onChange={(e) => setBack(e.target.value)}
            onKeyDown={onBackKeyDown}
          />
        </div>

        <p className="key-hint">{t.cardModal.keyHint}</p>

        <div className="card-modal-actions">
          <button className="btn btn-ghost" onClick={props.onClose}>
            {t.cardModal.done}
          </button>
          <button className="btn btn-primary" onClick={submit}>
            {props.mode === 'add' ? t.cardModal.add : t.cardModal.save}
          </button>
        </div>
      </div>
    </div>
  );
}
