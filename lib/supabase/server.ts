import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client — uses the service role key, which bypasses row-level
 * security. This must only ever be imported from Route Handlers or Server
 * Components/Actions, never from client components. Because this project
 * has a single trusted user (you, via the passphrase-gated admin routes),
 * this is an acceptable simplification of a normally-stricter pattern.
 */
export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
