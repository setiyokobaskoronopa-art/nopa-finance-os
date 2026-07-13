import type { GenericRow, TableColumn } from "@/types/finance";
import { cn } from "@/utils/cn";

export function DataTable<T extends GenericRow>({
  columns,
  rows,
}: {
  columns: TableColumn<T>[];
  rows: T[];
}) {
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
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-secondary-50 transition-colors last:border-0 hover:bg-secondary-50/60 dark:border-secondary-800 dark:hover:bg-secondary-800/30"
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
                  {col.render ? col.render(row) : row[col.key as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
