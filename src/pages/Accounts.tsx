import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { accountKpis, accountRows, type AccountRow } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<AccountRow>[] = [
  { key: "bank", header: "Bank" },
  { key: "nomor", header: "No. Rekening" },
  { key: "atasNama", header: "Atas Nama" },
  { key: "saldo", header: "Saldo", align: "right", render: (r) => formatCurrency(r.saldo) },
];

export default function Accounts() {
  return (
    <FinancePageTemplate
      title="Rekening"
      description="Kelola semua rekening bank pribadi dan bisnis Anda."
      kpis={accountKpis}
      tableTitle="Daftar Rekening"
      columns={columns}
      rows={accountRows}
      addLabel="Tambah Rekening"
    />
  );
}
