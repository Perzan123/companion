"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { Card } from "@/components/ui/Card";

export function ChatWindow() {
  const { messages, isLoadingHistory, isSending, error, sendMessage } = useChat();
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <Card className="flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {isLoadingHistory ? (
          <p className="text-center text-sm text-text-muted">Loading your conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-text-muted">
            Say hello — this is the start of something.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isSending && <TypingIndicator />}
        {error && (
          <p role="alert" className="text-center text-sm text-accent-rose">
            {error}
          </p>
        )}
        <div ref={scrollAnchorRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={isSending || isLoadingHistory} />
    </Card>
  );
}
