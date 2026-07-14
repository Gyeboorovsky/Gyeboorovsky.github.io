import { createAppClient } from '@portfolio/shared/supabase';
import { supabaseConfig } from './supabase-config';

// Example round-trip. Replace '{{SLUG_SNAKE}}_example' with a real table once
// you've created one (with RLS enabled!) in the Supabase dashboard, then
// call this from your UI. If this app shares a Supabase project with other
// apps, keep the "{{SLUG_SNAKE}}_" table prefix to avoid collisions (table
// names can't contain '-', hence the underscore form of the slug).
const supabase = createAppClient(supabaseConfig);

export async function fetchExample() {
  const { data, error } = await supabase.from('{{SLUG_SNAKE}}_example').select('*').limit(10);
  if (error) {
    console.error('Supabase query failed:', error.message);
    return [];
  }
  return data;
}
