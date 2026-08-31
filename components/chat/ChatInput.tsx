"use client";

import { KeyboardEvent, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-3 border-t border-border p-4">
      <div
        className={clsx(
          "flex-1 rounded-lg transition-shadow duration-300",
          isFocused && "shadow-[0_0_0_1px_rgba(232,184,109,0.4),0_0_16px_rgba(232,184,109,0.15)]"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Say anything…"
          rows={1}
          aria-label="Message"
          className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-faint focus:outline-none disabled:opacity-50"
        />
      </div>
      <Button onClick={handleSend} disabled={disabled || !value.trim()}>
        Send
      </Button>
    </div>
  );
}
