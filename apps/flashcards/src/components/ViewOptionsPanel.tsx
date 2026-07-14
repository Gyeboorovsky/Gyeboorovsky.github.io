import type { Settings, WidgetId } from '../types';
import { useI18n } from '../i18n';
import Drawer from './Drawer';

export const WIDGET_IDS: WidgetId[] = [
  'levelsGained',
  'reviews',
  'accuracy',
  'levelDistribution',
  'perDeck',
  'activity',
];

const SESSION_SIZES = [10, 20, 50, 0]; // 0 = all

interface ViewOptionsPanelProps {
  /** 'session' → cards-per-session (deck & study views); 'dashboard' → dashboard prefs. */
  kind: 'session' | 'dashboard';
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

/** Right-side panel with options for the CURRENT view only.
    Non-modal — the view stays usable; closes via its ✕. */
export default function ViewOptionsPanel({ kind, open, settings, onChange, onClose }: ViewOptionsPanelProps) {
  const t = useI18n();

  return (
    <Drawer side="right" open={open} title={t.options.viewTitle} onClose={onClose} modal={false}>
      {kind === 'session' && (
        <div className="options-section">
          <h3 className="options-heading">{t.options.cardsPerSession}</h3>
          <div className="pill-row">
            {SESSION_SIZES.map((size) => (
              <button
                key={size}
                className={`pill${settings.cardsPerSession === size ? ' pill-active' : ''}`}
                onClick={() => onChange({ cardsPerSession: size })}
              >
                {size === 0 ? t.options.all : size}
              </button>
            ))}
          </div>
        </div>
      )}

      {kind === 'dashboard' && (
        <div className="options-section">
          <h3 className="options-heading">{t.options.dashboardSection}</h3>
          <p className="options-sub">{t.options.defaultView}</p>
          <div className="pill-row">
            {(['basic', 'detail'] as const).map((mode) => (
              <button
                key={mode}
                className={`pill${settings.dashboardMode === mode ? ' pill-active' : ''}`}
                onClick={() => onChange({ dashboardMode: mode })}
              >
                {mode === 'basic' ? t.dashboard.basic : t.dashboard.detail}
              </button>
            ))}
          </div>
          <p className="options-sub">{t.options.widgets}</p>
          <ul className="widget-toggles">
            {WIDGET_IDS.map((id) => (
              <li key={id}>
                <label className="widget-toggle">
                  <input
                    type="checkbox"
                    checked={settings.dashboardWidgets[id]}
                    onChange={(e) =>
                      onChange({
                        dashboardWidgets: { ...settings.dashboardWidgets, [id]: e.target.checked },
                      })
                    }
                  />
                  <span>{t.options.widgetNames[id]}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
