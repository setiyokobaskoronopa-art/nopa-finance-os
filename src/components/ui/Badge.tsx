import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
        success:
          "border-transparent bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success",
        danger:
          "border-transparent bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger",
        warning:
          "border-transparent bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning",
        secondary:
          "border-transparent bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-300",
        outline: "border-secondary-200 text-secondary-600 dark:border-secondary-700 dark:text-secondary-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
