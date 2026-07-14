import { defineConfig } from 'vite';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Base path derived from the folder name — the app deploys to /apps/<slug>/.
const slug = basename(dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  base: `/apps/${slug}/`,
});
