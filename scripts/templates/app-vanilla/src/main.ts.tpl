import '@portfolio/shared/tokens.css';
import '@portfolio/shared/base.css';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

// Minimal hash router — GitHub Pages has no server rewrites, so routes live
// behind '#/'. Replace these views with your app.
const views: Record<string, () => string> = {
  '': () => `
    <h1>{{TITLE}}</h1>
    <p>Fresh app scaffold. Edit <code>src/main.ts</code> to get started.</p>
    <p><a href="#/about">About →</a></p>
  `,
  '/about': () => `
    <h1>About</h1>
    <p>Second view — proves hash routing works on GitHub Pages.</p>
    <p><a href="#/">← Back</a></p>
  `,
};

function render(): void {
  const route = location.hash.replace(/^#/, '');
  const view = views[route] ?? (() => `<h1>Not found</h1><p><a href="#/">Home</a></p>`);
  app.innerHTML = `<main class="wrap">${view()}<footer><a href="/">← all apps</a></footer></main>`;
}

window.addEventListener('hashchange', render);
render();
