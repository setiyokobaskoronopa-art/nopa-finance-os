import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency } from "@/utils/format";
import { useBusinessStore } from "@/store/entityStores";
import type { BusinessEntry } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "brand", label: "Nama Brand", placeholder: "Contoh: DVN Collagen" },
  { key: "omzet", label: "Omzet (Rp)", type: "number", placeholder: "0" },
  { key: "beban", label: "Beban Operasional (Rp)", type: "number", placeholder: "0" },
];

const columns: TableColumn<BusinessEntry>[] = [
  { key: "brand", header: "Brand" },
  { key: "omzet", header: "Omzet", align: "right", render: (r) => formatCurrency(r.omzet) },
  { key: "beban", header: "Beban Operasional", align: "right", render: (r) => formatCurrency(r.beban) },
  { key: "laba", header: "Laba Bersih", align: "right", render: (r) => formatCurrency(r.laba) },
  { key: "margin", header: "Margin", align: "right" },
];

export default function BusinessFinance() {
  const entries = useBusinessStore((s) => s.items);
  const addItem = useBusinessStore((s) => s.addItem);
  const removeItem = useBusinessStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const omzet = entries.reduce((s, e) => s + e.omzet, 0);
    const beban = entries.reduce((s, e) => s + e.beban, 0);
    const laba = omzet - beban;
    const margin = omzet > 0 ? `${((laba / omzet) * 100).toFixed(1)}%` : "0%";
    return [
      { id: "b1", label: "Omzet Bisnis", value: formatCurrency(omzet), icon: "Building2", accent: "primary" },
      { id: "b2", label: "Beban Operasional", value: formatCurrency(beban), icon: "Factory", accent: "warning" },
      { id: "b3", label: "Laba Kotor", value: formatCurrency(laba), icon: "TrendingUp", accent: "success" },
      { id: "b4", label: "Margin Laba", value: margin, icon: "Percent", accent: "secondary" },
    ];
  }, [entries]);

  return (
    <>
      <FinancePageTemplate
        title="Keuangan Bisnis"
        description="Ringkasan performa keuangan DVN Collagen & DVN Ais Beauty."
        kpis={kpis}
        tableTitle="Ringkasan per Brand"
        columns={columns}
        rows={entries}
        addLabel="Tambah Brand"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada brand"
        emptyDescription="Tambahkan brand bisnis untuk mulai memantau omzet dan laba."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Tambah Brand"
        description="Tambahkan brand bisnis baru untuk dipantau performanya."
        fields={fields}
        submitLabel="Simpan Brand"
        onSubmit={(v) => {
          const omzet = Number(v.omzet.replace(/[^0-9]/g, "")) || 0;
          const beban = Number(v.beban.replace(/[^0-9]/g, "")) || 0;
          const laba = omzet - beban;
          const margin = omzet > 0 ? `${((laba / omzet) * 100).toFixed(1)}%` : "0%";
          addItem({ brand: v.brand, omzet, beban, laba, margin });
        }}
      />
    </>
  );
}
