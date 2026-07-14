import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Building2,
  TrendingUp,
  Package,
  Users,
  Truck,
  Landmark,
  CreditCard,
  PieChart,
  Home,
  Target,
  FileBarChart2,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useGoalsStore } from "@/store/goalsStore";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { computeLabaBersihBisnis } from "@/utils/businessCalc";
import { formatCurrency } from "@/utils/format";

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Keuangan Pribadi", path: "/keuangan-pribadi", icon: Wallet },
  { label: "Keuangan Bisnis", path: "/keuangan-bisnis", icon: Building2 },
  { label: "Penjualan", path: "/penjualan", icon: TrendingUp },
  { label: "Stok & Return", path: "/produk", icon: Package },
  { label: "Customer", path: "/customer", icon: Users },
  { label: "Supplier", path: "/supplier", icon: Truck },
  { label: "Rekening", path: "/rekening", icon: Landmark },
  { label: "Budget", path: "/budget", icon: CreditCard },
  { label: "Investasi", path: "/investasi", icon: PieChart },
  { label: "Aset", path: "/aset", icon: Home },
  { label: "Target", path: "/target", icon: Target },
  { label: "Laporan", path: "/laporan", icon: FileBarChart2 },
  { label: "Setting", path: "/setting", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const goals = useGoalsStore((s) => s.goals);
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const mainGoal = goals[0];
  const labaBersih = computeLabaBersihBisnis(orders, mutations);
  const collected = mainGoal?.autoLinked ? Math.max(0, labaBersih) : mainGoal?.collected ?? 0;
  const pct = mainGoal && mainGoal.target > 0 ? Math.min(100, Math.round((collected / mainGoal.target) * 100)) : 0;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-secondary-950/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-secondary-100/80 bg-white/95 backdrop-blur-xl transition-transform duration-300 dark:border-secondary-800 dark:bg-secondary-900/95 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
              <Sparkles className="h-4.5 w-4.5" size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-secondary-900 dark:text-white">
                NOPA
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-secondary-400">
                Finance OS
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {navItems.map((item, idx) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                    : "text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800/60 dark:hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.25 }}
                  className="flex w-full items-center gap-3"
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute left-0 h-5 w-1 rounded-r-full bg-primary-600"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
            {mainGoal ? mainGoal.name : "Target 100 Juta Pertama"}
          </p>
          <p className="mt-1 text-lg font-bold">{pct}% Tercapai</p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-primary-100">
            {mainGoal ? `${formatCurrency(collected, { compact: true })} / ${formatCurrency(mainGoal.target, { compact: true })}` : "Belum diatur"}
          </p>
        </div>
      </aside>
    </>
  );
}
