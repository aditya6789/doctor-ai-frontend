import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]",
      secondary: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]",
      outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
      ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-900",
      danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
      icon: "w-10 h-10 rounded-full flex items-center justify-center p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
