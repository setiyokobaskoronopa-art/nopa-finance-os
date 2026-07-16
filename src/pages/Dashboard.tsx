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
import { useSalesStore, useInvestmentStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { computeLabaBersihBisnis, computeTotalProfit, isInCurrentMonth, getEffectiveGrossProvit } from "@/utils/businessCalc";
import { formatCurrency } from "@/utils/format";
import type { KpiDatum } from "@/types/finance";

export default function Dashboard() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const accounts = useAccountsStore((s) => s.accounts);
  const goals = useGoalsStore((s) => s.goals);
  const salesOrders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const investments = useInvestmentStore((s) => s.items);
  const openTransactionDialog = useUIStore((s) => s.openTransactionDialog);

  const kpis = useMemo<KpiDatum[]>(() => {
    const { income: manualIncome, expense: manualExpense } = selectTotals(transactions);

    // --- Data bulan berjalan (di-reset otomatis tiap ganti bulan) ---
    const ordersThisMonth = salesOrders.filter((o) => isInCurrentMonth(o.tanggal));
    const mutationsThisMonth = mutations.filter((m) => isInCurrentMonth(m.tanggal));
    const transactionsThisMonth = transactions.filter((t) => isInCurrentMonth(t.date));
    const manualIncomeThisMonth = transactionsThisMonth
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const manualExpenseThisMonth = transactionsThisMonth
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Saldo Total: akumulasi SEMUA WAKTU (setiap bulan yang sudah lewat otomatis "nutup buku" dan masuk sini)
    const manualNetAllTime = manualIncome - manualExpense;
    const labaBersihBisnisAllTime = computeLabaBersihBisnis(salesOrders, mutations);
    const saldoTotal = accounts.reduce((sum, a) => sum + a.balance, 0) + manualNetAllTime + labaBersihBisnisAllTime;

    // Profit Bulanan: cuma bulan berjalan, otomatis dari awal lagi tiap ganti bulan
    const labaBersihBisnisBulanIni = computeLabaBersihBisnis(ordersThisMonth, mutationsThisMonth);
    const profitBulanan = labaBersihBisnisBulanIni + (manualIncomeThisMonth - manualExpenseThisMonth);

    // Cash Flow: Gross Provit bulan berjalan
    const cashFlow = ordersThisMonth.reduce((sum, o) => sum + getEffectiveGrossProvit(o), 0);

    // Pengeluaran: Mutasi Ads + Biaya Lainnya + Prive + Return bulan berjalan
    const PENGELUARAN_KATEGORI = ["Ads", "Biaya Lainnya", "Prive", "Return"];
    const pengeluaran = mutationsThisMonth
      .filter((m) => PENGELUARAN_KATEGORI.includes(m.kategori))
      .reduce((sum, m) => sum + m.jumlah, 0);

    const pemasukan = manualIncome + salesOrders.reduce((sum, o) => sum + o.cashIn, 0);

    // ROAS & Jumlah Order: bulan berjalan
    const adsSpendThisMonth = mutationsThisMonth.filter((m) => m.kategori === "Ads").reduce((sum, m) => sum + m.jumlah, 0);
    const omzetThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.totalCustomerBayar, 0);
    const roas = adsSpendThisMonth > 0 ? `${(omzetThisMonth / adsSpendThisMonth).toFixed(1)}x` : "0x";
    const jumlahOrderBulanIni = ordersThisMonth.length;

    const investasiTotal = investments.reduce((sum, i) => sum + i.nilai, 0);

    const mainGoal = goals[0];
    const goalCollected = mainGoal?.autoLinked ? Math.max(0, computeTotalProfit(salesOrders, mutations, transactions)) : mainGoal?.collected ?? 0;
    const goalPct = mainGoal && mainGoal.target > 0 ? Math.round((goalCollected / mainGoal.target) * 100) : 0;

    return dashboardKpis.map((kpi) => {
      switch (kpi.id) {
        case "saldo-total":
          return { ...kpi, value: formatCurrency(saldoTotal), footnote: "Akumulasi semua waktu (rekening + manual + laba bisnis)" };
        case "cash-flow":
          return { ...kpi, value: formatCurrency(cashFlow), footnote: "Gross Provit bulan berjalan" };
        case "pemasukan":
          return { ...kpi, value: formatCurrency(pemasukan), footnote: `Manual + Cash In ${salesOrders.length} order (semua waktu)` };
        case "pengeluaran":
          return { ...kpi, value: formatCurrency(pengeluaran), footnote: "Mutasi Ads/Biaya Lainnya/Prive/Return bulan ini" };
        case "profit-bulanan":
          return { ...kpi, value: formatCurrency(profitBulanan), footnote: "Reset tiap bulan, masuk ke Saldo Total" };
        case "investasi":
          return { ...kpi, value: formatCurrency(investasiTotal), footnote: `${investments.length} instrumen` };
        case "roas":
          return { ...kpi, value: roas, footnote: "Omzet / biaya Ads bulan ini" };
        case "jumlah-order":
          return { ...kpi, value: String(jumlahOrderBulanIni), footnote: "Total order bulan ini" };
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
  }, [transactions, accounts, goals, salesOrders, mutations, investments]);

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
