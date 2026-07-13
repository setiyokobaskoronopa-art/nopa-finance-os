import { useNavigate } from "react-router-dom";
import { ArrowUpCircle, ArrowDownCircle, FileText, Target, Landmark, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useUIStore } from "@/store/uiStore";

export function QuickActionsCard() {
  const navigate = useNavigate();
  const openTransactionDialog = useUIStore((s) => s.openTransactionDialog);
  const openAccountDialog = useUIStore((s) => s.openAccountDialog);

  const actions = [
    {
      label: "Catat Pemasukan",
      icon: ArrowUpCircle,
      color: "text-success-600 bg-success-50 dark:bg-success-500/10",
      onClick: () => openTransactionDialog("income"),
    },
    {
      label: "Catat Pengeluaran",
      icon: ArrowDownCircle,
      color: "text-danger-600 bg-danger-50 dark:bg-danger-500/10",
      onClick: () => openTransactionDialog("expense"),
    },
    {
      label: "Tambah Rekening",
      icon: Landmark,
      color: "text-primary-600 bg-primary-50 dark:bg-primary-500/10",
      onClick: openAccountDialog,
    },
    {
      label: "Buat Laporan",
      icon: FileText,
      color: "text-secondary-600 bg-secondary-100 dark:bg-secondary-800 dark:text-secondary-300",
      onClick: () => navigate("/laporan"),
    },
    {
      label: "Set Target",
      icon: Target,
      color: "text-warning-600 bg-warning-50 dark:bg-warning-500/10",
      onClick: () => navigate("/target"),
    },
    {
      label: "Tambah Customer",
      icon: Users,
      color: "text-primary-600 bg-primary-50 dark:bg-primary-500/10",
      onClick: () => navigate("/customer"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Action</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
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
