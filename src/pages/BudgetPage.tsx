import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Progress } from "@/components/ui/Progress";
import { budgetKpis, budgetRows, type BudgetRow } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<BudgetRow>[] = [
  { key: "kategori", header: "Kategori" },
  { key: "alokasi", header: "Alokasi", align: "right", render: (r) => formatCurrency(r.alokasi) },
  { key: "terpakai", header: "Terpakai", align: "right", render: (r) => formatCurrency(r.terpakai) },
  { key: "sisa", header: "Sisa", align: "right", render: (r) => formatCurrency(r.sisa) },
  {
    key: "id",
    header: "Progress",
    render: (r) => (
      <div className="w-32">
        <Progress value={Math.round((r.terpakai / r.alokasi) * 100)} />
      </div>
    ),
  },
];

export default function BudgetPage() {
  return (
    <FinancePageTemplate
      title="Budget"
      description="Atur dan pantau alokasi budget per kategori."
      kpis={budgetKpis}
      tableTitle="Alokasi Budget Bulan Ini"
      columns={columns}
      rows={budgetRows}
      addLabel="Buat Budget"
    />
  );
}
