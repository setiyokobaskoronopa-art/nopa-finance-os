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

export default function Dashboard() {
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
            <Button size="sm">
              <Plus size={15} /> Transaksi Baru
            </Button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dashboardKpis.map((kpi, idx) => (
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
