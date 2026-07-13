import { ArrowDownLeft, ArrowUpRight, Receipt, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { useTransactionsStore } from "@/store/transactionsStore";

const statusVariant = {
  success: "success",
  pending: "warning",
  failed: "danger",
} as const;

const statusLabel = {
  success: "Berhasil",
  pending: "Menunggu",
  failed: "Gagal",
};

export function RecentTransactions() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        {transactions.length > 0 && (
          <span className="text-xs font-medium text-secondary-400">{transactions.length} transaksi</span>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada transaksi"
            description="Transaksi yang Anda catat akan muncul di sini."
          />
        ) : (
          <div className="scrollbar-thin max-h-[380px] overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center gap-3 border-b border-secondary-50 px-5 py-3.5 last:border-0 transition-colors hover:bg-secondary-50/60 dark:border-secondary-800 dark:hover:bg-secondary-800/30"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: tx.avatarColor }}
                >
                  {tx.type === "income" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-secondary-900 dark:text-white">{tx.name}</p>
                  <p className="truncate text-xs text-secondary-400">
                    {tx.category} · {tx.method} · {tx.date}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      tx.type === "income" ? "text-success-600" : "text-danger-600"
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <Badge variant={statusVariant[tx.status]} className="text-[10px]">
                      {statusLabel[tx.status]}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="ml-1 shrink-0 rounded-lg p-1.5 text-secondary-300 opacity-0 transition-all hover:bg-danger-50 hover:text-danger-600 group-hover:opacity-100 dark:hover:bg-danger-500/10"
                  aria-label="Hapus transaksi"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
