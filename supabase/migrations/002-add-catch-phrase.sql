-- Adds the new "Catch phrase" memory type introduced after the initial schema.
-- Postgres requires enum values to be added explicitly, and this must run
-- outside of a transaction block with other statements (Supabase's SQL
-- editor runs each query as its own statement, so this is safe to run alone).

alter type memory_type add value if not exists 'catch_phrase';
