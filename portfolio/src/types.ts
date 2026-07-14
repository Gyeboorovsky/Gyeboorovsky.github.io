export type AppStatus = 'live' | 'wip' | 'archived';
export type AppKind = 'internal' | 'external';

export interface ManifestApp {
  slug: string;
  kind: AppKind;
  title: string;
  description: string;
  /** Card link target: /apps/<slug>/ for internal, demoUrl ?? repoUrl for external. */
  url: string;
  repoUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  status: AppStatus;
  added: string;
  year: number;
  role: string | null;
  /** Absolute site path to the cover image, or null for the gradient fallback. */
  screenshot: string | null;
  accentHue: number;
  featured: boolean;
}

export interface Manifest {
  generatedAt: string;
  apps: ManifestApp[];
}
