"use client";

import { useState } from "react";
import Image from "next/image";
import type { Memory } from "@/lib/types/memory";
import { Card } from "@/components/ui/Card";

const TYPE_LABELS: Record<Memory["type"], string> = {
  story: "Story",
  milestone: "Milestone",
  inside_joke: "Inside joke",
  catch_phrase: "Catch phrase",
  song: "Song",
  future_plan: "Future plan",
  photo: "Photo",
  voice_note: "Voice recording",
  video: "Video",
};

interface MemoryListProps {
  memories: Memory[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function MemoryList({ memories, isLoading, onDelete }: MemoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading memories…</p>;
  }

  if (memories.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Nothing added yet — the form above is where it all starts.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <Card key={memory.id} className="flex items-start gap-4 p-4">
          {memory.type === "photo" && memory.mediaUrl && (
            <Image
              src={memory.mediaUrl}
              alt={memory.title}
              width={64}
              height={64}
              className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
              unoptimized
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wide text-accent-gold">
                {TYPE_LABELS[memory.type]}
              </span>
              {memory.occurredOn && (
                <span className="font-mono text-xs text-text-muted">{memory.occurredOn}</span>
              )}
            </div>
            <h3 className="mt-1 truncate font-display text-lg text-text-primary">
              {memory.title}
            </h3>
            {memory.description && (
              <p className="mt-1 line-clamp-2 text-sm text-text-muted">{memory.description}</p>
            )}
          </div>
          <button
            onClick={() => handleDelete(memory.id)}
            disabled={deletingId === memory.id}
            className="flex-shrink-0 text-sm text-text-faint transition-colors hover:text-accent-rose disabled:opacity-50"
          >
            {deletingId === memory.id ? "…" : "Delete"}
          </button>
        </Card>
      ))}
    </div>
  );
}
