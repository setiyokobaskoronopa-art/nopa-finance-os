import type { ComponentType, ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title = "Belum ada data",
  description = "Data akan muncul di sini setelah Anda mulai mencatat transaksi.",
  action,
  compact = false,
}: {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center py-8 text-center"
          : "flex flex-col items-center justify-center py-14 text-center"
      }
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-400 dark:bg-secondary-800 dark:text-secondary-500">
        <Icon size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-secondary-700 dark:text-secondary-200">{title}</p>
      <p className="mt-1 max-w-[220px] text-xs text-secondary-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
