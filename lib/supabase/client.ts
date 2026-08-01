import { createClient } from "@supabase/supabase-js";

/**
 * Browser client — uses the public anon key only. Never import the service
 * role key here. Row-level security policies (set up in Supabase) are what
 * actually protect data; this client is safe to ship to the client bundle.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anonKey);
}
