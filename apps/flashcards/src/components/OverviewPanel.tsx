import type { SessionRecord } from '../types';
import { fmt, useI18n } from '../i18n';

const MAX_SHOWN = 8;

interface OverviewPanelProps {
  sessions: SessionRecord[];
}

/** Left sidebar on the decks screen: the user's recent study sessions. */
export default function OverviewPanel({ sessions }: OverviewPanelProps) {
  const t = useI18n();
  const shown = sessions.filter((s) => s.known + s.unknown > 0).slice(0, MAX_SHOWN);

  return (
    <aside className="overview-panel tilt-r">
      <h2 className="overview-title">{t.overview.title}</h2>
      {shown.length === 0 ? (
        <p className="empty-text">{t.overview.empty}</p>
      ) : (
        <ul className="session-list">
          {shown.map((s) => {
            const done = s.known + s.unknown;
            const pct = s.total === 0 ? 0 : Math.round((done / s.total) * 100);
            return (
              <li key={s.id} className="session-item">
                <div className="session-top">
                  <span className="session-deck">{s.deckName}</span>
                  <span className="session-date">
                    {new Date(s.startedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="session-bar">
                  <span className="session-bar-known" style={{ width: `${(s.known / Math.max(1, s.total)) * 100}%` }} />
                  <span
                    className="session-bar-unknown"
                    style={{ width: `${(s.unknown / Math.max(1, s.total)) * 100}%` }}
                  />
                </div>
                <div className="session-meta">
                  <span className="session-known">✓ {s.known}</span>
                  <span className="session-unknown">✕ {s.unknown}</span>
                  <span className="session-progress">
                    {fmt(t.overview.progress, { done, total: s.total })} · {pct}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
