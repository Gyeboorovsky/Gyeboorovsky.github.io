import type { Language, Settings } from '../types';
import { LANGUAGE_NAMES, fmt, useI18n } from '../i18n';
import type { FolderStatus } from '../localFolder';
import Drawer from './Drawer';
import { Flag } from './LanguageMenu';

interface OptionsDrawerProps {
  open: boolean;
  settings: Settings;
  onChangeLanguage: (language: Language) => void;
  folder: FolderStatus;
  onChooseFolder: () => void;
  onResumeFolder: () => void;
  onClose: () => void;
}

/** Whole-app options (header ⚙️): language + the local data folder.
    View-specific options live in each view's own right panel. */
export default function OptionsDrawer({
  open,
  settings,
  onChangeLanguage,
  folder,
  onChooseFolder,
  onResumeFolder,
  onClose,
}: OptionsDrawerProps) {
  const t = useI18n();
  const languages = Object.keys(LANGUAGE_NAMES) as Language[];

  return (
    <Drawer side="right" open={open} title={t.options.appTitle} onClose={onClose}>
      <div className="options-section">
        <h3 className="options-heading">{t.options.language}</h3>
        <div className="pill-row">
          {languages.map((lang) => (
            <button
              key={lang}
              className={`pill${settings.language === lang ? ' pill-active' : ''}`}
              onClick={() => onChangeLanguage(lang)}
            >
              <Flag lang={lang} /> {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="options-section">
        <h3 className="options-heading">{t.options.dataFolder}</h3>
        <p className="options-hint">{t.options.dataFolderHint}</p>
        {folder.state === 'unsupported' && <p className="options-hint">{t.options.dataFolderUnsupported}</p>}
        {folder.state === 'none' && (
          <>
            <p className="folder-status">{t.options.dataFolderNone}</p>
            <button className="btn btn-primary" onClick={onChooseFolder}>
              📁 {t.options.dataFolderChoose}
            </button>
          </>
        )}
        {folder.state === 'need-permission' && (
          <>
            <p className="folder-status">{fmt(t.options.dataFolderActive, { name: folder.name })}</p>
            <button className="btn btn-primary" onClick={onResumeFolder}>
              🔓 {t.options.dataFolderResume}
            </button>
          </>
        )}
        {folder.state === 'active' && (
          <>
            <p className="folder-status folder-active">📁 {fmt(t.options.dataFolderActive, { name: folder.name })}</p>
            <button className="btn btn-ghost" onClick={onChooseFolder}>
              {t.options.dataFolderChoose}
            </button>
          </>
        )}
      </div>
    </Drawer>
  );
}
