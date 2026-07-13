import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency, formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { productKpis, products, type ProductItem } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<ProductItem>[] = [
  { key: "nama", header: "Nama Produk" },
  { key: "kategori", header: "Kategori" },
  {
    key: "stok",
    header: "Stok",
    align: "center",
    render: (r) => (
      <Badge variant={r.stok <= 10 ? "danger" : "success"}>{formatNumber(r.stok)}</Badge>
    ),
  },
  { key: "harga", header: "Harga", align: "right", render: (r) => formatCurrency(r.harga) },
  { key: "terjual", header: "Terjual", align: "right", render: (r) => formatNumber(r.terjual) },
];

export default function Products() {
  return (
    <FinancePageTemplate
      title="Produk"
      description="Kelola katalog dan stok produk DVN Collagen & Ais Beauty."
      kpis={productKpis}
      tableTitle="Daftar Produk"
      columns={columns}
      rows={products}
      addLabel="Tambah Produk"
    />
  );
}
