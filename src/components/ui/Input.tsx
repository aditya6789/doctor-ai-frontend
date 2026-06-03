import { cn } from "@/lib/utils";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-600 px-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder:text-slate-400",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
