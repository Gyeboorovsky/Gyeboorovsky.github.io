import type { SupabaseAppConfig } from '@portfolio/shared/supabase';

// Public Supabase project URL + anon (publishable) key for {{TITLE}} — safe
// to commit: access is enforced by Row Level Security, not by keeping this
// secret. Get both from your Supabase project's Settings → API page.
// NEVER put a service_role/secret key here or anywhere in this repo.
export const supabaseConfig: SupabaseAppConfig = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_ANON_PUBLIC_KEY',
};
