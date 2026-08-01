import type { Memory } from "@/lib/types/memory";

/**
 * Raw shape of a row in the `memories` table (snake_case, as Postgres returns it).
 * Kept private to this file — nothing outside the data layer should deal with
 * snake_case field names.
 */
interface MemoryRow {
  id: string;
  type: Memory["type"];
  title: string;
  description: string | null;
  occurred_on: string | null;
  is_favorite: boolean;
  tags: string[];
  media_url: string | null;
  media_thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function mapRowToMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    occurredOn: row.occurred_on,
    isFavorite: row.is_favorite,
    tags: row.tags,
    mediaUrl: row.media_url,
    mediaThumbnailUrl: row.media_thumbnail_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Safe by construction: `type` narrows metadata's shape at the call site,
    // and every row's metadata was validated against the matching Zod schema
    // before it was ever written.
    metadata: row.metadata,
  } as Memory;
}

export function mapMemoryToRow(memory: {
  type: Memory["type"];
  title: string;
  description?: string;
  occurredOn?: string;
  isFavorite?: boolean;
  tags?: string[];
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return {
    type: memory.type,
    title: memory.title,
    description: memory.description ?? null,
    occurred_on: memory.occurredOn ?? null,
    is_favorite: memory.isFavorite ?? false,
    tags: memory.tags ?? [],
    media_url: memory.mediaUrl ?? null,
    media_thumbnail_url: memory.mediaThumbnailUrl ?? null,
    metadata: memory.metadata ?? {},
  };
}
