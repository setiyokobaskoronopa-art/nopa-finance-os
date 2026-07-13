import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { AddAccountDialog } from "@/components/dashboard/AddAccountDialog";
import { useUIStore } from "@/store/uiStore";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    transactionDialogOpen,
    transactionDialogType,
    closeTransactionDialog,
    accountDialogOpen,
    closeAccountDialog,
  } = useUIStore();

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
