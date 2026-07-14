import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  side: 'left' | 'right';
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** modal (default): backdrop + Esc/backdrop-click closes.
      non-modal: persistent panel — the page stays interactive and only the ✕ closes it. */
  modal?: boolean;
}

export default function Drawer({ side, open, title, onClose, children, modal = true }: DrawerProps) {
  useEffect(() => {
    if (!open || !modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, modal, onClose]);

  if (!open) return null;

  const panel = (
    <aside
      className={`drawer drawer-${side}${modal ? '' : ' drawer-persistent'}`}
      role={modal ? 'dialog' : 'complementary'}
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="drawer-head">
        <h2 className="drawer-title">{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="✕">
          ✕
        </button>
      </div>
      <div className="drawer-body">{children}</div>
    </aside>
  );

  if (!modal) return panel;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      {panel}
    </div>
  );
}
