import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import type { GenericRow, TableColumn } from "@/types/finance";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/shared/EmptyState";

export function DataTable<T extends GenericRow>({
  columns,
  rows,
  onDelete,
  canDelete,
  emptyTitle = "Belum ada data",
  emptyDescription = "Data akan muncul di sini setelah Anda menambahkannya.",
}: {
  columns: TableColumn<T>[];
  rows: T[];
  onDelete?: (row: T) => void;
  canDelete?: (row: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-secondary-100 dark:border-secondary-800">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center"
                )}
              >
                {col.header}
              </th>
            ))}
            {onDelete && <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary-400">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="group border-b border-secondary-50 transition-colors last:border-0 hover:bg-secondary-50/60 dark:border-secondary-800 dark:hover:bg-secondary-800/30"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn(
                    "px-5 py-3.5 text-secondary-700 dark:text-secondary-200",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.render ? col.render(row) : (row[col.key as string] as ReactNode)}
                </td>
              ))}
              {onDelete && (
                <td className="px-5 py-3.5 text-right">
                  {(!canDelete || canDelete(row)) && (
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded-lg p-1.5 text-secondary-300 opacity-0 transition-all hover:bg-danger-50 hover:text-danger-600 group-hover:opacity-100 dark:hover:bg-danger-500/10"
                      aria-label="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
