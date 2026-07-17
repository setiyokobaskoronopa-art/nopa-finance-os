import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { AddAccountDialog } from "@/components/dashboard/AddAccountDialog";
import { useUIStore } from "@/store/uiStore";
import { useAccountsStoreBase } from "@/store/accountsStore";
import { useTransactionsStoreBase } from "@/store/transactionsStore";
import { useGoalsStore } from "@/store/goalsStore";
import {
  useSalesStore,
  useSuppliersStore,
  useBudgetStore,
  useInvestmentStore,
  useAssetsStore,
  useReportsStore,
  usePersonalTxStore,
} from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { useStockReturnsStore } from "@/store/stockReturnsStore";
import { computeMonthlySnapshot, monthLabel } from "@/utils/monthlyReportSnapshot";
import { formatDateSlash } from "@/utils/format";
import { useCustomersMetaStore } from "@/store/customersMetaStore";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    transactionDialogOpen,
    transactionDialogType,
    closeTransactionDialog,
    accountDialogOpen,
    closeAccountDialog,
  } = useUIStore();

  // Muat semua data dari Supabase begitu user berhasil masuk, lalu cek apakah
  // laporan bulan lalu sudah pernah dibuat - kalau belum, buatkan otomatis sekarang.
  useEffect(() => {
    (async () => {
      await Promise.all([
        useAccountsStoreBase.getState().fetchItems(),
        useTransactionsStoreBase.getState().fetchItems(),
        useGoalsStore.getState().fetchGoals(),
        useSalesStore.getState().fetchItems(),
        useSuppliersStore.getState().fetchItems(),
        useBudgetStore.getState().fetchItems(),
        useInvestmentStore.getState().fetchItems(),
        useAssetsStore.getState().fetchItems(),
        useReportsStore.getState().fetchItems(),
        usePersonalTxStore.getState().fetchItems(),
        useBusinessMutationsStore.getState().fetchItems(),
        useStockReturnsStore.getState().fetchItems(),
        useCustomersMetaStore.getState().fetchItems(),
      ]);

      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonth = lastMonthDate.getMonth();
      const lastYear = lastMonthDate.getFullYear();

      const existingReports = useReportsStore.getState().items;
      const alreadyExists = existingReports.some(
        (r) => r.periodeMonth === lastMonth && r.periodeYear === lastYear
      );
      if (alreadyExists) return;

      const orders = useSalesStore.getState().items;
      // Baru buatkan laporan otomatis kalau memang ada aktivitas di bulan itu
      const hasDataLastMonth = orders.some((o) => {
        const d = new Date(o.tanggal.split("/").reverse().join("-"));
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
      });
      if (!hasDataLastMonth) return;

      const mutations = useBusinessMutationsStore.getState().items;
      const transactions = useTransactionsStoreBase.getState().items;
      const snapshot = computeMonthlySnapshot(lastMonth, lastYear, orders, mutations, transactions);

      await useReportsStore.getState().addItem({
        nama: `Laporan ${monthLabel(lastMonth, lastYear)}`,
        periode: monthLabel(lastMonth, lastYear),
        tipe: "Bulanan (Otomatis)",
        dibuat: formatDateSlash(now),
        snapshotData: snapshot,
        periodeMonth: lastMonth,
        periodeYear: lastYear,
      });
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <FloatingActionButton />

      <AddTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={(v) => (v ? null : closeTransactionDialog())}
        defaultType={transactionDialogType}
      />
      <AddAccountDialog open={accountDialogOpen} onOpenChange={(v) => (v ? null : closeAccountDialog())} />
    </div>
  );
}
