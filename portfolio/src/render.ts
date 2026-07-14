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

function coverStyle(app: ManifestApp): string {
  if (app.screenshot) {
    return (
      `background-image:linear-gradient(155deg, rgba(0,0,0,0) 30%, rgba(9,10,13,0.6)), url('${esc(app.screenshot)}');` +
      'background-size:cover;background-position:center;'
    );
  }
  return `background:linear-gradient(150deg, oklch(0.62 0.17 ${app.accentHue}), oklch(0.32 0.13 ${app.accentHue}));`;
}

function cardHtml(app: ManifestApp, index: number, featured: boolean): string {
  const num = String(index + 1).padStart(2, '0');
  const tag = app.tags[0] ?? 'app';
  const catClass = `card__tag--${categoryKey(tag)}`;
  const statusBadge =
    app.status === 'wip'
      ? '<span class="card__status card__status--wip">WIP</span>'
      : app.status === 'archived'
        ? '<span class="card__status card__status--archived">Archived</span>'
        : '';
  const classes = [
    'card',
    featured ? 'card--featured' : '',
    app.status === 'archived' ? 'card--archived' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `
    <a class="${classes}" href="${esc(app.url)}">
      <div class="card__cover" style="${coverStyle(app)}">
        <span class="card__tag ${catClass}">${esc(tag)}${featured ? ' · Featured' : ''}</span>
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

function otherProjectsHtml(externalApps: ManifestApp[]): string {
  if (externalApps.length === 0) return '';
  return `
    <section class="other">
      <h2 class="other__title">Other projects</h2>
      <ul class="other__list">
        ${externalApps
          .map(
            (a) => `
          <li class="other__item">
            <a href="${esc(a.url)}" target="_blank" rel="noopener">
              ${esc(a.title)} <span class="other__ext">↗</span>
            </a>
            <span class="other__meta">${a.role ? esc(a.role) + ' · ' : ''}${a.year}</span>
          </li>`,
          )
          .join('')}
      </ul>
    </section>`;
}

export function renderPage(
  root: HTMLElement,
  manifest: Manifest,
  activeFilter: string,
  onFilter: (filter: string) => void,
): void {
  const internalApps = manifest.apps.filter((a) => a.kind === 'internal');
  const externalApps = manifest.apps.filter((a) => a.kind === 'external');

  const tags = ['All', ...new Set(internalApps.flatMap((a) => a.tags))];
  const filtered =
    activeFilter === 'All' ? internalApps : internalApps.filter((a) => a.tags.includes(activeFilter));
  const [first, ...rest] = filtered;

  const years = manifest.apps.map((a) => a.year);
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
        ${first ? cardHtml(first, 0, true) : '<p class="empty">Nothing here yet.</p>'}
        ${rest.map((a, i) => cardHtml(a, i + 1, false)).join('')}
      </section>
      ${otherProjectsHtml(externalApps)}
      <footer class="footer">
        <a href="https://github.com/Gyeboorovsky/Gyeboorovsky.github.io" target="_blank" rel="noopener">source ↗</a>
      </footer>
    </main>`;

  root.querySelectorAll<HTMLButtonElement>('.pill').forEach((btn) => {
    btn.addEventListener('click', () => onFilter(btn.dataset.filter!));
  });
}
