import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { assetKpis, assetRows, type AssetRow } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<AssetRow>[] = [
  { key: "nama", header: "Nama Aset" },
  { key: "kategori", header: "Kategori" },
  { key: "nilai", header: "Estimasi Nilai", align: "right", render: (r) => formatCurrency(r.nilai) },
  { key: "kondisi", header: "Kondisi", align: "center", render: (r) => <Badge variant="success">{r.kondisi}</Badge> },
];

export default function Assets() {
  return (
    <FinancePageTemplate
      title="Aset"
      description="Kelola daftar aset properti, kendaraan, dan elektronik."
      kpis={assetKpis}
      tableTitle="Daftar Aset"
      columns={columns}
      rows={assetRows}
      addLabel="Tambah Aset"
    />
  );
}
