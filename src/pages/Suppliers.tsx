import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { supplierKpis, suppliers, type SupplierItem } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<SupplierItem>[] = [
  { key: "nama", header: "Nama Supplier" },
  { key: "produk", header: "Produk" },
  { key: "kontak", header: "Kontak" },
  { key: "totalPembelian", header: "Total Pembelian", align: "right", render: (r) => formatCurrency(r.totalPembelian) },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={r.status === "Aktif" ? "success" : "secondary"}>{r.status}</Badge>,
  },
];

export default function Suppliers() {
  return (
    <FinancePageTemplate
      title="Supplier"
      description="Kelola daftar supplier dan riwayat pembelian bahan baku."
      kpis={supplierKpis}
      tableTitle="Daftar Supplier"
      columns={columns}
      rows={suppliers}
      addLabel="Tambah Supplier"
    />
  );
}
