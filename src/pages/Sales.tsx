import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { AddSalesOrderDialog } from "@/components/dashboard/AddSalesOrderDialog";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useSalesStore } from "@/store/entityStores";
import type { SalesOrder } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const STATUS_OPTIONS = ["On Proses", "Delivered", "Problem", "Return"];

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  Delivered: "success",
  "On Proses": "warning",
  Problem: "danger",
  Return: "secondary",
};

const kodeLabel: Record<string, string> = { O: "OTS", F: "Follow Up", R: "Repeat" };
const kodeVariant: Record<string, "default" | "warning" | "success"> = { O: "default", F: "warning", R: "success" };

function StatusCell({ row }: { row: SalesOrder }) {
  const updateItem = useSalesStore((s) => s.updateItem);
  return (
    <Select value={row.status} onValueChange={(v) => updateItem(row.id, { status: v })}>
      <SelectTrigger
        className={`h-8 w-[120px] text-xs ${
          row.status === "Delivered"
            ? "border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
            : row.status === "Problem"
            ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400"
            : row.status === "Return"
            ? "border-secondary-200 bg-secondary-100 text-secondary-700 dark:border-secondary-700 dark:bg-secondary-800"
            : "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400"
        }`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const columns: TableColumn<SalesOrder>[] = [
  { key: "tanggal", header: "Tanggal" },
  { key: "cs", header: "CS" },
  { key: "namaCustomer", header: "Customer" },
  { key: "noWa", header: "No. WA", render: (r) => r.noWa || "-" },
  {
    key: "kode",
    header: "Kode",
    align: "center",
    render: (r) => <Badge variant={kodeVariant[r.kode] ?? "default"}>{kodeLabel[r.kode] ?? r.kode}</Badge>,
  },
  { key: "platform", header: "Platform" },
  { key: "metodePembayaran", header: "Metode Bayar" },
  { key: "ekspedis", header: "Ekspedisi" },
  { key: "produk", header: "Produk" },
  { key: "box", header: "Box/Sachet", align: "center" },
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
    render: (r) => <StatusCell row={r} />,
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
        Data ini otomatis terhubung ke <strong className="mx-1">Keuangan Bisnis</strong>,{" "}
        <strong className="mx-1">Customer</strong>, dan <strong className="mx-1">Stok & Return</strong> — klik dropdown Status untuk update progres order.
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
