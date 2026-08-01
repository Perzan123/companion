-- Enable Row Level Security on every table, with no policies defined.
-- This means: the anon/public key can do nothing. Only the service_role key
-- (used exclusively in server-side Route Handlers, never shipped to the
-- browser) can read or write. If a future feature needs the browser to talk
-- to Supabase directly, add a narrow, specific policy then — don't loosen
-- this by default.

alter table memories enable row level security;
alter table chat_messages enable row level security;
alter table companion_profile enable row level security;
