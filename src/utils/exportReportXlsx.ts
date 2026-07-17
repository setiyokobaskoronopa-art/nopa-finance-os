import * as XLSX from "xlsx";
import type { ReportSnapshot } from "@/data/pagesDummy";
import { formatCurrency } from "@/utils/format";

export function downloadReportExcel(nama: string, periode: string, snapshot: ReportSnapshot) {
  const summaryRows = [
    ["Laporan", nama],
    ["Periode", periode],
    [],
    ["Ringkasan", "Nilai"],
    ["Omzet", snapshot.omzet],
    ["Total Gross Provit", snapshot.totalGrossProvit],
    ["Laba Bersih Bisnis", snapshot.labaBersihBisnis],
    ["Transaksi Manual (Bersih)", snapshot.manualNet],
    ["Total Profit Gabungan", snapshot.totalProfitGabungan],
    ["Pengeluaran (Ads/Biaya Lainnya/Prive/Return)", snapshot.pengeluaran],
    ["Jumlah Order", snapshot.jumlahOrder],
    ["ROAS", snapshot.roas],
  ];

  const kategoriRows = [
    ["Kategori Mutasi", "Jumlah"],
    ...snapshot.mutasiPerKategori.map((k) => [k.kategori, k.jumlah]),
  ];

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 34 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  const wsKategori = XLSX.utils.aoa_to_sheet(kategoriRows);
  wsKategori["!cols"] = [{ wch: 24 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsKategori, "Per Kategori");

  const fileName = `${nama.replace(/[^a-zA-Z0-9]+/g, "_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Dipakai untuk pratinjau singkat di kartu Laporan (opsional)
export function summarizeSnapshot(snapshot: ReportSnapshot): string {
  return `Omzet ${formatCurrency(snapshot.omzet, { compact: true })} · Profit ${formatCurrency(snapshot.totalProfitGabungan, { compact: true })}`;
}
