-- ============================================================================
-- Companion database schema
--
-- Architectural note: `memories` is intentionally a single polymorphic table
-- rather than one table per content type (story, photo, song, milestone...).
-- The `type` column discriminates the row, and `metadata` holds type-specific
-- fields. This means adding a brand-new kind of content later (e.g. "voice_note")
-- requires zero migrations — just a new `type` value and a matching Zod schema
-- in the app layer (see lib/validation/schemas.ts). It also means the whole
-- timeline/constellation can be fetched with one simple, always-sorted query.
-- ============================================================================

create extension if not exists "uuid-ossp";

create type memory_type as enum (
  'story',        -- a written memory / anecdote
  'milestone',     -- a relationship milestone (anniversary, first date, etc.)
  'inside_joke',   -- a private joke, with context
  'song',          -- a meaningful song
  'future_plan',   -- something planned for the future
  'photo',         -- a photo memory
  'voice_note',    -- an audio recording
  'video'          -- a video memory
);

create table memories (
  id uuid primary key default uuid_generate_v4(),
  type memory_type not null,

  -- Common fields shared by every memory type
  title text not null,
  description text,               -- free-text body: the story itself, joke context, etc.
  occurred_on date,                -- when the memory happened (nullable — not everything has a date)
  is_favorite boolean not null default false,
  tags text[] not null default '{}',

  -- Media, when the memory has an associated file (photo/voice/video)
  media_url text,
  media_thumbnail_url text,

  -- Type-specific data that doesn't warrant its own column, e.g.
  -- { "artist": "...", "spotify_url": "..." } for a song, or
  -- { "location": "...", "milestone_kind": "first_date" } for a milestone.
  metadata jsonb not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index memories_type_idx on memories (type);
create index memories_occurred_on_idx on memories (occurred_on);
create index memories_tags_idx on memories using gin (tags);

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger memories_set_updated_at
  before update on memories
  for each row
  execute function set_updated_at();

-- ============================================================================
-- Chat history — so the companion can reference recent conversation on
-- return visits, and so you can review what's been discussed.
-- ============================================================================
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_created_at_idx on chat_messages (created_at);

-- ============================================================================
-- Companion profile — the single row describing the personality itself
-- (name it presents as, tone notes, etc.) Kept separate from memories
-- because it's configuration, not content.
-- ============================================================================
create table companion_profile (
  id int primary key default 1,
  companion_name text not null default 'Companion',
  built_for_name text,             -- her name
  built_from_name text,            -- your name
  tone_notes text,                 -- free text describing communication style
  constraint singleton check (id = 1)
);

insert into companion_profile (id) values (1) on conflict (id) do nothing;
