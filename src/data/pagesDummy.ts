import type { KpiDatum, GenericRow } from "@/types/finance";

// ---------- Keuangan Pribadi ----------
export const personalKpis: KpiDatum[] = [
  { id: "p1", label: "Saldo Pribadi", value: "Rp14.230.000", delta: "+3.1%", trend: "up", icon: "Wallet", accent: "primary", sparkline: [10, 12, 11, 14, 13, 16, 15, 18] },
  { id: "p2", label: "Pengeluaran Bulan Ini", value: "Rp3.840.000", delta: "-1.8%", trend: "down", icon: "ArrowDownCircle", accent: "danger", sparkline: [18, 17, 16, 15, 14, 13, 12, 11] },
  { id: "p3", label: "Tabungan Otomatis", value: "Rp2.500.000", delta: "On track", trend: "up", icon: "PiggyBank", accent: "success", sparkline: [5, 8, 10, 12, 14, 16, 18, 20] },
  { id: "p4", label: "Dana Darurat", value: "91%", delta: "+2%", trend: "up", icon: "ShieldCheck", accent: "warning", sparkline: [70, 74, 78, 82, 85, 88, 89, 91] },
];

export interface PersonalTx extends GenericRow {
  tanggal: string;
  keterangan: string;
  kategori: string;
  jumlah: number;
  jenis: string;
}

export const personalTransactions: PersonalTx[] = [
  { id: "pt1", tanggal: "07 Jul 2026", keterangan: "Belanja bulanan Superindo", kategori: "Kebutuhan Harian", jumlah: 620000, jenis: "Keluar" },
  { id: "pt2", tanggal: "06 Jul 2026", keterangan: "Gaji konsultasi Ads", kategori: "Pemasukan", jumlah: 3500000, jenis: "Masuk" },
  { id: "pt3", tanggal: "05 Jul 2026", keterangan: "Bensin & tol", kategori: "Transportasi", jumlah: 250000, jenis: "Keluar" },
  { id: "pt4", tanggal: "04 Jul 2026", keterangan: "Cicilan laptop", kategori: "Cicilan", jumlah: 850000, jenis: "Keluar" },
  { id: "pt5", tanggal: "03 Jul 2026", keterangan: "Nabung dana darurat", kategori: "Tabungan", jumlah: 1000000, jenis: "Keluar" },
];

// ---------- Keuangan Bisnis ----------
export const businessKpis: KpiDatum[] = [
  { id: "b1", label: "Omzet Bisnis", value: "Rp42.500.000", delta: "+9.4%", trend: "up", icon: "Building2", accent: "primary", sparkline: [20, 24, 26, 30, 33, 36, 39, 42] },
  { id: "b2", label: "Beban Operasional", value: "Rp11.200.000", delta: "+1.2%", trend: "up", icon: "Factory", accent: "warning", sparkline: [8, 9, 9, 10, 10, 11, 11, 11] },
  { id: "b3", label: "Laba Kotor", value: "Rp18.750.000", delta: "+12.6%", trend: "up", icon: "TrendingUp", accent: "success", sparkline: [10, 12, 13, 14, 16, 17, 18, 19] },
  { id: "b4", label: "Margin Laba", value: "44.1%", delta: "+2.3%", trend: "up", icon: "Percent", accent: "secondary", sparkline: [38, 39, 40, 41, 42, 43, 43, 44] },
];

export interface BusinessEntry extends GenericRow {
  brand: string;
  omzet: number;
  beban: number;
  laba: number;
  margin: string;
}

export const businessEntries: BusinessEntry[] = [
  { id: "be1", brand: "DVN Collagen", omzet: 27500000, beban: 6800000, laba: 20700000, margin: "75.3%" },
  { id: "be2", brand: "DVN Ais Beauty", omzet: 15000000, beban: 4400000, laba: 10600000, margin: "70.7%" },
];

// ---------- Penjualan ----------
export const salesKpis: KpiDatum[] = [
  { id: "s1", label: "Total Penjualan", value: "Rp42.500.000", delta: "+9.4%", trend: "up", icon: "TrendingUp", accent: "primary", sparkline: [20, 24, 26, 30, 33, 36, 39, 42] },
  { id: "s2", label: "Jumlah Order", value: "1.284", delta: "+18.3%", trend: "up", icon: "ShoppingBag", accent: "success", sparkline: [820, 900, 980, 1050, 1120, 1180, 1240, 1284] },
  { id: "s3", label: "AOV (Rata-rata Order)", value: "Rp331.000", delta: "+3.2%", trend: "up", icon: "Receipt", accent: "secondary", sparkline: [300, 305, 310, 315, 320, 325, 328, 331] },
  { id: "s4", label: "Refund Rate", value: "1.4%", delta: "-0.3%", trend: "down", icon: "Undo2", accent: "danger", sparkline: [2.4, 2.2, 2.0, 1.8, 1.7, 1.6, 1.5, 1.4] },
];

export interface SalesOrder extends GenericRow {
  order: string;
  channel: string;
  customer: string;
  tanggal: string;
  total: number;
  status: string;
}

export const salesOrders: SalesOrder[] = [
  { id: "so1", order: "#INV-2231", channel: "Shopee", customer: "Rina A.", tanggal: "07 Jul 2026", total: 458000, status: "Selesai" },
  { id: "so2", order: "#INV-2230", channel: "Tokopedia", customer: "Dewi K.", tanggal: "07 Jul 2026", total: 275000, status: "Diproses" },
  { id: "so3", order: "#INV-2229", channel: "Reseller", customer: "Toko Sari", tanggal: "06 Jul 2026", total: 1850000, status: "Selesai" },
  { id: "so4", order: "#INV-2228", channel: "Website", customer: "Aulia R.", tanggal: "06 Jul 2026", total: 512000, status: "Dikirim" },
  { id: "so5", order: "#INV-2227", channel: "Shopee", customer: "Fajar S.", tanggal: "05 Jul 2026", total: 340000, status: "Selesai" },
];

// ---------- Produk ----------
export const productKpis: KpiDatum[] = [
  { id: "pr1", label: "Total Produk", value: "24", icon: "Package", accent: "primary" },
  { id: "pr2", label: "Stok Menipis", value: "3", icon: "AlertTriangle", accent: "warning" },
  { id: "pr3", label: "Produk Terlaris", value: "Collagen Gold", icon: "Star", accent: "success" },
  { id: "pr4", label: "Total Nilai Stok", value: "Rp58.200.000", icon: "Warehouse", accent: "secondary" },
];

export interface ProductItem extends GenericRow {
  nama: string;
  kategori: string;
  stok: number;
  harga: number;
  terjual: number;
}

export const products: ProductItem[] = [
  { id: "pd1", nama: "DVN Collagen Gold 30s", kategori: "Suplemen", stok: 142, harga: 189000, terjual: 512 },
  { id: "pd2", nama: "DVN Collagen Rose 30s", kategori: "Suplemen", stok: 88, harga: 189000, terjual: 340 },
  { id: "pd3", nama: "Ais Beauty Serum Glow", kategori: "Skincare", stok: 12, harga: 145000, terjual: 275 },
  { id: "pd4", nama: "Ais Beauty Sunscreen SPF50", kategori: "Skincare", stok: 6, harga: 98000, terjual: 198 },
  { id: "pd5", nama: "DVN Collagen Travel Pack", kategori: "Suplemen", stok: 4, harga: 59000, terjual: 421 },
];

// ---------- Customer ----------
export const customerKpis: KpiDatum[] = [
  { id: "cu1", label: "Total Customer", value: "3.482", delta: "+5.6%", trend: "up", icon: "Users", accent: "primary" },
  { id: "cu2", label: "Customer Baru", value: "214", delta: "+12%", trend: "up", icon: "UserPlus", accent: "success" },
  { id: "cu3", label: "Repeat Order", value: "38%", delta: "+4%", trend: "up", icon: "Repeat", accent: "secondary" },
  { id: "cu4", label: "Customer Churn", value: "2.1%", delta: "-0.5%", trend: "down", icon: "UserMinus", accent: "danger" },
];

export interface CustomerItem extends GenericRow {
  nama: string;
  email: string;
  totalOrder: number;
  totalBelanja: number;
  status: string;
}

export const customers: CustomerItem[] = [
  { id: "cs1", nama: "Rina Amelia", email: "rina.a@email.com", totalOrder: 12, totalBelanja: 3240000, status: "VIP" },
  { id: "cs2", nama: "Dewi Kartika", email: "dewi.k@email.com", totalOrder: 5, totalBelanja: 890000, status: "Reguler" },
  { id: "cs3", nama: "Toko Sari", email: "tokosari@email.com", totalOrder: 28, totalBelanja: 12400000, status: "Reseller" },
  { id: "cs4", nama: "Aulia Rahmawati", email: "aulia.r@email.com", totalOrder: 3, totalBelanja: 512000, status: "Baru" },
];

// ---------- Supplier ----------
export const supplierKpis: KpiDatum[] = [
  { id: "sp1", label: "Total Supplier", value: "9", icon: "Truck", accent: "primary" },
  { id: "sp2", label: "Pesanan Aktif", value: "4", icon: "PackageCheck", accent: "warning" },
  { id: "sp3", label: "Total Pembelian", value: "Rp32.400.000", icon: "ShoppingCart", accent: "secondary" },
  { id: "sp4", label: "Rata-rata Tempo Bayar", value: "14 hari", icon: "CalendarClock", accent: "success" },
];

export interface SupplierItem extends GenericRow {
  nama: string;
  produk: string;
  kontak: string;
  totalPembelian: number;
  status: string;
}

export const suppliers: SupplierItem[] = [
  { id: "sup1", nama: "CV Sumber Kolagen Nusantara", produk: "Bubuk Kolagen", kontak: "0812xxxxxxx", totalPembelian: 18500000, status: "Aktif" },
  { id: "sup2", nama: "PT Kemasan Prima", produk: "Botol & Sachet", kontak: "0813xxxxxxx", totalPembelian: 6200000, status: "Aktif" },
  { id: "sup3", nama: "UD Bahan Skincare Jaya", produk: "Bahan Serum", kontak: "0857xxxxxxx", totalPembelian: 7700000, status: "Non-aktif" },
];

// ---------- Rekening ----------
export const accountKpis: KpiDatum[] = [
  { id: "ac1", label: "Total Saldo Semua Rekening", value: "Rp94.580.000", delta: "+3.8%", trend: "up", icon: "Landmark", accent: "primary" },
  { id: "ac2", label: "Rekening Aktif", value: "4", icon: "Wallet", accent: "secondary" },
  { id: "ac3", label: "Rata-rata Arus Masuk", value: "Rp5.319.750", delta: "+6.7%", trend: "up", icon: "ArrowDownToLine", accent: "success" },
  { id: "ac4", label: "Rata-rata Arus Keluar", value: "Rp2.104.750", delta: "-3.4%", trend: "down", icon: "ArrowUpFromLine", accent: "danger" },
];

export interface AccountRow extends GenericRow {
  bank: string;
  nomor: string;
  atasNama: string;
  saldo: number;
}

export const accountRows: AccountRow[] = [
  { id: "ar1", bank: "BCA", nomor: "•••• 4821", atasNama: "Nopa Setiyoko Baskoro", saldo: 18450000 },
  { id: "ar2", bank: "BRI", nomor: "•••• 1190", atasNama: "DVN Collagen Official", saldo: 24310000 },
  { id: "ar3", bank: "Mandiri", nomor: "•••• 7734", atasNama: "Dana Pernikahan", saldo: 42000000 },
  { id: "ar4", bank: "SeaBank", nomor: "•••• 0056", atasNama: "Ais Beauty Reserve", saldo: 9820000 },
];

// ---------- Budget ----------
export const budgetKpis: KpiDatum[] = [
  { id: "bu1", label: "Total Budget Bulan Ini", value: "Rp99.500.000", icon: "CreditCard", accent: "primary" },
  { id: "bu2", label: "Terpakai", value: "Rp54.150.000", delta: "54%", trend: "up", icon: "Wallet", accent: "warning" },
  { id: "bu3", label: "Sisa Budget", value: "Rp45.350.000", icon: "PiggyBank", accent: "success" },
  { id: "bu4", label: "Kategori Over Budget", value: "1", icon: "AlertTriangle", accent: "danger" },
];

export interface BudgetRow extends GenericRow {
  kategori: string;
  alokasi: number;
  terpakai: number;
  sisa: number;
}

export const budgetRows: BudgetRow[] = [
  { id: "bg1", kategori: "Marketing / Ads", alokasi: 5000000, terpakai: 4100000, sisa: 900000 },
  { id: "bg2", kategori: "Bahan Baku Produk", alokasi: 8000000, terpakai: 6200000, sisa: 1800000 },
  { id: "bg3", kategori: "Kebutuhan Pribadi", alokasi: 2500000, terpakai: 1850000, sisa: 650000 },
  { id: "bg4", kategori: "Persiapan Pernikahan", alokasi: 84000000, terpakai: 42000000, sisa: 42000000 },
];

// ---------- Investasi ----------
export const investmentKpis: KpiDatum[] = [
  { id: "in1", label: "Total Investasi", value: "Rp7.450.000", delta: "+2.1%", trend: "up", icon: "LineChart", accent: "primary" },
  { id: "in2", label: "Reksadana", value: "Rp4.200.000", delta: "+1.8%", trend: "up", icon: "PieChart", accent: "success" },
  { id: "in3", label: "Saham", value: "Rp2.750.000", delta: "+3.4%", trend: "up", icon: "TrendingUp", accent: "warning" },
  { id: "in4", label: "Emas", value: "Rp500.000", delta: "+0.6%", trend: "up", icon: "Coins", accent: "secondary" },
];

export interface InvestmentRow extends GenericRow {
  instrumen: string;
  platform: string;
  nilai: number;
  imbalHasil: string;
}

export const investmentRows: InvestmentRow[] = [
  { id: "iv1", instrumen: "Reksadana Pasar Uang", platform: "Bibit", nilai: 2500000, imbalHasil: "+4.2%" },
  { id: "iv2", instrumen: "Reksadana Saham", platform: "Bibit", nilai: 1700000, imbalHasil: "+6.8%" },
  { id: "iv3", instrumen: "Saham BBCA", platform: "Ajaib", nilai: 1500000, imbalHasil: "+2.1%" },
  { id: "iv4", instrumen: "Saham TLKM", platform: "Ajaib", nilai: 1250000, imbalHasil: "+1.3%" },
  { id: "iv5", instrumen: "Emas Digital", platform: "Pegadaian", nilai: 500000, imbalHasil: "+0.6%" },
];

// ---------- Aset ----------
export const assetKpis: KpiDatum[] = [
  { id: "as1", label: "Total Nilai Aset", value: "Rp312.500.000", icon: "Home", accent: "primary" },
  { id: "as2", label: "Aset Properti", value: "Rp250.000.000", icon: "Building", accent: "secondary" },
  { id: "as3", label: "Kendaraan", value: "Rp42.000.000", icon: "Car", accent: "warning" },
  { id: "as4", label: "Elektronik & Lainnya", value: "Rp20.500.000", icon: "Laptop", accent: "success" },
];

export interface AssetRow extends GenericRow {
  nama: string;
  kategori: string;
  nilai: number;
  kondisi: string;
}

export const assetRows: AssetRow[] = [
  { id: "at1", nama: "Rumah Kalasan, Sleman", kategori: "Properti", nilai: 250000000, kondisi: "Baik" },
  { id: "at2", nama: "Honda Vario 160", kategori: "Kendaraan", nilai: 24000000, kondisi: "Baik" },
  { id: "at3", nama: "Mobil Toyota Calya", kategori: "Kendaraan", nilai: 18000000, kondisi: "Baik" },
  { id: "at4", nama: "MacBook Air M2", kategori: "Elektronik", nilai: 14500000, kondisi: "Baik" },
  { id: "at5", nama: "Kamera Sony A6400", kategori: "Elektronik", nilai: 6000000, kondisi: "Baik" },
];

// ---------- Target ----------
export const goalKpis: KpiDatum[] = [
  { id: "gl1", label: "Target Pernikahan", value: "62%", delta: "Rp42jt / Rp84jt", trend: "up", icon: "HeartHandshake", accent: "warning" },
  { id: "gl2", label: "Dana Darurat", value: "91%", delta: "Rp18.2jt / Rp20jt", trend: "up", icon: "ShieldCheck", accent: "success" },
  { id: "gl3", label: "Renovasi Rumah", value: "24%", delta: "Rp12jt / Rp50jt", trend: "up", icon: "Home", accent: "primary" },
  { id: "gl4", label: "Dana Pendidikan", value: "8%", delta: "Rp4jt / Rp50jt", trend: "up", icon: "GraduationCap", accent: "secondary" },
];

export interface GoalRow extends GenericRow {
  target: string;
  targetTanggal: string;
  terkumpul: number;
  totalTarget: number;
  progress: string;
}

export const goalRows: GoalRow[] = [
  { id: "go1", target: "Dana Pernikahan", targetTanggal: "14 Agu 2026", terkumpul: 42000000, totalTarget: 84000000, progress: "62%" },
  { id: "go2", target: "Dana Darurat", targetTanggal: "Berkelanjutan", terkumpul: 18200000, totalTarget: 20000000, progress: "91%" },
  { id: "go3", target: "Renovasi Rumah", targetTanggal: "Des 2027", terkumpul: 12000000, totalTarget: 50000000, progress: "24%" },
  { id: "go4", target: "Dana Pendidikan Anak", targetTanggal: "2032", terkumpul: 4000000, totalTarget: 50000000, progress: "8%" },
];

// ---------- Laporan ----------
export const reportKpis: KpiDatum[] = [
  { id: "rp1", label: "Laporan Tersedia", value: "18", icon: "FileBarChart2", accent: "primary" },
  { id: "rp2", label: "Laporan Bulan Ini", value: "3", icon: "FileCheck2", accent: "success" },
  { id: "rp3", label: "Terjadwal Otomatis", value: "5", icon: "CalendarClock", accent: "secondary" },
  { id: "rp4", label: "Format Export", value: "PDF, Excel", icon: "Download", accent: "warning" },
];

export interface ReportRow extends GenericRow {
  nama: string;
  periode: string;
  dibuat: string;
  tipe: string;
}

export const reportRows: ReportRow[] = [
  { id: "rr1", nama: "Laporan Keuangan Juni 2026", periode: "Jun 2026", dibuat: "01 Jul 2026", tipe: "Bulanan" },
  { id: "rr2", nama: "Laporan Penjualan Q2 2026", periode: "Apr–Jun 2026", dibuat: "02 Jul 2026", tipe: "Kuartalan" },
  { id: "rr3", nama: "Laporan Budget vs Realisasi", periode: "Jun 2026", dibuat: "03 Jul 2026", tipe: "Bulanan" },
  { id: "rr4", nama: "Laporan Arus Kas Semester 1", periode: "Jan–Jun 2026", dibuat: "05 Jul 2026", tipe: "Semesteran" },
];
