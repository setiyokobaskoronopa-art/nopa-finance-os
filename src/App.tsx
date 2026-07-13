import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import PersonalFinance from "@/pages/PersonalFinance";
import BusinessFinance from "@/pages/BusinessFinance";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import Accounts from "@/pages/Accounts";
import BudgetPage from "@/pages/BudgetPage";
import Investment from "@/pages/Investment";
import Assets from "@/pages/Assets";
import Goals from "@/pages/Goals";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/keuangan-pribadi" element={<PersonalFinance />} />
        <Route path="/keuangan-bisnis" element={<BusinessFinance />} />
        <Route path="/penjualan" element={<Sales />} />
        <Route path="/produk" element={<Products />} />
        <Route path="/customer" element={<Customers />} />
        <Route path="/supplier" element={<Suppliers />} />
        <Route path="/rekening" element={<Accounts />} />
        <Route path="/budget" element={<BudgetPage />} />
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
