import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import PersonalFinance from "@/pages/PersonalFinance";
import BusinessFinance from "@/pages/BusinessFinance";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Suppliers from "@/pages/Suppliers";
import Accounts from "@/pages/Accounts";
import BudgetPage from "@/pages/BudgetPage";
import AdPerformance from "@/pages/AdPerformance";
import AdIntegrations from "@/pages/AdIntegrations";
import Investment from "@/pages/Investment";
import Assets from "@/pages/Assets";
import Goals from "@/pages/Goals";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import { useAuthStore } from "@/store/authStore";

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface dark:bg-surface-dark">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
          <Sparkles size={22} />
        </div>
        <p className="text-xs font-medium text-secondary-400">Memuat Nopa Finance OS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/keuangan-pribadi" element={<PersonalFinance />} />
        <Route path="/keuangan-bisnis" element={<BusinessFinance />} />
        <Route path="/penjualan" element={<Sales />} />
        <Route path="/produk" element={<Products />} />
        <Route path="/customer" element={<Customers />} />
        <Route path="/customer/:key" element={<CustomerDetail />} />
        <Route path="/supplier" element={<Suppliers />} />
        <Route path="/rekening" element={<Accounts />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/performa-ads" element={<AdPerformance />} />
        <Route path="/performa-ads/integrasi" element={<AdIntegrations />} />
        <Route path="/investasi" element={<Investment />} />
        <Route path="/aset" element={<Assets />} />
        <Route path="/target" element={<Goals />} />
        <Route path="/laporan" element={<Reports />} />
        <Route path="/setting" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
