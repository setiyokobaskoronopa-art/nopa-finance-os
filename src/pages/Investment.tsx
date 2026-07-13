import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { investmentKpis, investmentRows, type InvestmentRow } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<InvestmentRow>[] = [
  { key: "instrumen", header: "Instrumen" },
  { key: "platform", header: "Platform" },
  { key: "nilai", header: "Nilai", align: "right", render: (r) => formatCurrency(r.nilai) },
  {
    key: "imbalHasil",
    header: "Imbal Hasil",
    align: "right",
    render: (r) => <Badge variant="success">{r.imbalHasil}</Badge>,
  },
];

export default function Investment() {
  return (
    <FinancePageTemplate
      title="Investasi"
      description="Pantau portofolio reksadana, saham, dan emas Anda."
      kpis={investmentKpis}
      tableTitle="Portofolio Investasi"
      columns={columns}
      rows={investmentRows}
      addLabel="Tambah Investasi"
    />
  );
}
