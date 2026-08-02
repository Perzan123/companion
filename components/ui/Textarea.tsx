import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-faint",
        "focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent",
        "transition-shadow duration-200",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
