"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ClearChatHistory() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleClear() {
    setIsClearing(true);
    setStatus(null);

    try {
      const response = await fetch("/api/chat", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setStatus("Chat history cleared — she'll open to a fresh conversation.");
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setIsClearing(false);
      setIsConfirming(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="space-y-2 rounded-lg border border-accent-rose/40 bg-accent-rose/10 p-4">
        <p className="text-sm text-text-primary">
          This permanently deletes every message in the conversation so far. Are you sure?
        </p>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleClear} isLoading={isClearing}>
            Yes, clear it
          </Button>
          <Button variant="ghost" onClick={() => setIsConfirming(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant="ghost" onClick={() => setIsConfirming(true)}>
        Clear chat history
      </Button>
      {status && <p className="text-sm text-text-muted">{status}</p>}
    </div>
  );
}
