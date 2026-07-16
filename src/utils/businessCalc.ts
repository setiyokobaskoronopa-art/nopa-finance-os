import type { SalesOrder } from "@/data/pagesDummy";
import type { BusinessMutation } from "@/store/businessMutationsStore";
import { parseDateSlash } from "@/utils/format";

/** Cek apakah tanggal (format dd/mm/yyyy) berada di bulan & tahun berjalan (sekarang). */
export function isInCurrentMonth(dateStr: string, reference: Date = new Date()): boolean {
  const d = parseDateSlash(dateStr);
  if (!d) return false;
  return d.getMonth() === reference.getMonth() && d.getFullYear() === reference.getFullYear();
}

// Kategori mutasi ini merepresentasikan pembayaran kas untuk HPP yang sudah
// diakui di Gross Provit saat penjualan terjadi — jadi TIDAK ikut mengurangi
// Laba Bersih lagi (supaya tidak dobel hitung), tapi tetap dihitung sebagai
// arus kas keluar beneran (Pengeluaran) di Dashboard.
export const HPP_PAYMENT_CATEGORY = "Bayar HPP";

export function getEffectiveGrossProvit(order: SalesOrder): number {
  return order.status === "Return" ? 0 : order.grossProvit;
}

export function computeLabaBersihBisnis(orders: SalesOrder[], mutations: BusinessMutation[]): number {
  const labaKotor = orders.reduce((sum, o) => sum + getEffectiveGrossProvit(o), 0);
  const totalMutasi = mutations
    .filter((m) => m.kategori !== HPP_PAYMENT_CATEGORY)
    .reduce((sum, m) => sum + m.jumlah, 0);
  return labaKotor - totalMutasi;
}

export function computeHppTerbayar(mutations: BusinessMutation[]): number {
  return mutations.filter((m) => m.kategori === HPP_PAYMENT_CATEGORY).reduce((sum, m) => sum + m.jumlah, 0);
}

/** Total profit gabungan: Laba Bersih Bisnis + transaksi manual (Pemasukan - Pengeluaran). */
export function computeTotalProfit(
  orders: SalesOrder[],
  mutations: BusinessMutation[],
  manualTransactions: { type: "income" | "expense"; amount: number }[]
): number {
  const labaBersihBisnis = computeLabaBersihBisnis(orders, mutations);
  const manualNet = manualTransactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  );
  return labaBersihBisnis + manualNet;
}
