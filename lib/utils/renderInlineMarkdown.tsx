import { Fragment } from "react";

/**
 * Renders a small, deliberately limited subset of markdown (bold, italic)
 * as a safety net in case the model still emits it despite being told not
 * to. A full markdown library would be overkill for chat bubbles that
 * should just read as plain text with occasional light emphasis.
 */
export function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
