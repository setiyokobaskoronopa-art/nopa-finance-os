import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency, formatDateShort } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { usePersonalTxStore } from "@/store/entityStores";
import type { PersonalTx } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "keterangan", label: "Keterangan", placeholder: "Contoh: Belanja bulanan" },
  { key: "kategori", label: "Kategori", options: ["Kebutuhan Harian", "Transportasi", "Cicilan", "Tabungan", "Pemasukan", "Lainnya"] },
  { key: "jumlah", label: "Jumlah (Rp)", type: "number", placeholder: "0" },
  { key: "jenis", label: "Jenis", options: ["Keluar", "Masuk"] },
];

const columns: TableColumn<PersonalTx>[] = [
  { key: "tanggal", header: "Tanggal" },
  { key: "keterangan", header: "Keterangan" },
  { key: "kategori", header: "Kategori" },
  { key: "jenis", header: "Jenis", render: (r) => <Badge variant={r.jenis === "Masuk" ? "success" : "danger"}>{r.jenis}</Badge> },
  { key: "jumlah", header: "Jumlah", align: "right", render: (r) => formatCurrency(r.jumlah) },
];

export default function PersonalFinance() {
  const rows = usePersonalTxStore((s) => s.items);
  const addItem = usePersonalTxStore((s) => s.addItem);
  const removeItem = usePersonalTxStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const masuk = rows.filter((r) => r.jenis === "Masuk").reduce((s, r) => s + r.jumlah, 0);
    const keluar = rows.filter((r) => r.jenis === "Keluar").reduce((s, r) => s + r.jumlah, 0);
    const tabungan = rows.filter((r) => r.kategori === "Tabungan").reduce((s, r) => s + r.jumlah, 0);
    return [
      { id: "p1", label: "Saldo Pribadi", value: formatCurrency(masuk - keluar), icon: "Wallet", accent: "primary" },
      { id: "p2", label: "Pengeluaran", value: formatCurrency(keluar), icon: "ArrowDownCircle", accent: "danger" },
      { id: "p3", label: "Tabungan", value: formatCurrency(tabungan), icon: "PiggyBank", accent: "success" },
      { id: "p4", label: "Dana Darurat", value: "0%", icon: "ShieldCheck", accent: "secondary" },
    ];
  }, [rows]);

  return (
    <>
      <FinancePageTemplate
        title="Keuangan Pribadi"
        description="Pantau saldo, pengeluaran, dan tabungan pribadi Anda."
        kpis={kpis}
        tableTitle="Transaksi Pribadi"
        columns={columns}
        rows={rows}
        addLabel="Catat Transaksi"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada transaksi pribadi"
        emptyDescription="Catat transaksi pribadi untuk mulai memantau keuangan Anda."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Catat Transaksi Pribadi"
        description="Tambahkan transaksi keuangan pribadi baru."
        fields={fields}
        submitLabel="Simpan Transaksi"
        onSubmit={(v) => {
          const jumlah = Number(v.jumlah.replace(/[^0-9]/g, "")) || 0;
          addItem({ tanggal: formatDateShort(new Date()), keterangan: v.keterangan, kategori: v.kategori, jumlah, jenis: v.jenis });
        }}
      />
    </>
  );
}
