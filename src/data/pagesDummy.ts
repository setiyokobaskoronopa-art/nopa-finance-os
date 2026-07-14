import type { KpiDatum, GenericRow } from "@/types/finance";

// ---------- Keuangan Pribadi ----------
export const personalKpis: KpiDatum[] = [
  { id: "p1", label: "Saldo Pribadi", value: "Rp0", icon: "Wallet", accent: "secondary" },
  { id: "p2", label: "Pengeluaran Bulan Ini", value: "Rp0", icon: "ArrowDownCircle", accent: "secondary" },
  { id: "p3", label: "Tabungan Otomatis", value: "Rp0", icon: "PiggyBank", accent: "secondary" },
  { id: "p4", label: "Dana Darurat", value: "0%", icon: "ShieldCheck", accent: "secondary" },
];

export interface PersonalTx extends GenericRow {
  tanggal: string;
  keterangan: string;
  kategori: string;
  jumlah: number;
  jenis: string;
}

export const personalTransactions: PersonalTx[] = [];

// ---------- Keuangan Bisnis ----------
export const businessKpis: KpiDatum[] = [
  { id: "b1", label: "Omzet Bisnis", value: "Rp0", icon: "Building2", accent: "secondary" },
  { id: "b2", label: "Beban Operasional", value: "Rp0", icon: "Factory", accent: "secondary" },
  { id: "b3", label: "Laba Kotor", value: "Rp0", icon: "TrendingUp", accent: "secondary" },
  { id: "b4", label: "Margin Laba", value: "0%", icon: "Percent", accent: "secondary" },
];

export interface BusinessEntry extends GenericRow {
  brand: string;
  omzet: number;
  beban: number;
  laba: number;
  margin: string;
}

export const businessEntries: BusinessEntry[] = [];

// ---------- Penjualan ----------
export const salesKpis: KpiDatum[] = [
  { id: "s1", label: "Total Penjualan", value: "Rp0", icon: "TrendingUp", accent: "secondary" },
  { id: "s2", label: "Jumlah Order", value: "0", icon: "ShoppingBag", accent: "secondary" },
  { id: "s3", label: "AOV (Rata-rata Order)", value: "Rp0", icon: "Receipt", accent: "secondary" },
  { id: "s4", label: "Refund Rate", value: "0%", icon: "Undo2", accent: "secondary" },
];

export interface SalesOrder extends GenericRow {
  cs: string;
  tanggal: string;
  namaCustomer: string;
  noWa: string;
  kode: string;
  platform: string;
  metodePembayaran: string;
  ekspedis: string;
  produk: string;
  box: string;
  hargaTotalProduk: number;
  diskonOngkir: number;
  totalCustomerBayar: number;
  biayaCod: number;
  pajakCod: number;
  promo: number;
  cashIn: number;
  hpp: number;
  grossProvit: number;
  status: string;
}

export const salesOrders: SalesOrder[] = [];

// ---------- Produk ----------
export const productKpis: KpiDatum[] = [
  { id: "pr1", label: "Total Produk", value: "0", icon: "Package", accent: "secondary" },
  { id: "pr2", label: "Stok Menipis", value: "0", icon: "AlertTriangle", accent: "secondary" },
  { id: "pr3", label: "Produk Terlaris", value: "-", icon: "Star", accent: "secondary" },
  { id: "pr4", label: "Total Nilai Stok", value: "Rp0", icon: "Warehouse", accent: "secondary" },
];

export interface ProductItem extends GenericRow {
  nama: string;
  kategori: string;
  stok: number;
  harga: number;
  terjual: number;
}

export const products: ProductItem[] = [];

// ---------- Customer ----------
export const customerKpis: KpiDatum[] = [
  { id: "cu1", label: "Total Customer", value: "0", icon: "Users", accent: "secondary" },
  { id: "cu2", label: "Customer Baru", value: "0", icon: "UserPlus", accent: "secondary" },
  { id: "cu3", label: "Repeat Order", value: "0%", icon: "Repeat", accent: "secondary" },
  { id: "cu4", label: "Customer Churn", value: "0%", icon: "UserMinus", accent: "secondary" },
];

export interface CustomerItem extends GenericRow {
  nama: string;
  email: string;
  totalOrder: number;
  totalBelanja: number;
  status: string;
}

export const customers: CustomerItem[] = [];

// ---------- Supplier ----------
export const supplierKpis: KpiDatum[] = [
  { id: "sp1", label: "Total Supplier", value: "0", icon: "Truck", accent: "secondary" },
  { id: "sp2", label: "Pesanan Aktif", value: "0", icon: "PackageCheck", accent: "secondary" },
  { id: "sp3", label: "Total Pembelian", value: "Rp0", icon: "ShoppingCart", accent: "secondary" },
  { id: "sp4", label: "Rata-rata Tempo Bayar", value: "0 hari", icon: "CalendarClock", accent: "secondary" },
];

export interface SupplierItem extends GenericRow {
  nama: string;
  produk: string;
  kontak: string;
  totalPembelian: number;
  status: string;
}

export const suppliers: SupplierItem[] = [];

// ---------- Rekening ----------
export const accountKpis: KpiDatum[] = [
  { id: "ac1", label: "Total Saldo Semua Rekening", value: "Rp0", icon: "Landmark", accent: "secondary" },
  { id: "ac2", label: "Rekening Aktif", value: "0", icon: "Wallet", accent: "secondary" },
  { id: "ac3", label: "Rata-rata Arus Masuk", value: "Rp0", icon: "ArrowDownToLine", accent: "secondary" },
  { id: "ac4", label: "Rata-rata Arus Keluar", value: "Rp0", icon: "ArrowUpFromLine", accent: "secondary" },
];

export interface AccountRow extends GenericRow {
  bank: string;
  nomor: string;
  atasNama: string;
  saldo: number;
}

export const accountRows: AccountRow[] = [];

// ---------- Budget ----------
export const budgetKpis: KpiDatum[] = [
  { id: "bu1", label: "Total Budget Bulan Ini", value: "Rp0", icon: "CreditCard", accent: "secondary" },
  { id: "bu2", label: "Terpakai", value: "Rp0", icon: "Wallet", accent: "secondary" },
  { id: "bu3", label: "Sisa Budget", value: "Rp0", icon: "PiggyBank", accent: "secondary" },
  { id: "bu4", label: "Kategori Over Budget", value: "0", icon: "AlertTriangle", accent: "secondary" },
];

export interface BudgetRow extends GenericRow {
  kategori: string;
  alokasi: number;
  terpakai: number;
  sisa: number;
}

export const budgetRows: BudgetRow[] = [];

// ---------- Investasi ----------
export const investmentKpis: KpiDatum[] = [
  { id: "in1", label: "Total Investasi", value: "Rp0", icon: "LineChart", accent: "secondary" },
  { id: "in2", label: "Reksadana", value: "Rp0", icon: "PieChart", accent: "secondary" },
  { id: "in3", label: "Saham", value: "Rp0", icon: "TrendingUp", accent: "secondary" },
  { id: "in4", label: "Emas", value: "Rp0", icon: "Coins", accent: "secondary" },
];

export interface InvestmentRow extends GenericRow {
  instrumen: string;
  platform: string;
  nilai: number;
  imbalHasil: string;
}

export const investmentRows: InvestmentRow[] = [];

// ---------- Aset ----------
export const assetKpis: KpiDatum[] = [
  { id: "as1", label: "Total Nilai Aset", value: "Rp0", icon: "Home", accent: "secondary" },
  { id: "as2", label: "Aset Properti", value: "Rp0", icon: "Building", accent: "secondary" },
  { id: "as3", label: "Kendaraan", value: "Rp0", icon: "Car", accent: "secondary" },
  { id: "as4", label: "Elektronik & Lainnya", value: "Rp0", icon: "Laptop", accent: "secondary" },
];

export interface AssetRow extends GenericRow {
  nama: string;
  kategori: string;
  nilai: number;
  kondisi: string;
}

export const assetRows: AssetRow[] = [];

// ---------- Target ----------
export const goalKpis: KpiDatum[] = [
  { id: "gl1", label: "Target Pernikahan", value: "0%", icon: "HeartHandshake", accent: "secondary" },
  { id: "gl2", label: "Dana Darurat", value: "0%", icon: "ShieldCheck", accent: "secondary" },
  { id: "gl3", label: "Renovasi Rumah", value: "0%", icon: "Home", accent: "secondary" },
  { id: "gl4", label: "Dana Pendidikan", value: "0%", icon: "GraduationCap", accent: "secondary" },
];

export interface GoalRow extends GenericRow {
  target: string;
  targetTanggal: string;
  terkumpul: number;
  totalTarget: number;
  progress: string;
}

export const goalRows: GoalRow[] = [];

// ---------- Laporan ----------
export const reportKpis: KpiDatum[] = [
  { id: "rp1", label: "Laporan Tersedia", value: "0", icon: "FileBarChart2", accent: "secondary" },
  { id: "rp2", label: "Laporan Bulan Ini", value: "0", icon: "FileCheck2", accent: "secondary" },
  { id: "rp3", label: "Terjadwal Otomatis", value: "0", icon: "CalendarClock", accent: "secondary" },
  { id: "rp4", label: "Format Export", value: "PDF, Excel", icon: "Download", accent: "secondary" },
];

export interface ReportRow extends GenericRow {
  nama: string;
  periode: string;
  dibuat: string;
  tipe: string;
}

export const reportRows: ReportRow[] = [];
