import React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl px-4 py-3 text-sm",
          "backdrop-blur-md bg-glass-bg/60 border border-glass-border",
          "shadow-glass transition-all duration-300",
          "placeholder:text-muted/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50",
          "focus-visible:bg-glass-hover-bg focus-visible:shadow-glass-lg",
          "hover:border-glass-hover-border hover:bg-glass-hover-bg/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
