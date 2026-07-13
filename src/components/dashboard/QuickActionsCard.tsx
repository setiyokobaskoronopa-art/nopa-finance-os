import { ArrowUpCircle, ArrowDownCircle, FileText, Target, Receipt, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

const actions = [
  { label: "Catat Pemasukan", icon: ArrowUpCircle, color: "text-success-600 bg-success-50 dark:bg-success-500/10" },
  { label: "Catat Pengeluaran", icon: ArrowDownCircle, color: "text-danger-600 bg-danger-50 dark:bg-danger-500/10" },
  { label: "Buat Invoice", icon: Receipt, color: "text-primary-600 bg-primary-50 dark:bg-primary-500/10" },
  { label: "Buat Laporan", icon: FileText, color: "text-secondary-600 bg-secondary-100 dark:bg-secondary-800 dark:text-secondary-300" },
  { label: "Set Target", icon: Target, color: "text-warning-600 bg-warning-50 dark:bg-warning-500/10" },
  { label: "Tambah Customer", icon: Users, color: "text-primary-600 bg-primary-50 dark:bg-primary-500/10" },
];

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Action</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.label}
            className="flex flex-col items-center gap-2 rounded-2xl border border-secondary-100 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft dark:border-secondary-800 dark:hover:border-primary-500/30"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.color}`}>
              <a.icon size={18} />
            </span>
            <span className="text-xs font-medium leading-tight text-secondary-700 dark:text-secondary-200">
              {a.label}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
