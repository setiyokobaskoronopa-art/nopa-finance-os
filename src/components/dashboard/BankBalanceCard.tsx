import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/format";
import { bankAccounts } from "@/data/dummy";

export function BankBalanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo Rekening</CardTitle>
        <button className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
          Kelola
        </button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            className="relative overflow-hidden rounded-2xl p-4 text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${acc.color}, ${acc.color}CC)` }}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold backdrop-blur">
                {acc.logoInitial}
              </span>
              <span className="text-xs font-medium opacity-80">{acc.accountNumber}</span>
            </div>
            <p className="mt-4 text-lg font-bold tracking-tight">{formatCurrency(acc.balance)}</p>
            <p className="mt-0.5 truncate text-[11px] opacity-80">{acc.accountName}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
