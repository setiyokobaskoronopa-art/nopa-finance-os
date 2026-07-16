import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useInvestmentStore } from "@/store/entityStores";
import type { InvestmentRow } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "instrumen", label: "Instrumen", placeholder: "Contoh: Reksadana Pasar Uang" },
  { key: "platform", label: "Platform", placeholder: "Contoh: Bibit, Ajaib" },
  { key: "nilai", label: "Nilai (Rp)", type: "number", placeholder: "0" },
  { key: "imbalHasil", label: "Imbal Hasil", placeholder: "Contoh: +4.2%", defaultValue: "+0%" },
];

const columns: TableColumn<InvestmentRow>[] = [
  { key: "instrumen", header: "Instrumen" },
  { key: "platform", header: "Platform" },
  { key: "nilai", header: "Nilai", align: "right", render: (r) => formatCurrency(r.nilai) },
  { key: "imbalHasil", header: "Imbal Hasil", align: "right", render: (r) => <Badge variant="success">{r.imbalHasil}</Badge> },
];

export default function Investment() {
  const rows = useInvestmentStore((s) => s.items);
  const addItem = useInvestmentStore((s) => s.addItem);
  const updateItem = useInvestmentStore((s) => s.updateItem);
  const removeItem = useInvestmentStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const kpis = useMemo<KpiDatum[]>(() => {
    const total = rows.reduce((s, r) => s + r.nilai, 0);
    const reksadana = rows.filter((r) => r.instrumen.toLowerCase().includes("reksadana")).reduce((s, r) => s + r.nilai, 0);
    const saham = rows.filter((r) => r.instrumen.toLowerCase().includes("saham")).reduce((s, r) => s + r.nilai, 0);
    const lainnya = total - reksadana - saham;
    return [
      { id: "in1", label: "Total Investasi", value: formatCurrency(total), icon: "LineChart", accent: "primary" },
      { id: "in2", label: "Reksadana", value: formatCurrency(reksadana), icon: "PieChart", accent: "success" },
      { id: "in3", label: "Saham", value: formatCurrency(saham), icon: "TrendingUp", accent: "warning" },
      { id: "in4", label: "Lainnya", value: formatCurrency(Math.max(0, lainnya)), icon: "Coins", accent: "secondary" },
    ];
  }, [rows]);

  const editingRow = rows.find((r) => r.id === editingId) ?? null;
  const initialValues = editingRow
    ? {
        instrumen: editingRow.instrumen,
        platform: editingRow.platform,
        nilai: String(editingRow.nilai),
        imbalHasil: editingRow.imbalHasil,
      }
    : null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpen(true);
  };
  const handleOpenEdit = (row: InvestmentRow) => {
    setEditingId(row.id);
    setOpen(true);
  };

  return (
    <>
      <FinancePageTemplate
        title="Investasi"
        description="Pantau portofolio reksadana, saham, dan emas Anda."
        kpis={kpis}
        tableTitle="Portofolio Investasi"
        columns={columns}
        rows={rows}
        addLabel="Tambah Investasi"
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada investasi"
        emptyDescription="Tambahkan instrumen investasi untuk mulai memantau portofolio."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Investasi" : "Tambah Investasi"}
        description={editingId ? "Perbarui data instrumen investasi." : "Tambahkan instrumen investasi baru ke portofolio."}
        fields={fields}
        submitLabel={editingId ? "Simpan Perubahan" : "Simpan Investasi"}
        initialValues={initialValues}
        onSubmit={(v) => {
          const nilai = Number(v.nilai.replace(/[^0-9]/g, "")) || 0;
          const payload = { instrumen: v.instrumen, platform: v.platform, nilai, imbalHasil: v.imbalHasil };
          if (editingId) updateItem(editingId, payload);
          else addItem(payload);
        }}
      />
    </>
  );
}
