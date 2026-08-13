import '@portfolio/shared/tokens.css';
import '@portfolio/shared/base.css';
import './styles.css';
import manifestJson from './generated/manifest.json';
import type { Lang, Manifest } from './types';
import { renderPage } from './render';

const manifest = manifestJson as unknown as Manifest;
const root = document.querySelector<HTMLDivElement>('#app')!;

const THEME_KEY = 'gyeboorovsky:printing';
type Printing = 'light' | 'dark';

/** Stored choice wins; with none, the visitor's OS preference decides. */
function storedPrinting(): Printing | null {
  const v = localStorage.getItem(THEME_KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

function currentPrinting(): Printing {
  return (
    storedPrinting() ??
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

function applyPrinting(p: Printing): void {
  document.documentElement.dataset.theme = p;
}

// Only stamp the root when the visitor has actually chosen, so an untouched
// site keeps following the OS as it changes.
const stored = storedPrinting();
if (stored) applyPrinting(stored);

const LANG_KEY = 'gyeboorovsky:lang';

/** Stored choice wins; with none, the visitor's browser language decides
 * (Polish for a Polish browser, English otherwise). */
function storedLang(): Lang | null {
  const v = localStorage.getItem(LANG_KEY);
  return v === 'en' || v === 'pl' ? v : null;
}

function currentLang(): Lang {
  return storedLang() ?? (navigator.language.toLowerCase().startsWith('pl') ? 'pl' : 'en');
}

function applyDocumentLang(lang: Lang): void {
  document.documentElement.lang = lang;
  const ui = manifest.i18n?.[lang]?.ui;
  document.title = ui?.pageTitle ?? 'Gyeboorovsky — games, apps and sites made for fun';
  document
    .querySelector('#meta-description')
    ?.setAttribute(
      'content',
      ui?.pageDescription ??
        'A catalog of small games, apps and websites. Free, in your browser, nothing to install.',
    );
}

let activeLang: Lang = currentLang();
// null = no filter, which is what shows every panel.
let activeFilter: string | null = null;

function rerender(): void {
  applyDocumentLang(activeLang);
  renderPage(root, manifest, activeLang, activeFilter, (filter) => {
    activeFilter = filter;
    rerender();
  });

  root.querySelector<HTMLButtonElement>('.theme')!.addEventListener('click', () => {
    const next: Printing = currentPrinting() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyPrinting(next);
  });

  root.querySelector<HTMLButtonElement>('.lang')!.addEventListener('click', () => {
    activeLang = activeLang === 'pl' ? 'en' : 'pl';
    localStorage.setItem(LANG_KEY, activeLang);
    rerender();
  });
}

rerender();
