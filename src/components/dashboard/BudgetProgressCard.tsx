import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/format";
import { budgetProgress } from "@/data/dummy";

export function BudgetProgressCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgetProgress.length === 0 ? (
          <EmptyState
            icon={Icons.CreditCard}
            title="Belum ada budget"
            description="Buat alokasi budget untuk mulai memantau pengeluaran."
            compact
          />
        ) : (
        budgetProgress.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Circle;
          const isHigh = pct >= 80;
          return (
            <div key={b.id}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: b.color }}
                  >
                    <Icon size={13} />
                  </span>
                  <p className="text-sm font-medium text-secondary-800 dark:text-secondary-100">{b.category}</p>
                </div>
                <p className="text-xs font-semibold text-secondary-400">{pct}%</p>
              </div>
              <Progress
                value={pct}
                indicatorClassName={isHigh ? "bg-danger-500" : undefined}
              />
              <p className="mt-1.5 text-[11px] text-secondary-400">
                {formatCurrency(b.spent, { compact: true })} dari {formatCurrency(b.limit, { compact: true })}
              </p>
            </div>
          );
        })
        )}
      </CardContent>
    </Card>
  );
}
