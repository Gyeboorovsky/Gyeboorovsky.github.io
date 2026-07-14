export type AppStatus = 'live' | 'wip' | 'archived';
export type AppKind = 'external';

export interface ManifestApp {
  slug: string;
  kind: AppKind;
  title: string;
  description: string;
  /** Card link target: demoUrl ?? repoUrl. */
  url: string;
  repoUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  status: AppStatus;
  added: string;
  year: number;
  role: string | null;
  /** Absolute site path to the cover image (the grid thumbnail), or null → gradient. */
  screenshot: string | null;
  accentHue: number;
  /** Optional second hue for a two-tone gradient cover; null → single-hue. */
  accentHue2: number | null;
  /** Tile size on the grid, "<cols>x<rows>" with each 1-3 (e.g. "1x1", "2x2"). */
  size: string;
  /** Highlight glow intensity, 0 (none) to 3 (strongest, animated). */
  glow: number;
}

export interface Manifest {
  generatedAt: string;
  apps: ManifestApp[];
}
