import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border border-secondary-200 bg-white px-3.5 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-700 dark:bg-secondary-800/60 dark:text-white dark:placeholder:text-secondary-500 dark:focus:ring-primary-500/20",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
