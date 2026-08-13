export type AppStatus = 'live' | 'wip' | 'archived';
export type AppKind = 'external';
/** The three printed vinyl colours. Every coloured thing is one of these. */
export type Paint = 'red' | 'teal' | 'amber';
export type Lang = 'en' | 'pl';

/** Content overrides for a non-English printing. Proper names are never
 * overridden here — only the fields a translator would actually touch. */
export interface AppI18n {
  title?: string;
  description?: string;
  stat?: string;
}

export interface ManifestApp {
  slug: string;
  kind: AppKind;
  title: string;
  description: string;
  /** One short factual line, drawn from the app's own description. */
  stat: string | null;
  /** Tile link target: demoUrl ?? repoUrl. Null for password-gated offers. */
  url: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  status: AppStatus;
  added: string;
  year: number;
  role: string | null;
  /** Absolute site path to the cover image (the grid thumbnail), or null. */
  screenshot: string | null;
  /**
   * Password-gated client offer: the tile shows its cover and title, but the
   * target lives at /offers/<sha256(slug:password)>/ and is only reachable by
   * someone who knows the password. No secret ships in the bundle.
   */
  gated: boolean;
  /** Which of the three vinyl colours this panel is printed in. */
  paint: Paint;
  /** Tile size on the grid, "<cols>x<rows>" with each 1-3 (e.g. "1x1", "2x2"). */
  size: string;
  /** Curator emphasis, 0-3. Reserved for future use by the presentation layer. */
  weight: number;
  /** Per-printing content overrides, keyed by language. English (the fields
   * above) is the base language; a missing key falls back to it. */
  i18n?: Partial<Record<Lang, AppI18n>>;
}

/** UI chrome strings for a non-English printing. A missing key falls back to
 * the hardcoded English string. */
export interface UiI18n {
  pageTitle?: string;
  pageDescription?: string;
  tagline?: string;
  themeButton?: string;
  themeAria?: string;
  langButton?: string;
  langAria?: string;
  tabs?: Record<string, string>;
  empty?: string;
  footer?: string;
  wip?: string;
  retired?: string;
  sealed?: string;
  passwordAria?: string;
  gateError?: string;
}

export interface Manifest {
  generatedAt: string;
  apps: ManifestApp[];
  i18n?: Partial<Record<Lang, { ui: UiI18n; apps: Record<string, AppI18n> }>>;
}
