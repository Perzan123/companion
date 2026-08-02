"use client";

import { useMemories } from "@/hooks/useMemories";
import { MemoryForm } from "@/components/admin/MemoryForm";
import { MemoryList } from "@/components/admin/MemoryList";
import { Card } from "@/components/ui/Card";

export default function AdminPage() {
  const { memories, isLoading, error, createMemory, deleteMemory } = useMemories();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Private
        </p>
        <h1 className="mt-2 font-display text-3xl italic text-text-primary">
          Add a memory
        </h1>
      </div>

      <Card className="p-6">
        <MemoryForm onSubmit={createMemory} />
      </Card>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl text-text-primary">
          Everything so far ({memories.length})
        </h2>
        {error && <p className="mb-4 text-sm text-accent-rose">{error}</p>}
        <MemoryList memories={memories} isLoading={isLoading} onDelete={deleteMemory} />
      </div>
    </main>
  );
}
