import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-faint",
        "focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent",
        "transition-shadow duration-200",
        className
      )}
      {...props}
    />
  );
});

TextInput.displayName = "TextInput";
