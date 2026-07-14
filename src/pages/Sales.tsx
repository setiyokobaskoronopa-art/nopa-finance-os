import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { AddSalesOrderDialog } from "@/components/dashboard/AddSalesOrderDialog";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useSalesStore } from "@/store/entityStores";
import type { SalesOrder } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const statusVariant: Record<string, "success" | "warning"> = {
  Delivered: "success",
  "On Proses": "warning",
};

const columns: TableColumn<SalesOrder>[] = [
  { key: "tanggal", header: "Tanggal" },
  { key: "cs", header: "CS" },
  { key: "namaCustomer", header: "Customer" },
  { key: "kode", header: "Kode", align: "center" },
  { key: "ekspedis", header: "Ekspedis" },
  { key: "produk", header: "Produk" },
  { key: "box", header: "Box", align: "center" },
  { key: "hargaTotalProduk", header: "Harga Total Produk", align: "right", render: (r) => formatCurrency(r.hargaTotalProduk) },
  { key: "diskonOngkir", header: "Diskon Ongkir", align: "right", render: (r) => formatCurrency(r.diskonOngkir) },
  { key: "totalCustomerBayar", header: "Total Customer Bayar", align: "right", render: (r) => formatCurrency(r.totalCustomerBayar) },
  { key: "biayaCod", header: "Biaya COD 3%", align: "right", render: (r) => (r.biayaCod ? formatCurrency(r.biayaCod) : "-") },
  { key: "pajakCod", header: "Pajak COD 0,33%", align: "right", render: (r) => (r.pajakCod ? formatCurrency(r.pajakCod) : "-") },
  { key: "cashIn", header: "Cash In", align: "right", render: (r) => formatCurrency(r.cashIn) },
  { key: "hpp", header: "HPP", align: "right", render: (r) => formatCurrency(r.hpp) },
  {
    key: "grossProvit",
    header: "Gross Provit",
    align: "right",
    render: (r) => <span className="font-semibold text-success-600">{formatCurrency(r.grossProvit)}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>,
  },
];

export default function Sales() {
  const orders = useSalesStore((s) => s.items);
  const removeItem = useSalesStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const totalBayar = orders.reduce((s, o) => s + o.totalCustomerBayar, 0);
    const totalProvit = orders.reduce((s, o) => s + o.grossProvit, 0);
    const count = orders.length;
    const aov = count > 0 ? totalBayar / count : 0;
    return [
      { id: "s1", label: "Total Penjualan", value: formatCurrency(totalBayar), icon: "TrendingUp", accent: "primary" },
      { id: "s2", label: "Jumlah Order", value: String(count), icon: "ShoppingBag", accent: "success" },
      { id: "s3", label: "AOV (Rata-rata Order)", value: formatCurrency(aov), icon: "Receipt", accent: "secondary" },
      { id: "s4", label: "Total Gross Provit", value: formatCurrency(totalProvit), icon: "TrendingUp", accent: "success" },
    ];
  }, [orders]);

  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Data ini otomatis terhubung ke halaman <strong className="mx-1">Keuangan Bisnis</strong> — setiap order baru langsung memperbarui omzet dan laba di sana.
      </div>
      <FinancePageTemplate
        title="Penjualan"
        description="Pantau performa penjualan dari semua channel."
        kpis={kpis}
        tableTitle="Order Terbaru"
        columns={columns}
        rows={orders}
        addLabel="Buat Order"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada order"
        emptyDescription="Order penjualan yang kamu buat akan muncul di sini."
      />
      <AddSalesOrderDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
