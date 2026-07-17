import type { SalesOrder } from "@/data/pagesDummy";
import type { ReportSnapshot } from "@/data/pagesDummy";
import type { BusinessMutation } from "@/store/businessMutationsStore";
import type { TransactionItem } from "@/types/finance";
import { parseDateSlash } from "@/utils/format";
import { getEffectiveGrossProvit, computeLabaBersihBisnis, HPP_PAYMENT_CATEGORY } from "@/utils/businessCalc";

const PENGELUARAN_KATEGORI = ["Ads", "Biaya Lainnya", "Prive", "Return"];

function isInMonth(dateStr: string, month: number, year: number): boolean {
  const d = parseDateSlash(dateStr);
  if (!d) return false;
  return d.getMonth() === month && d.getFullYear() === year;
}

export function computeMonthlySnapshot(
  month: number, // 0-11
  year: number,
  orders: SalesOrder[],
  mutations: BusinessMutation[],
  transactions: TransactionItem[]
): ReportSnapshot {
  const ordersThisMonth = orders.filter((o) => isInMonth(o.tanggal, month, year));
  const mutationsThisMonth = mutations.filter((m) => isInMonth(m.tanggal, month, year));
  const transactionsThisMonth = transactions.filter((t) => isInMonth(t.date, month, year));

  const omzet = ordersThisMonth.reduce((s, o) => s + o.totalCustomerBayar, 0);
  const totalGrossProvit = ordersThisMonth.reduce((s, o) => s + getEffectiveGrossProvit(o), 0);
  const labaBersihBisnis = computeLabaBersihBisnis(ordersThisMonth, mutationsThisMonth);

  const manualIncome = transactionsThisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const manualExpense = transactionsThisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const manualNet = manualIncome - manualExpense;

  const pengeluaran = mutationsThisMonth
    .filter((m) => PENGELUARAN_KATEGORI.includes(m.kategori))
    .reduce((s, m) => s + m.jumlah, 0);

  const adsSpend = mutationsThisMonth.filter((m) => m.kategori === "Ads").reduce((s, m) => s + m.jumlah, 0);
  const roas = adsSpend > 0 ? `${(omzet / adsSpend).toFixed(1)}x` : "0x";

  const kategoriMap = new Map<string, number>();
  for (const m of mutationsThisMonth) {
    if (m.kategori === HPP_PAYMENT_CATEGORY) continue;
    kategoriMap.set(m.kategori, (kategoriMap.get(m.kategori) ?? 0) + m.jumlah);
  }
  const mutasiPerKategori = Array.from(kategoriMap.entries()).map(([kategori, jumlah]) => ({ kategori, jumlah }));

  return {
    omzet,
    totalGrossProvit,
    labaBersihBisnis,
    manualNet,
    totalProfitGabungan: labaBersihBisnis + manualNet,
    pengeluaran,
    jumlahOrder: ordersThisMonth.length,
    roas,
    mutasiPerKategori,
  };
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function monthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}
