import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "secondary"
    | "glass"
    | "outline-glass";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "relative overflow-hidden",
          {
            // Primary variant with glass effect
            "bg-primary text-white shadow-glass-lg hover:shadow-glass-xl hover:scale-[1.02] hover:bg-primary-dark active:scale-[0.98]":
              variant === "default",

            // Glass variant - Frosted glass with backdrop blur
            "glass glass-hover text-foreground shadow-glass": variant === "glass",

            // Outline glass variant
            "border-2 border-primary/30 text-primary backdrop-blur-md bg-glass-bg/50 hover:bg-glass-hover-bg hover:border-primary/50 shadow-glass":
              variant === "outline-glass",

            // Standard outline
            "border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-glass":
              variant === "outline",

            // Ghost variant with subtle glass
            "hover:glass hover:shadow-glass text-foreground": variant === "ghost",

            // Destructive with glass effect
            "bg-error text-white shadow-glass-lg hover:shadow-glass-xl hover:scale-[1.02] active:scale-[0.98]":
              variant === "destructive",

            // Secondary with glass
            "bg-secondary text-white shadow-glass-lg hover:shadow-glass-xl hover:scale-[1.02] hover:bg-secondary-dark active:scale-[0.98]":
              variant === "secondary",
          },
          {
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-9 px-3 text-xs": size === "sm",
            "h-11 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
