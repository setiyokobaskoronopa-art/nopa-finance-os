import { createSupabaseEntityStore } from "@/store/createSupabaseEntityStore";
import type { SupplierItem, BudgetRow, InvestmentRow, AssetRow, ReportRow, PersonalTx } from "@/data/pagesDummy";

// ---------- Suppliers ----------
function supplierToRow(item: Partial<SupplierItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.nama !== undefined) row.nama = item.nama;
  if (item.produk !== undefined) row.produk = item.produk;
  if (item.kontak !== undefined) row.kontak = item.kontak;
  if (item.totalPembelian !== undefined) row.total_pembelian = item.totalPembelian;
  if (item.status !== undefined) row.status = item.status;
  return row;
}
function supplierFromRow(row: Record<string, unknown>): SupplierItem {
  return {
    id: row.id as string,
    nama: row.nama as string,
    produk: row.produk as string,
    kontak: row.kontak as string,
    totalPembelian: Number(row.total_pembelian),
    status: row.status as string,
  };
}
export const useSuppliersStore = createSupabaseEntityStore<SupplierItem>("suppliers", supplierToRow, supplierFromRow);

// ---------- Budget ----------
function budgetToRow(item: Partial<BudgetRow>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.kategori !== undefined) row.kategori = item.kategori;
  if (item.alokasi !== undefined) row.alokasi = item.alokasi;
  if (item.terpakai !== undefined) row.terpakai = item.terpakai;
  if (item.sisa !== undefined) row.sisa = item.sisa;
  return row;
}
function budgetFromRow(row: Record<string, unknown>): BudgetRow {
  return {
    id: row.id as string,
    kategori: row.kategori as string,
    alokasi: Number(row.alokasi),
    terpakai: Number(row.terpakai),
    sisa: Number(row.sisa),
  };
}
export const useBudgetStore = createSupabaseEntityStore<BudgetRow>("budgets", budgetToRow, budgetFromRow);

// ---------- Investment ----------
function investmentToRow(item: Partial<InvestmentRow>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.instrumen !== undefined) row.instrumen = item.instrumen;
  if (item.platform !== undefined) row.platform = item.platform;
  if (item.nilai !== undefined) row.nilai = item.nilai;
  if (item.imbalHasil !== undefined) row.imbal_hasil = item.imbalHasil;
  return row;
}
function investmentFromRow(row: Record<string, unknown>): InvestmentRow {
  return {
    id: row.id as string,
    instrumen: row.instrumen as string,
    platform: row.platform as string,
    nilai: Number(row.nilai),
    imbalHasil: row.imbal_hasil as string,
  };
}
export const useInvestmentStore = createSupabaseEntityStore<InvestmentRow>("investments", investmentToRow, investmentFromRow);

// ---------- Assets ----------
function assetToRow(item: Partial<AssetRow>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.nama !== undefined) row.nama = item.nama;
  if (item.kategori !== undefined) row.kategori = item.kategori;
  if (item.nilai !== undefined) row.nilai = item.nilai;
  if (item.kondisi !== undefined) row.kondisi = item.kondisi;
  return row;
}
function assetFromRow(row: Record<string, unknown>): AssetRow {
  return {
    id: row.id as string,
    nama: row.nama as string,
    kategori: row.kategori as string,
    nilai: Number(row.nilai),
    kondisi: row.kondisi as string,
  };
}
export const useAssetsStore = createSupabaseEntityStore<AssetRow>("assets", assetToRow, assetFromRow);

// ---------- Reports ----------
function reportToRow(item: Partial<ReportRow>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.nama !== undefined) row.nama = item.nama;
  if (item.periode !== undefined) row.periode = item.periode;
  if (item.tipe !== undefined) row.tipe = item.tipe;
  if (item.dibuat !== undefined) row.dibuat = item.dibuat;
  if (item.snapshotData !== undefined) row.snapshot_data = item.snapshotData;
  if (item.periodeMonth !== undefined) row.periode_month = item.periodeMonth;
  if (item.periodeYear !== undefined) row.periode_year = item.periodeYear;
  return row;
}
function reportFromRow(row: Record<string, unknown>): ReportRow {
  return {
    id: row.id as string,
    nama: row.nama as string,
    periode: row.periode as string,
    tipe: row.tipe as string,
    dibuat: row.dibuat as string,
    snapshotData: (row.snapshot_data as ReportRow["snapshotData"]) ?? null,
    periodeMonth: (row.periode_month as number) ?? null,
    periodeYear: (row.periode_year as number) ?? null,
  };
}
export const useReportsStore = createSupabaseEntityStore<ReportRow>("reports", reportToRow, reportFromRow);

// ---------- Personal Transactions ----------
function personalTxToRow(item: Partial<PersonalTx>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.tanggal !== undefined) row.tanggal = item.tanggal;
  if (item.keterangan !== undefined) row.keterangan = item.keterangan;
  if (item.kategori !== undefined) row.kategori = item.kategori;
  if (item.jumlah !== undefined) row.jumlah = item.jumlah;
  if (item.jenis !== undefined) row.jenis = item.jenis;
  return row;
}
function personalTxFromRow(row: Record<string, unknown>): PersonalTx {
  return {
    id: row.id as string,
    tanggal: row.tanggal as string,
    keterangan: row.keterangan as string,
    kategori: row.kategori as string,
    jumlah: Number(row.jumlah),
    jenis: row.jenis as string,
  };
}
export const usePersonalTxStore = createSupabaseEntityStore<PersonalTx>(
  "personal_transactions",
  personalTxToRow,
  personalTxFromRow
);

export { useSalesStore } from "@/store/salesStore";
