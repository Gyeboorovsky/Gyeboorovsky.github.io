import type { Manifest, ManifestApp } from './types';

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

const CATEGORY_KEYS: Record<string, string> = {
  app: 'app',
  apps: 'app',
  tool: 'tool',
  tools: 'tool',
  game: 'game',
  games: 'game',
  mobile: 'mobile',
};

function categoryKey(tag: string): string {
  return CATEGORY_KEYS[tag.toLowerCase()] ?? 'default';
}

/** Parse a "<cols>x<rows>" size into [w, h], clamped to 1-3, defaulting to 1x1. */
function tileSize(size: string): [number, number] {
  const [w, h] = String(size ?? '1x1').split('x').map((n) => Number(n));
  const clamp = (n: number) => Math.min(3, Math.max(1, Number.isFinite(n) ? n : 1));
  return [clamp(w), clamp(h)];
}

function coverStyle(app: ManifestApp): string {
  if (app.screenshot) {
    return (
      `background-image:linear-gradient(155deg, rgba(0,0,0,0) 30%, rgba(9,10,13,0.6)), url('${esc(app.screenshot)}');` +
      'background-size:cover;background-position:center;'
    );
  }
  const h2 = app.accentHue2 ?? app.accentHue;
  return `background:linear-gradient(150deg, oklch(0.62 0.17 ${app.accentHue}), oklch(0.32 0.13 ${h2}));`;
}

function cardHtml(app: ManifestApp, index: number): string {
  const [w, h] = tileSize(app.size);
  // Tiles with area >= 4 (e.g. 2x2) get the larger "featured" typography.
  const prominent = w * h >= 4;
  const num = String(index + 1).padStart(2, '0');
  const tag = app.tags[0] ?? 'app';
  const catClass = `card__tag--${categoryKey(tag)}`;
  const statusBadge =
    app.status === 'wip'
      ? '<span class="card__status card__status--wip">WIP</span>'
      : app.status === 'archived'
        ? '<span class="card__status card__status--archived">Archived</span>'
        : '';
  const glow = Math.min(3, Math.max(0, Math.round(app.glow ?? 0)));
  const classes = [
    'card',
    prominent ? 'card--featured' : '',
    w === 2 ? 'card--w2' : w === 3 ? 'card--w3' : '',
    h === 2 ? 'card--h2' : h === 3 ? 'card--h3' : '',
    glow > 0 ? `card--glow${glow}` : '',
    app.status === 'archived' ? 'card--archived' : '',
  ]
    .filter(Boolean)
    .join(' ');
  // --card-hue tints the highlight glow to the app's accent colour.
  // Every app lives in its own repo, so tiles always open in a new tab.
  return `
    <a class="${classes}" style="--card-hue:${app.accentHue}" href="${esc(app.url)}" target="_blank" rel="noopener">
      <div class="card__cover" style="${coverStyle(app)}">
        <span class="card__tag ${catClass}">${esc(tag)}</span>
        ${statusBadge}
        <span class="card__num">${num}</span>
      </div>
      <div class="card__body">
        <div class="card__row">
          <h3 class="card__title">${esc(app.title)}</h3>
          <span class="card__year">${app.year}</span>
        </div>
        <p class="card__desc">${esc(app.description)}</p>
        ${app.role ? `<span class="card__role">${esc(app.role)}</span>` : ''}
      </div>
    </a>`;
}

export function renderPage(
  root: HTMLElement,
  manifest: Manifest,
  activeFilter: string,
  onFilter: (filter: string) => void,
): void {
  const apps = manifest.apps;

  const tags = ['All', ...new Set(apps.flatMap((a) => a.tags))];
  const filtered =
    activeFilter === 'All' ? apps : apps.filter((a) => a.tags.includes(activeFilter));

  const years = apps.map((a) => a.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const yearRange =
    years.length === 0 ? '' : minYear === maxYear ? `${maxYear}` : `${minYear} — ${maxYear}`;

  root.innerHTML = `
    <main class="panel">
      <header class="header">
        <div>
          <div class="header__badge">
            <span class="header__pulse"></span>
            <span class="header__badgetext">Hobby projects</span>
          </div>
          <h1 class="header__name">Gyeboorovsky</h1>
          <p class="header__sub">Apps, tools &amp; experiments — built for fun.</p>
        </div>
        <span class="header__years">${yearRange}</span>
      </header>
      <nav class="pills">
        ${tags
          .map((t) => {
            const cat = t === 'All' ? 'default' : categoryKey(t);
            return `<button class="pill${t === activeFilter ? ' pill--on' : ''}" data-filter="${esc(t)}" data-cat="${cat}">${esc(t)}</button>`;
          })
          .join('')}
      </nav>
      <section class="grid">
        ${
          filtered.length === 0
            ? '<p class="empty">Nothing to see.</p>'
            : filtered.map((a, i) => cardHtml(a, i)).join('')
        }
      </section>
      <footer class="footer">
        <a href="https://github.com/Gyeboorovsky/Gyeboorovsky.github.io" target="_blank" rel="noopener">source ↗</a>
      </footer>
    </main>`;

  root.querySelectorAll<HTMLButtonElement>('.pill').forEach((btn) => {
    btn.addEventListener('click', () => onFilter(btn.dataset.filter!));
  });
}
