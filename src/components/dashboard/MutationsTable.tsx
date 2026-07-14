import { Trash2, Receipt } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { EmptyState } from "@/components/shared/EmptyState";
import type { BusinessMutation } from "@/store/businessMutationsStore";

const CATEGORIES = ["Ads", "Biaya Lainnya", "Prive", "Return"] as const;

export function MutationsTable({
  rows,
  onDelete,
}: {
  rows: BusinessMutation[];
  onDelete: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Belum ada mutasi"
        description="Tambahkan mutasi bisnis (Ads, Biaya Lainnya, Prive, Return) untuk mulai mencatat."
      />
    );
  }

  const totals = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = rows.filter((r) => r.kategori === cat).reduce((s, r) => s + r.jumlah, 0);
    return acc;
  }, {});

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-secondary-100 dark:border-secondary-800">
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">No</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Tanggal</th>
            {CATEGORIES.map((c) => (
              <th
                key={c}
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary-400"
              >
                {c}
              </th>
            ))}
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Keterangan</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={r.id}
              className="group border-b border-secondary-50 transition-colors last:border-0 hover:bg-secondary-50/60 dark:border-secondary-800 dark:hover:bg-secondary-800/30"
            >
              <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{idx + 1}</td>
              <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{r.tanggal}</td>
              {CATEGORIES.map((c) => (
                <td key={c} className="px-5 py-3.5 text-right text-secondary-700 dark:text-secondary-200">
                  {r.kategori === c ? formatCurrency(r.jumlah) : <span className="text-secondary-300">-</span>}
                </td>
              ))}
              <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{r.keterangan || "-"}</td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => onDelete(r.id)}
                  className="rounded-lg p-1.5 text-secondary-300 opacity-0 transition-all hover:bg-danger-50 hover:text-danger-600 group-hover:opacity-100 dark:hover:bg-danger-500/10"
                  aria-label="Hapus mutasi"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-secondary-200 bg-secondary-50/70 font-semibold dark:border-secondary-700 dark:bg-secondary-800/50">
            <td className="px-5 py-3.5 text-secondary-900 dark:text-white" colSpan={2}>
              Total
            </td>
            {CATEGORIES.map((c) => (
              <td key={c} className="px-5 py-3.5 text-right text-secondary-900 dark:text-white">
                {formatCurrency(totals[c])}
              </td>
            ))}
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
