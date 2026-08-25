"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types/memory";

interface UseChatResult {
  messages: ChatMessage[];
  isLoadingHistory: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
}

function tempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedHistory = useRef(false);

  useEffect(() => {
    if (hasLoadedHistory.current) return;
    hasLoadedHistory.current = true;

    (async () => {
      try {
        const response = await fetch("/api/chat");
        if (!response.ok) throw new Error("Failed to load history");
        const data = await response.json();
        setMessages(data.history ?? []);
      } catch {
        // Non-fatal: a fresh conversation is a fine fallback if history fails to load
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);

    const optimisticUserMessage: ChatMessage = {
      id: tempId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      let data: { reply?: string; error?: string };
      try {
        data = await response.json();
      } catch {
        // The platform (not our route handler) returned a non-JSON error page —
        // most often a timeout. Give a clear, honest message instead of a parse error.
        throw new Error(
          "The companion took too long to respond. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      if (!data.reply) {
        throw new Error("The companion didn't send a reply. Please try again.");
      }

      const assistantMessage: ChatMessage = {
        id: tempId(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong reaching the companion."
      );
    } finally {
      setIsSending(false);
    }
  }, []);

  return { messages, isLoadingHistory, isSending, error, sendMessage };
}
