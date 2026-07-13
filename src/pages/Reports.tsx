import { Download, FileText } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { Button } from "@/components/ui/Button";
import { reportKpis, reportRows, type ReportRow } from "@/data/pagesDummy";
import type { TableColumn } from "@/types/finance";

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
  return (
    <FinancePageTemplate
      title="Laporan"
      description="Akses dan unduh laporan keuangan otomatis Anda."
      kpis={reportKpis}
      tableTitle="Riwayat Laporan"
      columns={columns}
      rows={reportRows}
      addLabel="Buat Laporan"
    />
  );
}
