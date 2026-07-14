import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { Button } from "@/components/ui/Button";
import { useReportsStore } from "@/store/entityStores";
import type { ReportRow } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";
import { formatDateShort } from "@/utils/format";

const fields: FieldConfig[] = [
  { key: "nama", label: "Nama Laporan", placeholder: "Contoh: Laporan Keuangan Juli 2026" },
  { key: "periode", label: "Periode", placeholder: "Contoh: Jul 2026" },
  { key: "tipe", label: "Tipe", options: ["Bulanan", "Kuartalan", "Semesteran", "Tahunan"] },
];

const columns: TableColumn<ReportRow>[] = [
  {
    key: "nama",
    header: "Nama Laporan",
    render: (r) => (
      <div className="flex items-center gap-2">
        <FileText size={15} className="text-primary-500" />
        {r.nama}
      </div>
    ),
  },
  { key: "periode", header: "Periode" },
  { key: "tipe", header: "Tipe" },
  { key: "dibuat", header: "Dibuat" },
  {
    key: "id",
    header: "Aksi",
    align: "right",
    render: () => (
      <Button variant="ghost" size="sm">
        <Download size={14} /> Unduh
      </Button>
    ),
  },
];

export default function Reports() {
  const rows = useReportsStore((s) => s.items);
  const addItem = useReportsStore((s) => s.addItem);
  const removeItem = useReportsStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const thisMonth = rows.filter((r) => r.dibuat === formatDateShort(new Date())).length;
    return [
      { id: "rp1", label: "Laporan Tersedia", value: String(rows.length), icon: "FileBarChart2", accent: "primary" },
      { id: "rp2", label: "Dibuat Hari Ini", value: String(thisMonth), icon: "FileCheck2", accent: "success" },
      { id: "rp3", label: "Terjadwal Otomatis", value: "0", icon: "CalendarClock", accent: "secondary" },
      { id: "rp4", label: "Format Export", value: "PDF, Excel", icon: "Download", accent: "warning" },
    ];
  }, [rows]);

  return (
    <>
      <FinancePageTemplate
        title="Laporan"
        description="Akses dan unduh laporan keuangan otomatis Anda."
        kpis={kpis}
        tableTitle="Riwayat Laporan"
        columns={columns}
        rows={rows}
        addLabel="Buat Laporan"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada laporan"
        emptyDescription="Buat laporan pertama Anda untuk diunduh kapan saja."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Buat Laporan"
        description="Buat laporan keuangan baru berdasarkan periode tertentu."
        fields={fields}
        submitLabel="Buat Laporan"
        onSubmit={(v) => {
          addItem({ nama: v.nama, periode: v.periode, tipe: v.tipe, dibuat: formatDateShort(new Date()) });
        }}
      />
    </>
  );
}
