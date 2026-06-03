import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = ({ className, glass = true, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-3xl",
        glass
          ? "backdrop-blur-2xl bg-white/75 border border-slate-200 shadow-lg shadow-slate-900/5"
          : "bg-white border border-slate-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pb-0", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);
