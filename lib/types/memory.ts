/**
 * Memory types.
 *
 * `Memory` is a discriminated union keyed on `type`. Each variant's `metadata`
 * is fully typed here even though it's stored as JSONB in Postgres — this is
 * the "safety" half of the polymorphic-table trade-off described in
 * supabase/schema.sql. Adding a new memory type means: add the literal to
 * MemoryType, add a variant below, add a matching Zod schema in
 * lib/validation/schemas.ts. No other file needs to change.
 */

export type MemoryType =
  | "story"
  | "milestone"
  | "inside_joke"
  | "catch_phrase"
  | "song"
  | "future_plan"
  | "photo"
  | "voice_note"
  | "video";

interface MemoryBase {
  id: string;
  title: string;
  description: string | null;
  occurredOn: string | null; // ISO date string, e.g. "2024-06-12"
  isFavorite: boolean;
  tags: string[];
  mediaUrl: string | null;
  mediaThumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryMemory extends MemoryBase {
  type: "story";
  metadata: Record<string, never>;
}

export interface MilestoneMemory extends MemoryBase {
  type: "milestone";
  metadata: {
    milestoneKind?: "first_date" | "anniversary" | "moved_in" | "other";
  };
}

export interface InsideJokeMemory extends MemoryBase {
  type: "inside_joke";
  metadata: Record<string, never>;
}

export interface CatchPhraseMemory extends MemoryBase {
  type: "catch_phrase";
  metadata: Record<string, never>;
}

export interface SongMemory extends MemoryBase {
  type: "song";
  metadata: {
    artist?: string;
    spotifyUrl?: string;
  };
}

export interface FuturePlanMemory extends MemoryBase {
  type: "future_plan";
  metadata: {
    targetDate?: string;
  };
}

export interface PhotoMemory extends MemoryBase {
  type: "photo";
  metadata: {
    location?: string;
  };
}

export interface VoiceNoteMemory extends MemoryBase {
  type: "voice_note";
  metadata: {
    durationSeconds?: number;
  };
}

export interface VideoMemory extends MemoryBase {
  type: "video";
  metadata: {
    durationSeconds?: number;
  };
}

export type Memory =
  | StoryMemory
  | MilestoneMemory
  | InsideJokeMemory
  | CatchPhraseMemory
  | SongMemory
  | FuturePlanMemory
  | PhotoMemory
  | VoiceNoteMemory
  | VideoMemory;

export interface CompanionProfile {
  companionName: string;
  builtForName: string | null;
  builtFromName: string | null;
  toneNotes: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
