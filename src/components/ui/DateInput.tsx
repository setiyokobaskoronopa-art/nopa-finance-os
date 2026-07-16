import * as React from "react";
import { cn } from "@/utils/cn";
import { dateSlashToISO, isoToDateSlash } from "@/utils/format";

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string; // format dd/mm/yyyy
  onChange: (dateSlash: string) => void;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(({ value, onChange, className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="date"
      value={dateSlashToISO(value)}
      onChange={(e) => {
        if (e.target.value) onChange(isoToDateSlash(e.target.value));
      }}
      className={cn(
        "flex h-10 w-full rounded-xl border border-secondary-200 bg-white px-3.5 py-2 text-sm text-secondary-900 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-700 dark:bg-secondary-800/60 dark:text-white dark:[color-scheme:dark] dark:focus:ring-primary-500/20",
        className
      )}
      {...props}
    />
  );
});
DateInput.displayName = "DateInput";

export { DateInput };
