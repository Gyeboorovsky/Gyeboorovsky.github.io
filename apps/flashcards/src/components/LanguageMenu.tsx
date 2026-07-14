import { useState } from 'react';
import type { Language } from '../types';
import { LANGUAGE_NAMES, useI18n } from '../i18n';

/** Inline SVG national flags — emoji flags render as letter codes on Windows. */
export function Flag({ lang }: { lang: Language }) {
  if (lang === 'pl') {
    return (
      <svg className="flag" viewBox="0 0 24 16" aria-hidden>
        <rect width="24" height="16" fill="#ffffff" />
        <rect y="8" width="24" height="8" fill="#dc143c" />
      </svg>
    );
  }
  return (
    <svg className="flag" viewBox="0 0 24 16" aria-hidden>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#ffffff" strokeWidth="3.2" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.4" />
      <rect x="9.6" width="4.8" height="16" fill="#ffffff" />
      <rect y="5.6" width="24" height="4.8" fill="#ffffff" />
      <rect x="10.8" width="2.4" height="16" fill="#c8102e" />
      <rect y="6.8" width="24" height="2.4" fill="#c8102e" />
    </svg>
  );
}

interface LanguageMenuProps {
  language: Language;
  onChange: (language: Language) => void;
}

/** Flag dropdown in the top-right corner — the UI language switch. */
export default function LanguageMenu({ language, onChange }: LanguageMenuProps) {
  const t = useI18n();
  const [open, setOpen] = useState(false);
  const languages = Object.keys(LANGUAGE_NAMES) as Language[];

  return (
    <div className="lang-menu">
      <button
        className="nav-pill lang-btn"
        title={t.options.language}
        aria-label={t.options.language}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Flag lang={language} /> ▾
      </button>
      {open && (
        <>
          <div className="lang-menu-overlay" onClick={() => setOpen(false)} />
          <ul className="lang-menu-list" role="listbox" aria-label={t.options.language}>
            {languages.map((lang) => (
              <li key={lang}>
                <button
                  className={`lang-menu-item${lang === language ? ' active' : ''}`}
                  role="option"
                  aria-selected={lang === language}
                  onClick={() => {
                    onChange(lang);
                    setOpen(false);
                  }}
                >
                  <Flag lang={lang} /> {LANGUAGE_NAMES[lang]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
