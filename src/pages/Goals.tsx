import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { formatCurrency } from "@/utils/format";
import { Progress } from "@/components/ui/Progress";
import { goalKpis, goalRows, type GoalRow } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

const columns: TableColumn<GoalRow>[] = [
  { key: "target", header: "Target" },
  { key: "targetTanggal", header: "Target Tanggal" },
  { key: "terkumpul", header: "Terkumpul", align: "right", render: (r) => formatCurrency(r.terkumpul) },
  { key: "totalTarget", header: "Total Target", align: "right", render: (r) => formatCurrency(r.totalTarget) },
  {
    key: "progress",
    header: "Progress",
    render: (r) => (
      <div className="flex w-36 items-center gap-2">
        <Progress value={parseInt(r.progress)} />
        <span className="text-xs font-medium text-secondary-500">{r.progress}</span>
      </div>
    ),
  },
];

export default function Goals() {
  return (
    <FinancePageTemplate
      title="Target"
      description="Pantau progres target finansial jangka pendek dan panjang."
      kpis={goalKpis}
      tableTitle="Daftar Target"
      columns={columns}
      rows={goalRows}
      addLabel="Set Target Baru"
    />
  );
}
