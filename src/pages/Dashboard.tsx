import { useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CashFlowChart } from "@/components/dashboard/charts/CashFlowChart";
import { ProfitChart } from "@/components/dashboard/charts/ProfitChart";
import { ExpenseCategoryChart } from "@/components/dashboard/charts/ExpenseCategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { BudgetProgressCard } from "@/components/dashboard/BudgetProgressCard";
import { TopCategoriesCard } from "@/components/dashboard/TopCategoriesCard";
import { BankBalanceCard } from "@/components/dashboard/BankBalanceCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { dashboardKpis } from "@/data/dummy";
import { useTransactionsStore, selectTotals } from "@/store/transactionsStore";
import { useAccountsStore } from "@/store/accountsStore";
import { useGoalsStore } from "@/store/goalsStore";
import { useUIStore } from "@/store/uiStore";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { computeLabaBersihBisnis, AUTO_LINKED_GOAL_ID } from "@/utils/businessCalc";
import { formatCurrency } from "@/utils/format";
import type { KpiDatum } from "@/types/finance";

export default function Dashboard() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const accounts = useAccountsStore((s) => s.accounts);
  const goals = useGoalsStore((s) => s.goals);
  const salesOrders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const openTransactionDialog = useUIStore((s) => s.openTransactionDialog);

  const kpis = useMemo<KpiDatum[]>(() => {
    const { income, expense, cashFlow } = selectTotals(transactions);
    const saldoTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
    const mainGoal = goals[0];
    const labaBersih = computeLabaBersihBisnis(salesOrders, mutations);
    const goalCollected = mainGoal?.id === AUTO_LINKED_GOAL_ID ? Math.max(0, labaBersih) : mainGoal?.collected ?? 0;
    const goalPct = mainGoal && mainGoal.target > 0 ? Math.round((goalCollected / mainGoal.target) * 100) : 0;

    return dashboardKpis.map((kpi) => {
      switch (kpi.id) {
        case "saldo-total":
          return { ...kpi, value: formatCurrency(saldoTotal), footnote: `${accounts.length} rekening aktif` };
        case "cash-flow":
          return { ...kpi, value: formatCurrency(cashFlow), footnote: "Pemasukan dikurangi pengeluaran" };
        case "pemasukan":
          return { ...kpi, value: formatCurrency(income), footnote: `${transactions.filter((t) => t.type === "income").length} transaksi masuk` };
        case "pengeluaran":
          return { ...kpi, value: formatCurrency(expense), footnote: `${transactions.filter((t) => t.type === "expense").length} transaksi keluar` };
        case "target-pernikahan":
          return {
            ...kpi,
            label: mainGoal ? mainGoal.name : "Target 100 Juta Pertama",
            value: `${goalPct}%`,
            footnote: mainGoal ? `${formatCurrency(goalCollected, { compact: true })} / ${formatCurrency(mainGoal.target, { compact: true })}` : "Belum diatur",
          };
        default:
          return kpi;
      }
    });
  }, [transactions, accounts, goals, salesOrders, mutations]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan keuangan pribadi dan bisnis Anda hari ini."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download size={15} /> Export
            </Button>
            <Button size="sm" onClick={() => openTransactionDialog("income")}>
              <Plus size={15} /> Transaksi Baru
            </Button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowChart />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseCategoryChart />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Profit Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitChart />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <QuickActionsCard />
        </motion.div>
      </div>

      {/* Widgets grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <RecentTransactions />
        <RecentActivity />
        <div className="space-y-4 lg:col-span-2 xl:col-span-1">
          <BudgetProgressCard />
          <TopCategoriesCard />
        </div>
      </div>

      <div className="mt-6">
        <BankBalanceCard />
      </div>
    </div>
  );
}
