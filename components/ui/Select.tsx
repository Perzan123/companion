import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={clsx(
        "w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary",
        "focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent",
        "transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
