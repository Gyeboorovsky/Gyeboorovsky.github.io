import '@portfolio/shared/tokens.css';
import '@portfolio/shared/base.css';
import './styles.css';
import manifestJson from './generated/manifest.json';
import type { Manifest } from './types';
import { renderPage } from './render';

const manifest = manifestJson as unknown as Manifest;
const root = document.querySelector<HTMLDivElement>('#app')!;

let activeFilter = 'All';

function rerender(): void {
  renderPage(root, manifest, activeFilter, (filter) => {
    activeFilter = filter;
    rerender();
  });
}

rerender();
