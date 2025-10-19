import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline" | "glass";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          "transition-all duration-200 shadow-glass",
          {
            "bg-primary text-white hover:bg-primary-dark": variant === "default",
            "bg-success text-white hover:brightness-110": variant === "success",
            "bg-warning text-white hover:brightness-110": variant === "warning",
            "bg-error text-white hover:brightness-110": variant === "error",
            "bg-info text-white hover:brightness-110": variant === "info",
            "border border-glass-border backdrop-blur-md bg-glass-bg/50 text-foreground":
              variant === "outline",
            "glass text-foreground": variant === "glass",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
