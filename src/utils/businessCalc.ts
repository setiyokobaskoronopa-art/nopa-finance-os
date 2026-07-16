import type { SalesOrder } from "@/data/pagesDummy";
import type { BusinessMutation } from "@/store/businessMutationsStore";

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
