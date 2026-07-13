import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { businessKpis, businessEntries, type BusinessEntry } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<BusinessEntry>[] = [
  { key: "brand", header: "Brand" },
  { key: "omzet", header: "Omzet", align: "right", render: (r) => formatCurrency(r.omzet) },
  { key: "beban", header: "Beban Operasional", align: "right", render: (r) => formatCurrency(r.beban) },
  { key: "laba", header: "Laba Bersih", align: "right", render: (r) => formatCurrency(r.laba) },
  { key: "margin", header: "Margin", align: "right" },
];

export default function BusinessFinance() {
  return (
    <FinancePageTemplate
      title="Keuangan Bisnis"
      description="Ringkasan performa keuangan DVN Collagen & DVN Ais Beauty."
      kpis={businessKpis}
      tableTitle="Ringkasan per Brand"
      columns={columns}
      rows={businessEntries}
      addLabel="Tambah Brand"
    />
  );
}
