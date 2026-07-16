import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { TableFilterBar, FILTER_ALL } from "@/components/shared/TableFilterBar";
import { formatCurrency, formatDateSlash, parseDateSlash } from "@/utils/format";
import { sortByTanggalDesc } from "@/utils/sortByDate";
import { Badge } from "@/components/ui/Badge";
import { usePersonalTxStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import type { PersonalTx } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const KATEGORI_OPTIONS = ["Kebutuhan Harian", "Transportasi", "Cicilan", "Tabungan", "Pemasukan", "Lainnya", "Prive dari Bisnis"];
const JENIS_OPTIONS = ["Keluar", "Masuk"];

const fields: FieldConfig[] = [
  { key: "tanggal", label: "Tanggal", type: "date", defaultValue: formatDateSlash(new Date()) },
  { key: "keterangan", label: "Keterangan", placeholder: "Contoh: Belanja bulanan" },
  { key: "kategori", label: "Kategori", options: ["Kebutuhan Harian", "Transportasi", "Cicilan", "Tabungan", "Pemasukan", "Lainnya"] },
  { key: "jumlah", label: "Jumlah (Rp)", type: "number", placeholder: "0" },
  { key: "jenis", label: "Jenis", options: ["Keluar", "Masuk"] },
];

export default function PersonalFinance() {
  const manualRows = usePersonalTxStore((s) => s.items);
  const addItem = usePersonalTxStore((s) => s.addItem);
  const updateItem = usePersonalTxStore((s) => s.updateItem);
  const removeItem = usePersonalTxStore((s) => s.removeItem);
  const businessMutations = useBusinessMutationsStore((s) => s.items);
  const priveMutations = useMemo(
    () => businessMutations.filter((m) => m.kategori === "Prive"),
    [businessMutations]
  );
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const priveRows = useMemo<PersonalTx[]>(
    () =>
      priveMutations.map((m) => ({
        id: `prive-${m.id}`,
        tanggal: m.tanggal,
        keterangan: m.keterangan ? `Prive Bisnis — ${m.keterangan}` : "Prive Bisnis",
        kategori: "Prive dari Bisnis",
        jumlah: m.jumlah,
        jenis: "Masuk",
      })),
    [priveMutations]
  );

  const rows = useMemo(() => [...priveRows, ...manualRows], [priveRows, manualRows]);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState(FILTER_ALL);
  const [jenisFilter, setJenisFilter] = useState(FILTER_ALL);

  const filtersActive =
    Boolean(search) || Boolean(dateFrom) || Boolean(dateTo) || kategoriFilter !== FILTER_ALL || jenisFilter !== FILTER_ALL;
  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setKategoriFilter(FILTER_ALL);
    setJenisFilter(FILTER_ALL);
  };

  const filteredRows = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => r.keterangan.toLowerCase().includes(q));
    }
    if (dateFrom) {
      const from = parseDateSlash(dateFrom);
      result = result.filter((r) => {
        const d = parseDateSlash(r.tanggal);
        return d && from && d.getTime() >= from.getTime();
      });
    }
    if (dateTo) {
      const to = parseDateSlash(dateTo);
      result = result.filter((r) => {
        const d = parseDateSlash(r.tanggal);
        return d && to && d.getTime() <= to.getTime();
      });
    }
    if (kategoriFilter !== FILTER_ALL) result = result.filter((r) => r.kategori === kategoriFilter);
    if (jenisFilter !== FILTER_ALL) result = result.filter((r) => r.jenis === jenisFilter);
    return sortByTanggalDesc(result);
  }, [rows, search, dateFrom, dateTo, kategoriFilter, jenisFilter]);

  const kpis = useMemo<KpiDatum[]>(() => {
    const masuk = rows.filter((r) => r.jenis === "Masuk").reduce((s, r) => s + r.jumlah, 0);
    const keluar = rows.filter((r) => r.jenis === "Keluar").reduce((s, r) => s + r.jumlah, 0);
    const tabungan = rows.filter((r) => r.kategori === "Tabungan").reduce((s, r) => s + r.jumlah, 0);
    return [
      { id: "p1", label: "Saldo Pribadi", value: formatCurrency(masuk - keluar), icon: "Wallet", accent: "primary" },
      { id: "p2", label: "Pengeluaran", value: formatCurrency(keluar), icon: "ArrowDownCircle", accent: "danger" },
      { id: "p3", label: "Tabungan", value: formatCurrency(tabungan), icon: "PiggyBank", accent: "success" },
      { id: "p4", label: "Prive dari Bisnis", value: formatCurrency(priveMutations.reduce((s, m) => s + m.jumlah, 0)), icon: "ArrowLeftRight", accent: "secondary" },
    ];
  }, [rows, priveMutations]);

  const columns: TableColumn<PersonalTx>[] = [
    { key: "tanggal", header: "Tanggal" },
    { key: "keterangan", header: "Keterangan" },
    { key: "kategori", header: "Kategori" },
    { key: "jenis", header: "Jenis", render: (r) => <Badge variant={r.jenis === "Masuk" ? "success" : "danger"}>{r.jenis}</Badge> },
    { key: "jumlah", header: "Jumlah", align: "right", render: (r) => formatCurrency(r.jumlah) },
  ];

  const editingRow = manualRows.find((r) => r.id === editingId) ?? null;
  const initialValues = editingRow
    ? {
        tanggal: editingRow.tanggal,
        keterangan: editingRow.keterangan,
        kategori: editingRow.kategori,
        jumlah: String(editingRow.jumlah),
        jenis: editingRow.jenis,
      }
    : null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpen(true);
  };
  const handleOpenEdit = (row: PersonalTx) => {
    if (row.id.startsWith("prive-")) return;
    setEditingId(row.id);
    setOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Mutasi <strong className="mx-1">Prive</strong> dari halaman Keuangan Bisnis otomatis masuk sebagai pemasukan di sini.
      </div>
      <TableFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari keterangan..."
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selects={[
          { key: "kategori", label: "Kategori", value: kategoriFilter, options: KATEGORI_OPTIONS, onChange: setKategoriFilter },
          { key: "jenis", label: "Jenis", value: jenisFilter, options: JENIS_OPTIONS, onChange: setJenisFilter },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />
      <FinancePageTemplate
        title="Keuangan Pribadi"
        description="Pantau saldo, pengeluaran, dan tabungan pribadi Anda."
        kpis={kpis}
        tableTitle={`Transaksi Pribadi ${filtersActive ? `(${filteredRows.length} hasil filter)` : ""}`}
        columns={columns}
        rows={filteredRows}
        addLabel="Catat Transaksi"
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        canEdit={(row) => !row.id.startsWith("prive-")}
        onDelete={(row) => removeItem(row.id)}
        canDelete={(row) => !row.id.startsWith("prive-")}
        emptyTitle={filtersActive ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi pribadi"}
        emptyDescription={filtersActive ? "Coba ubah atau reset filter kamu." : "Catat transaksi pribadi untuk mulai memantau keuangan Anda."}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Transaksi" : "Catat Transaksi Pribadi"}
        description={editingId ? "Perbarui transaksi pribadi." : "Tambahkan transaksi keuangan pribadi baru."}
        fields={fields}
        submitLabel={editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
        initialValues={initialValues}
        onSubmit={(v) => {
          const jumlah = Number(v.jumlah.replace(/[^0-9]/g, "")) || 0;
          if (editingId) {
            updateItem(editingId, { tanggal: v.tanggal, keterangan: v.keterangan, kategori: v.kategori, jumlah, jenis: v.jenis });
          } else {
            addItem({ tanggal: v.tanggal || formatDateSlash(new Date()), keterangan: v.keterangan, kategori: v.kategori, jumlah, jenis: v.jenis });
          }
        }}
      />
    </>
  );
}
