import type { Lang, Manifest, ManifestApp, UiI18n } from './types';
import { unlockOffer } from './gate';

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

const TAB_LABELS: Record<string, string> = {
  app: 'Apps',
  apps: 'Apps',
  tool: 'Tools',
  tools: 'Tools',
  game: 'Games',
  games: 'Games',
  mobile: 'Mobile',
  website: 'Websites',
  websites: 'Websites',
  offer: 'Offers',
  offers: 'Offers',
};

/** English is the base language, hardcoded here; a non-English printing only
 * ever overrides — a key it doesn't set falls straight back to English. */
const EN_UI: Required<UiI18n> = {
  pageTitle: 'Gyeboorovsky — games, apps and sites made for fun',
  pageDescription: 'A catalog of small games, apps and websites. Free, in your browser, nothing to install.',
  tagline: 'Free &middot; runs in your browser',
  themeButton: 'Pearl / Midnight',
  themeAria: 'Switch between the pearl and midnight printings',
  langButton: 'EN / PL',
  langAria: 'Switch the site language',
  tabs: TAB_LABELS,
  empty: 'Nothing in this class.',
  footer: 'Everything here is free',
  wip: 'WIP',
  retired: 'Retired',
  sealed: 'Sealed',
  passwordAria: 'Password for {title}',
  gateError: 'No preview under that password.',
};

/** Resolve UI copy for a printing: every key falls back to English. */
function uiFor(manifest: Manifest, lang: Lang): Required<UiI18n> {
  if (lang === 'en') return EN_UI;
  const override = manifest.i18n?.[lang]?.ui ?? {};
  return { ...EN_UI, ...override, tabs: { ...EN_UI.tabs, ...override.tabs } };
}

/** Resolve an app's content for a printing: title/description/stat each fall
 * back to English independently (a translator may only fill in some). */
function appFor(app: ManifestApp, lang: Lang): ManifestApp {
  if (lang === 'en') return app;
  const override = app.i18n?.[lang] ?? {};
  return { ...app, ...override };
}

/** Parse a "<cols>x<rows>" size into [w, h], clamped to 1-3, defaulting to 1x1. */
function tileSize(size: string): [number, number] {
  const [w, h] = String(size ?? '1x1').split('x').map((n) => Number(n));
  const clamp = (n: number) => Math.min(3, Math.max(1, Number.isFinite(n) ? n : 1));
  return [clamp(w), clamp(h)];
}

function artHtml(app: ManifestApp): string {
  if (app.screenshot) {
    return `<span class="car__art" style="background-image:url('${esc(app.screenshot)}')">`;
  }
  return '<span class="car__art car__art--flat">';
}

/** Everything painted on the panel: decal, race number, seal, and the artwork. */
function carBody(app: ManifestApp, index: number, ui: Required<UiI18n>): string {
  const statusMark =
    app.status === 'wip'
      ? `<span class="car__status">${esc(ui.wip)}</span>`
      : app.status === 'archived'
        ? `<span class="car__status">${esc(ui.retired)}</span>`
        : '';
  return `
    ${artHtml(app)}
      <span class="car__tag"><span>${esc(app.tags[0] ?? 'app')}</span></span>
      ${statusMark}
      <span class="car__no">${index + 1}</span>
    </span>
    <span class="car__name">
      <span class="car__t">${esc(app.title)}</span>
      ${app.stat ? `<span class="car__stat">${esc(app.stat)}</span>` : ''}
      <span class="car__d">${esc(app.description)}</span>
    </span>`;
}

function carHtml(app: ManifestApp, index: number, ui: Required<UiI18n>): string {
  const [w, h] = tileSize(app.size);
  // Panels covering four cells or more carry the larger lettering.
  const lead = w * h >= 4;
  const classes = [
    'panel',
    'car',
    lead ? 'car--lead' : '',
    w === 2 ? 'car--w2' : w === 3 ? 'car--w3' : '',
    h === 2 ? 'car--h2' : h === 3 ? 'car--h3' : '',
    app.status === 'archived' ? 'car--retired' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (app.gated) {
    // The password is not checked here — it derives the preview's address.
    // The seal covers the whole panel; a click swaps its word for the entry
    // field in the same spot, and leaving the panel without submitting
    // swaps it back (see wireGate).
    return `
      <form class="${classes}" data-paint="${app.paint}" data-slug="${esc(app.slug)}" novalidate>
        ${carBody(app, index, ui)}
        <span class="car__gate" data-state="sealed">
          <span class="car__gateword">${esc(ui.sealed)}</span>
          <input class="car__gateinput" type="password" name="pw" autocomplete="off"
                 aria-label="${esc(ui.passwordAria.replace('{title}', app.title))}" />
          <span class="car__err" role="alert" hidden>${esc(ui.gateError)}</span>
        </span>
      </form>`;
  }

  // Every app lives in its own repo, but opens in this same tab.
  return `
    <a class="${classes}" data-paint="${app.paint}" href="${esc(app.url ?? '#')}">
      ${carBody(app, index, ui)}
    </a>`;
}

export function renderPage(
  root: HTMLElement,
  manifest: Manifest,
  lang: Lang,
  activeFilter: string | null,
  onFilter: (filter: string | null) => void,
): void {
  const ui = uiFor(manifest, lang);
  const apps = manifest.apps.map((a) => appFor(a, lang));

  // No "All" strip: nothing selected already means everything. One filter at a
  // time — clicking the lit strip turns it back off.
  const tags = [...new Set(apps.flatMap((a) => a.tags))];
  const filtered =
    activeFilter === null ? apps : apps.filter((a) => a.tags.includes(activeFilter));

  root.innerHTML = `
    <header class="hood">
      <div class="panel">
        <div class="roundel"><span>${apps.length}</span></div>
        <div class="hoodplate">
          <h1 class="mark">Gyeboorovsky</h1>
          <p class="strap">${ui.tagline}</p>
        </div>
      </div>
      <span class="cut cut--a"></span>
      <span class="cut cut--b"></span>
      <div class="hood__controls">
        <button class="lang" type="button" aria-label="${esc(ui.langAria)}">${esc(ui.langButton)}</button>
        <button class="theme" type="button" aria-label="${esc(ui.themeAria)}">
          ${esc(ui.themeButton)}
        </button>
      </div>
    </header>

    <nav class="sill" aria-label="Filter by kind">
      ${tags
        .map(
          (t) =>
            `<button class="panel strip"${
              t === activeFilter ? ' data-on' : ''
            } aria-pressed="${t === activeFilter}" data-filter="${esc(t)}" data-paint="${paintForTag(
              apps,
              t,
            )}"><span>${esc(ui.tabs[t] ?? t)}</span></button>`,
        )
        .join('')}
    </nav>

    <section class="deck">
      ${
        filtered.length === 0
          ? `<p class="empty">${esc(ui.empty)}</p>`
          : // Numbered by position on the deck, not on screen: a panel keeps
            // its race number when a filter hides its neighbours.
            filtered.map((a) => carHtml(a, apps.indexOf(a), ui)).join('')
      }
    </section>

    <a class="panel colophon" href="https://www.linkedin.com/in/tomasz-gieburowski-0b5685116/">
      <span>${esc(ui.footer)}</span>
      <span>LinkedIn</span>
    </a>`;

  root.querySelectorAll<HTMLButtonElement>('.strip').forEach((btn) => {
    // Clicking the lit strip clears the filter; any other strip replaces it.
    btn.addEventListener('click', () => {
      const tag = btn.dataset.filter!;
      onFilter(tag === activeFilter ? null : tag);
    });
  });

  root.querySelectorAll<HTMLFormElement>('form.car').forEach(wireGate);
}

/** The paint a sponsor strip lights up in: the paint of the panels it selects. */
function paintForTag(apps: ManifestApp[], tag: string): string {
  return apps.find((a) => a.tags.includes(tag))?.paint ?? 'ink';
}

function wireGate(form: HTMLFormElement): void {
  const gate = form.querySelector<HTMLElement>('.car__gate')!;
  const input = form.querySelector<HTMLInputElement>('.car__gateinput')!;
  const err = form.querySelector<HTMLElement>('.car__err')!;
  let busy = false;

  const edit = () => {
    if (gate.dataset.state === 'editing') return;
    gate.dataset.state = 'editing';
    err.hidden = true;
    input.focus();
  };

  // Leaving the panel without submitting reseals it — the word replaces the
  // field again, exactly where it swapped out.
  const reseal = () => {
    if (busy) return;
    gate.dataset.state = 'sealed';
    input.value = '';
    err.hidden = true;
  };

  gate.addEventListener('click', edit);
  form.addEventListener('mouseleave', reseal);

  input.addEventListener('input', () => {
    err.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = input.value.trim();
    if (!password) return;

    busy = true;
    input.disabled = true;
    const url = await unlockOffer(form.dataset.slug!, password);
    input.disabled = false;
    busy = false;

    if (url) {
      // Same tab on purpose: a popup opened after an await is blocked by
      // default in most browsers, and the preview links back here.
      location.href = url;
    } else {
      err.hidden = false;
      input.select();
    }
  });
}
