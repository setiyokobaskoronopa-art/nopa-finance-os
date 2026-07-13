import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { personalKpis, personalTransactions, type PersonalTx } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<PersonalTx>[] = [
  { key: "tanggal", header: "Tanggal" },
  { key: "keterangan", header: "Keterangan" },
  { key: "kategori", header: "Kategori" },
  {
    key: "jenis",
    header: "Jenis",
    render: (row) => (
      <Badge variant={row.jenis === "Masuk" ? "success" : "danger"}>{row.jenis}</Badge>
    ),
  },
  {
    key: "jumlah",
    header: "Jumlah",
    align: "right",
    render: (row) => formatCurrency(row.jumlah),
  },
];

export default function PersonalFinance() {
  return (
    <FinancePageTemplate
      title="Keuangan Pribadi"
      description="Pantau saldo, pengeluaran, dan tabungan pribadi Anda."
      kpis={personalKpis}
      tableTitle="Transaksi Pribadi Terbaru"
      columns={columns}
      rows={personalTransactions}
      addLabel="Catat Transaksi"
    />
  );
}
