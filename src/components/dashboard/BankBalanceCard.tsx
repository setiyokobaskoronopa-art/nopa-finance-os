import { Landmark, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/format";
import { useAccountsStore } from "@/store/accountsStore";
import { useUIStore } from "@/store/uiStore";

export function BankBalanceCard() {
  const accounts = useAccountsStore((s) => s.accounts);
  const deleteAccount = useAccountsStore((s) => s.deleteAccount);
  const openAccountDialog = useUIStore((s) => s.openAccountDialog);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo Rekening</CardTitle>
        <Button variant="ghost" size="sm" onClick={openAccountDialog}>
          <Plus size={14} /> Tambah
        </Button>
      </CardHeader>
      <CardContent className={accounts.length === 0 ? "" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
        {accounts.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="Belum ada rekening"
            description="Tambahkan rekening bank untuk mulai memantau saldo."
            action={
              <Button size="sm" onClick={openAccountDialog}>
                <Plus size={14} /> Tambah Rekening
              </Button>
            }
          />
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="group relative overflow-hidden rounded-2xl p-4 text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${acc.color}, ${acc.color}CC)` }}
            >
              <button
                onClick={() => deleteAccount(acc.id)}
                className="absolute right-2 top-2 rounded-lg bg-white/10 p-1 opacity-0 backdrop-blur transition-opacity hover:bg-white/25 group-hover:opacity-100"
                aria-label="Hapus rekening"
              >
                <X size={13} />
              </button>
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold backdrop-blur">
                  {acc.logoInitial}
                </span>
                <span className="text-xs font-medium opacity-80">{acc.accountNumber}</span>
              </div>
              <p className="mt-4 text-lg font-bold tracking-tight">{formatCurrency(acc.balance)}</p>
              <p className="mt-0.5 truncate text-[11px] opacity-80">{acc.accountName}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
