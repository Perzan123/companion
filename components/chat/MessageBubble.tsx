import clsx from "clsx";
import type { ChatMessage } from "@/lib/types/memory";
import { renderInlineMarkdown } from "@/lib/utils/renderInlineMarkdown";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isUser
            ? "bg-accent-gold text-background rounded-br-sm"
            : "bg-surface border border-border text-text-primary rounded-bl-sm"
        )}
      >
        {renderInlineMarkdown(message.content)}
      </div>
    </div>
  );
}
