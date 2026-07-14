import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency } from "@/utils/format";
import { Progress } from "@/components/ui/Progress";
import { useBudgetStore } from "@/store/entityStores";
import type { BudgetRow } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "kategori", label: "Kategori", placeholder: "Contoh: Marketing / Ads" },
  { key: "alokasi", label: "Alokasi Budget (Rp)", type: "number", placeholder: "0" },
  { key: "terpakai", label: "Sudah Terpakai (Rp)", type: "number", placeholder: "0", defaultValue: "0" },
];

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
        <Progress value={r.alokasi > 0 ? Math.min(100, Math.round((r.terpakai / r.alokasi) * 100)) : 0} />
      </div>
    ),
  },
];

export default function BudgetPage() {
  const rows = useBudgetStore((s) => s.items);
  const addItem = useBudgetStore((s) => s.addItem);
  const removeItem = useBudgetStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const totalAlokasi = rows.reduce((s, r) => s + r.alokasi, 0);
    const totalTerpakai = rows.reduce((s, r) => s + r.terpakai, 0);
    const over = rows.filter((r) => r.terpakai > r.alokasi).length;
    return [
      { id: "bu1", label: "Total Budget", value: formatCurrency(totalAlokasi), icon: "CreditCard", accent: "primary" },
      { id: "bu2", label: "Terpakai", value: formatCurrency(totalTerpakai), icon: "Wallet", accent: "warning" },
      { id: "bu3", label: "Sisa Budget", value: formatCurrency(Math.max(0, totalAlokasi - totalTerpakai)), icon: "PiggyBank", accent: "success" },
      { id: "bu4", label: "Kategori Over Budget", value: String(over), icon: "AlertTriangle", accent: "danger" },
    ];
  }, [rows]);

  return (
    <>
      <FinancePageTemplate
        title="Budget"
        description="Atur dan pantau alokasi budget per kategori."
        kpis={kpis}
        tableTitle="Alokasi Budget"
        columns={columns}
        rows={rows}
        addLabel="Buat Budget"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada budget"
        emptyDescription="Buat alokasi budget per kategori untuk mulai memantau pengeluaran."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Buat Budget"
        description="Tentukan alokasi budget untuk kategori tertentu."
        fields={fields}
        submitLabel="Simpan Budget"
        onSubmit={(v) => {
          const alokasi = Number(v.alokasi.replace(/[^0-9]/g, "")) || 0;
          const terpakai = Number(v.terpakai.replace(/[^0-9]/g, "")) || 0;
          addItem({ kategori: v.kategori, alokasi, terpakai, sisa: Math.max(0, alokasi - terpakai) });
        }}
      />
    </>
  );
}
