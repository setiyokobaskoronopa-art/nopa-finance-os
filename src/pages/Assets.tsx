import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useAssetsStore } from "@/store/entityStores";
import type { AssetRow } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "nama", label: "Nama Aset", placeholder: "Contoh: Rumah Kalasan, Sleman" },
  { key: "kategori", label: "Kategori", options: ["Properti", "Kendaraan", "Elektronik", "Lainnya"] },
  { key: "nilai", label: "Estimasi Nilai (Rp)", type: "number", placeholder: "0" },
  { key: "kondisi", label: "Kondisi", options: ["Baik", "Cukup", "Perlu Perbaikan"] },
];

const columns: TableColumn<AssetRow>[] = [
  { key: "nama", header: "Nama Aset" },
  { key: "kategori", header: "Kategori" },
  { key: "nilai", header: "Estimasi Nilai", align: "right", render: (r) => formatCurrency(r.nilai) },
  { key: "kondisi", header: "Kondisi", align: "center", render: (r) => <Badge variant="success">{r.kondisi}</Badge> },
];

export default function Assets() {
  const rows = useAssetsStore((s) => s.items);
  const addItem = useAssetsStore((s) => s.addItem);
  const removeItem = useAssetsStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const total = rows.reduce((s, r) => s + r.nilai, 0);
    const byCategory = (cat: string) => rows.filter((r) => r.kategori === cat).reduce((s, r) => s + r.nilai, 0);
    return [
      { id: "as1", label: "Total Nilai Aset", value: formatCurrency(total), icon: "Home", accent: "primary" },
      { id: "as2", label: "Aset Properti", value: formatCurrency(byCategory("Properti")), icon: "Building", accent: "secondary" },
      { id: "as3", label: "Kendaraan", value: formatCurrency(byCategory("Kendaraan")), icon: "Car", accent: "warning" },
      { id: "as4", label: "Elektronik & Lainnya", value: formatCurrency(byCategory("Elektronik") + byCategory("Lainnya")), icon: "Laptop", accent: "success" },
    ];
  }, [rows]);

  return (
    <>
      <FinancePageTemplate
        title="Aset"
        description="Kelola daftar aset properti, kendaraan, dan elektronik."
        kpis={kpis}
        tableTitle="Daftar Aset"
        columns={columns}
        rows={rows}
        addLabel="Tambah Aset"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada aset"
        emptyDescription="Tambahkan aset untuk mulai memantau kekayaan Anda."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Tambah Aset"
        description="Tambahkan aset baru ke daftar kekayaan Anda."
        fields={fields}
        submitLabel="Simpan Aset"
        onSubmit={(v) => {
          const nilai = Number(v.nilai.replace(/[^0-9]/g, "")) || 0;
          addItem({ nama: v.nama, kategori: v.kategori, nilai, kondisi: v.kondisi });
        }}
      />
    </>
  );
}
