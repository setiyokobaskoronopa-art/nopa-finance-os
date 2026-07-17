import { useMemo, useState } from "react";
import { Download, FileText, Sparkles } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useReportsStore } from "@/store/entityStores";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { computeMonthlySnapshot, monthLabel } from "@/utils/monthlyReportSnapshot";
import { downloadReportExcel } from "@/utils/exportReportXlsx";
import type { ReportRow } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";
import { formatDateSlash } from "@/utils/format";

// 12 bulan terakhir buat pilihan periode
function buildMonthOptions(): { label: string; month: number; year: number }[] {
  const now = new Date();
  const opts = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({ label: monthLabel(d.getMonth(), d.getFullYear()), month: d.getMonth(), year: d.getFullYear() });
  }
  return opts;
}

export default function Reports() {
  const rows = useReportsStore((s) => s.items);
  const addItem = useReportsStore((s) => s.addItem);
  const updateItem = useReportsStore((s) => s.updateItem);
  const removeItem = useReportsStore((s) => s.removeItem);
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const transactions = useTransactionsStore((s) => s.transactions);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const monthOptions = useMemo(buildMonthOptions, []);
  const fields: FieldConfig[] = [
    { key: "nama", label: "Nama Laporan", placeholder: "Contoh: Laporan Keuangan Juli 2026" },
    { key: "periode", label: "Periode", options: monthOptions.map((m) => m.label) },
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
    {
      key: "tipe",
      header: "Tipe",
      render: (r) =>
        r.tipe.includes("Otomatis") ? (
          <Badge variant="success" className="gap-1">
            <Sparkles size={11} /> {r.tipe}
          </Badge>
        ) : (
          r.tipe
        ),
    },
    { key: "dibuat", header: "Dibuat" },
    {
      key: "id",
      header: "Unduh",
      align: "right",
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!r.snapshotData}
          onClick={() => r.snapshotData && downloadReportExcel(r.nama, r.periode, r.snapshotData)}
        >
          <Download size={14} /> {r.snapshotData ? "Unduh" : "Data n/a"}
        </Button>
      ),
    },
  ];

  const kpis = useMemo<KpiDatum[]>(() => {
    const otomatis = rows.filter((r) => r.tipe.includes("Otomatis")).length;
    return [
      { id: "rp1", label: "Laporan Tersedia", value: String(rows.length), icon: "FileBarChart2", accent: "primary" },
      { id: "rp2", label: "Dibuat Otomatis", value: String(otomatis), icon: "Sparkles", accent: "success", footnote: "Muncul otomatis tiap ganti bulan" },
      { id: "rp3", label: "Bisa Diunduh", value: String(rows.filter((r) => r.snapshotData).length), icon: "Download", accent: "warning" },
      { id: "rp4", label: "Format Export", value: "Excel (.xlsx)", icon: "FileText", accent: "secondary" },
    ];
  }, [rows]);

  const editingRow = rows.find((r) => r.id === editingId) ?? null;
  const initialValues = editingRow
    ? { nama: editingRow.nama, periode: editingRow.periode, tipe: editingRow.tipe }
    : null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpen(true);
  };
  const handleOpenEdit = (row: ReportRow) => {
    setEditingId(row.id);
    setOpen(true);
  };

  return (
    <>
      <FinancePageTemplate
        title="Laporan"
        description="Laporan bulanan otomatis muncul tiap ganti bulan, atau buat manual kapan saja."
        kpis={kpis}
        tableTitle="Riwayat Laporan"
        columns={columns}
        rows={rows}
        addLabel="Buat Laporan"
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada laporan"
        emptyDescription="Laporan bulanan otomatis akan muncul di sini begitu ada data penjualan. Atau buat manual sekarang."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Laporan" : "Buat Laporan"}
        description={
          editingId
            ? "Perbarui detail laporan."
            : "Pilih bulan — data (omzet, profit, pengeluaran, dll) otomatis dihitung dan bisa langsung diunduh."
        }
        fields={fields}
        submitLabel={editingId ? "Simpan Perubahan" : "Buat Laporan"}
        initialValues={initialValues}
        onSubmit={(v) => {
          if (editingId) {
            updateItem(editingId, { nama: v.nama, periode: v.periode, tipe: v.tipe });
            return;
          }
          const picked = monthOptions.find((m) => m.label === v.periode) ?? monthOptions[0];
          const snapshot = computeMonthlySnapshot(picked.month, picked.year, orders, mutations, transactions);
          addItem({
            nama: v.nama,
            periode: v.periode,
            tipe: v.tipe,
            dibuat: formatDateSlash(new Date()),
            snapshotData: snapshot,
            periodeMonth: picked.month,
            periodeYear: picked.year,
          });
        }}
      />
    </>
  );
}
