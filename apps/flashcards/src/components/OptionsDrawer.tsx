import type { Language, Settings, WidgetId } from '../types';
import { LANGUAGE_NAMES, useI18n } from '../i18n';
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

interface OptionsDrawerProps {
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

export default function OptionsDrawer({ open, settings, onChange, onClose }: OptionsDrawerProps) {
  const t = useI18n();
  const languages = Object.keys(LANGUAGE_NAMES) as Language[];

  return (
    <Drawer side="right" open={open} title={t.options.title} onClose={onClose}>
      <div className="options-section">
        <h3 className="options-heading">{t.options.language}</h3>
        <div className="pill-row">
          {languages.map((lang) => (
            <button
              key={lang}
              className={`pill${settings.language === lang ? ' pill-active' : ''}`}
              onClick={() => onChange({ language: lang })}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </div>

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
    </Drawer>
  );
}
