import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useSalesStore } from "@/store/entityStores";
import type { SalesOrder } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";
import { formatDateShort } from "@/utils/format";

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  Selesai: "success",
  Diproses: "warning",
  Dikirim: "default",
};

const fields: FieldConfig[] = [
  { key: "customer", label: "Nama Customer", placeholder: "Contoh: Rina A." },
  { key: "channel", label: "Channel", options: ["Shopee", "Tokopedia", "Website", "Reseller"] },
  { key: "total", label: "Total (Rp)", type: "number", placeholder: "0" },
  { key: "status", label: "Status", options: ["Diproses", "Dikirim", "Selesai"] },
];

const columns: TableColumn<SalesOrder>[] = [
  { key: "order", header: "No. Order" },
  { key: "channel", header: "Channel" },
  { key: "customer", header: "Customer" },
  { key: "tanggal", header: "Tanggal" },
  { key: "total", header: "Total", align: "right", render: (r) => formatCurrency(r.total) },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>,
  },
];

export default function Sales() {
  const orders = useSalesStore((s) => s.items);
  const addItem = useSalesStore((s) => s.addItem);
  const removeItem = useSalesStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const total = orders.reduce((s, o) => s + o.total, 0);
    const count = orders.length;
    const aov = count > 0 ? total / count : 0;
    return [
      { id: "s1", label: "Total Penjualan", value: formatCurrency(total), icon: "TrendingUp", accent: "primary" },
      { id: "s2", label: "Jumlah Order", value: String(count), icon: "ShoppingBag", accent: "success" },
      { id: "s3", label: "AOV (Rata-rata Order)", value: formatCurrency(aov), icon: "Receipt", accent: "secondary" },
      { id: "s4", label: "Refund Rate", value: "0%", icon: "Undo2", accent: "danger" },
    ];
  }, [orders]);

  return (
    <>
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
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Buat Order Baru"
        description="Catat order penjualan baru dari channel manapun."
        fields={fields}
        submitLabel="Simpan Order"
        onSubmit={(v) => {
          const total = Number(v.total.replace(/[^0-9]/g, "")) || 0;
          addItem({
            order: `#INV-${Math.floor(1000 + Math.random() * 9000)}`,
            channel: v.channel,
            customer: v.customer,
            tanggal: formatDateShort(new Date()),
            total,
            status: v.status,
          });
        }}
      />
    </>
  );
}
