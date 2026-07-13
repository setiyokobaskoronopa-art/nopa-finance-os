import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { salesKpis, salesOrders, type SalesOrder } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  Selesai: "success",
  Diproses: "warning",
  Dikirim: "default",
};

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
  return (
    <FinancePageTemplate
      title="Penjualan"
      description="Pantau performa penjualan dari semua channel."
      kpis={salesKpis}
      tableTitle="Order Terbaru"
      columns={columns}
      rows={salesOrders}
      addLabel="Buat Order"
    />
  );
}
