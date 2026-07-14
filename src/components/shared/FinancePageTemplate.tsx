import type { ReactNode } from "react";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { GenericRow, KpiDatum, TableColumn } from "@/types/finance";

interface FinancePageTemplateProps<T extends GenericRow> {
  title: string;
  description: string;
  kpis: KpiDatum[];
  chart?: ReactNode;
  chartTitle?: string;
  tableTitle: string;
  columns: TableColumn<T>[];
  rows: T[];
  addLabel?: string;
  onAdd?: () => void;
  onDelete?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FinancePageTemplate<T extends GenericRow>({
  title,
  description,
  kpis,
  chart,
  chartTitle,
  tableTitle,
  columns,
  rows,
  addLabel = "Tambah Data",
  onAdd,
  onDelete,
  emptyTitle,
  emptyDescription,
}: FinancePageTemplateProps<T>) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download size={15} /> Export
            </Button>
            <Button size="sm" onClick={onAdd}>
              <Plus size={15} /> {addLabel}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      {chart && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{chartTitle}</CardTitle>
            </CardHeader>
            <CardContent>{chart}</CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{tableTitle}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              rows={rows}
              onDelete={onDelete}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
