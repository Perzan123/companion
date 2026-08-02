"use client";

import { useCallback, useEffect, useState } from "react";
import type { Memory } from "@/lib/types/memory";

interface UseMemoriesResult {
  memories: Memory[];
  isLoading: boolean;
  error: string | null;
  createMemory: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteMemory: (id: string) => Promise<void>;
}

export function useMemories(): UseMemoriesResult {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/memories");
        if (!response.ok) throw new Error("Failed to load memories");
        const data = await response.json();
        if (!cancelled) {
          setMemories(data.memories ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Couldn't load memories.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const createMemory = useCallback(
    async (formData: FormData) => {
      try {
        const response = await fetch("/api/memories", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error ?? "Something went wrong." };
        }

        setMemories((prev) => [data.memory, ...prev]);
        return { success: true };
      } catch {
        return { success: false, error: "Something went wrong." };
      }
    },
    []
  );

  const deleteMemory = useCallback(async (id: string) => {
    const previous = memories;
    setMemories((prev) => prev.filter((m) => m.id !== id));

    const response = await fetch(`/api/memories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMemories(previous); // revert on failure
    }
  }, [memories]);

  return { memories, isLoading, error, createMemory, deleteMemory };
}
