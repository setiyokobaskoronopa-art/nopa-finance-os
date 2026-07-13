import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency, formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { customerKpis, customers, type CustomerItem } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const statusVariant: Record<string, "success" | "warning" | "default" | "secondary"> = {
  VIP: "success",
  Reseller: "default",
  Reguler: "secondary",
  Baru: "warning",
};

const columns: TableColumn<CustomerItem>[] = [
  { key: "nama", header: "Nama" },
  { key: "email", header: "Email" },
  { key: "totalOrder", header: "Total Order", align: "center", render: (r) => formatNumber(r.totalOrder) },
  { key: "totalBelanja", header: "Total Belanja", align: "right", render: (r) => formatCurrency(r.totalBelanja) },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>,
  },
];

export default function Customers() {
  return (
    <FinancePageTemplate
      title="Customer"
      description="Kelola data dan riwayat belanja pelanggan Anda."
      kpis={customerKpis}
      tableTitle="Daftar Customer"
      columns={columns}
      rows={customers}
      addLabel="Tambah Customer"
    />
  );
}
