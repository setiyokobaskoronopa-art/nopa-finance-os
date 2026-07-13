import type {
  KpiDatum,
  TransactionItem,
  ActivityItem,
  BudgetProgressItem,
  CategoryShare,
  BankAccount,
} from "@/types/finance";

export const dashboardKpis: KpiDatum[] = [
  { id: "saldo-total", label: "Saldo Total", value: "Rp0", icon: "Wallet", accent: "primary", footnote: "Gabungan seluruh rekening" },
  { id: "cash-flow", label: "Cash Flow", value: "Rp0", icon: "ArrowLeftRight", accent: "secondary", footnote: "Bulan ini vs bulan lalu" },
  { id: "profit-bulanan", label: "Profit Bulanan", value: "Rp0", icon: "TrendingUp", accent: "secondary", footnote: "DVN Collagen & DVN Ais Beauty" },
  { id: "pengeluaran", label: "Pengeluaran", value: "Rp0", icon: "ArrowDownCircle", accent: "secondary", footnote: "Belum ada transaksi" },
  { id: "pemasukan", label: "Pemasukan", value: "Rp0", icon: "ArrowUpCircle", accent: "secondary", footnote: "Belum ada transaksi" },
  { id: "investasi", label: "Investasi", value: "Rp0", icon: "LineChart", accent: "secondary", footnote: "Reksadana & saham" },
  { id: "target-pernikahan", label: "Target Pernikahan", value: "Rp0", icon: "HeartHandshake", accent: "secondary", footnote: "Belum diatur" },
  { id: "dana-darurat", label: "Dana Darurat", value: "Rp0", icon: "ShieldCheck", accent: "secondary", footnote: "Target 6x pengeluaran bulanan" },
  { id: "roas", label: "ROAS", value: "0x", icon: "Target", accent: "secondary", footnote: "Google Ads — semua kampanye" },
  { id: "jumlah-order", label: "Jumlah Order", value: "0", icon: "ShoppingBag", accent: "secondary", footnote: "Belum ada order" },
];

export const cashFlowSeries = {
  categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"],
  income: [0, 0, 0, 0, 0, 0, 0],
  expense: [0, 0, 0, 0, 0, 0, 0],
};

export const profitSeries = {
  categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"],
  profit: [0, 0, 0, 0, 0, 0, 0],
};

export const expenseCategorySeries: CategoryShare[] = [];

export const recentTransactions: TransactionItem[] = [];

export const recentActivities: ActivityItem[] = [];

export const budgetProgress: BudgetProgressItem[] = [];

export const topCategories: { id: string; name: string; value: number; share: number }[] = [];

export const bankAccounts: BankAccount[] = [];
