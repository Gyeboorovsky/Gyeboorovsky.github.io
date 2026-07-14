import type { Manifest, ManifestApp } from './types';

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

function coverStyle(app: ManifestApp): string {
  if (app.screenshot) {
    return (
      `background-image:linear-gradient(155deg, rgba(0,0,0,0) 30%, rgba(9,10,13,0.6)), url('${esc(app.screenshot)}');` +
      'background-size:cover;background-position:center;'
    );
  }
  return `background:linear-gradient(150deg, oklch(0.35 0.055 ${app.accentHue}), oklch(0.22 0.03 ${app.accentHue}));`;
}

function cardHtml(app: ManifestApp, index: number, featured: boolean): string {
  const num = String(index + 1).padStart(2, '0');
  const tag = app.tags[0] ?? (app.kind === 'external' ? 'external' : 'app');
  const external = app.kind === 'external';
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
    <a class="${classes}" href="${esc(app.url)}"${external ? ' target="_blank" rel="noopener"' : ''}>
      <div class="card__cover" style="${coverStyle(app)}">
        <span class="card__tag">${esc(tag)}${featured ? ' · Featured' : ''}</span>
        ${statusBadge}
        <span class="card__num">${num}</span>
      </div>
      <div class="card__body">
        <div class="card__row">
          <h3 class="card__title">${esc(app.title)}${external ? ' <span class="card__ext">↗</span>' : ''}</h3>
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
  const [first, ...rest] = filtered;

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
          .map(
            (t) =>
              `<button class="pill${t === activeFilter ? ' pill--on' : ''}" data-filter="${esc(t)}">${esc(t)}</button>`,
          )
          .join('')}
      </nav>
      <section class="grid">
        ${first ? cardHtml(first, 0, true) : '<p class="empty">Nothing here yet.</p>'}
        ${rest.map((a, i) => cardHtml(a, i + 1, false)).join('')}
      </section>
      <footer class="footer">
        <a href="https://github.com/Gyeboorovsky/Gyeboorovsky.github.io" target="_blank" rel="noopener">source ↗</a>
      </footer>
    </main>`;

  root.querySelectorAll<HTMLButtonElement>('.pill').forEach((btn) => {
    btn.addEventListener('click', () => onFilter(btn.dataset.filter!));
  });
}
