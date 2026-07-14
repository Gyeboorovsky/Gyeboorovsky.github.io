import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseAppConfig {
  url: string;
  /** The PUBLIC anon key — safe to commit. All data access must be guarded by RLS. */
  anonKey: string;
}

/**
 * Browser-only Supabase client for GitHub Pages apps.
 * Everything shipped to Pages is public: never use a service_role key here.
 * Apps commit their own src/supabase-config.ts with { url, anonKey }.
 */
export function createAppClient(config: SupabaseAppConfig): SupabaseClient {
  return createClient(config.url, config.anonKey);
}
