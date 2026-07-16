import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useSuppliersStore } from "@/store/entityStores";
import type { SupplierItem } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "nama", label: "Nama Supplier", placeholder: "Contoh: CV Sumber Kolagen Nusantara" },
  { key: "produk", label: "Produk", placeholder: "Contoh: Bubuk Kolagen" },
  { key: "kontak", label: "Kontak", placeholder: "0812xxxxxxx" },
  { key: "totalPembelian", label: "Total Pembelian (Rp)", type: "number", placeholder: "0" },
  { key: "status", label: "Status", options: ["Aktif", "Non-aktif"] },
];

const columns: TableColumn<SupplierItem>[] = [
  { key: "nama", header: "Nama Supplier" },
  { key: "produk", header: "Produk" },
  { key: "kontak", header: "Kontak" },
  { key: "totalPembelian", header: "Total Pembelian", align: "right", render: (r) => formatCurrency(r.totalPembelian) },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={r.status === "Aktif" ? "success" : "secondary"}>{r.status}</Badge>,
  },
];

export default function Suppliers() {
  const suppliers = useSuppliersStore((s) => s.items);
  const addItem = useSuppliersStore((s) => s.addItem);
  const updateItem = useSuppliersStore((s) => s.updateItem);
  const removeItem = useSuppliersStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const kpis = useMemo<KpiDatum[]>(() => {
    const active = suppliers.filter((s) => s.status === "Aktif").length;
    const total = suppliers.reduce((s, sup) => s + sup.totalPembelian, 0);
    return [
      { id: "sp1", label: "Total Supplier", value: String(suppliers.length), icon: "Truck", accent: "primary" },
      { id: "sp2", label: "Supplier Aktif", value: String(active), icon: "PackageCheck", accent: "warning" },
      { id: "sp3", label: "Total Pembelian", value: formatCurrency(total), icon: "ShoppingCart", accent: "secondary" },
      { id: "sp4", label: "Rata-rata Tempo Bayar", value: "0 hari", icon: "CalendarClock", accent: "success" },
    ];
  }, [suppliers]);

  const editingRow = suppliers.find((s) => s.id === editingId) ?? null;
  const initialValues = editingRow
    ? {
        nama: editingRow.nama,
        produk: editingRow.produk,
        kontak: editingRow.kontak,
        totalPembelian: String(editingRow.totalPembelian),
        status: editingRow.status,
      }
    : null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpen(true);
  };
  const handleOpenEdit = (row: SupplierItem) => {
    setEditingId(row.id);
    setOpen(true);
  };

  return (
    <>
      <FinancePageTemplate
        title="Supplier"
        description="Kelola daftar supplier dan riwayat pembelian bahan baku."
        kpis={kpis}
        tableTitle="Daftar Supplier"
        columns={columns}
        rows={suppliers}
        addLabel="Tambah Supplier"
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada supplier"
        emptyDescription="Tambahkan supplier untuk mulai melacak pembelian bahan baku."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Supplier" : "Tambah Supplier"}
        description={editingId ? "Perbarui data supplier." : "Tambahkan data supplier baru."}
        fields={fields}
        submitLabel={editingId ? "Simpan Perubahan" : "Simpan Supplier"}
        initialValues={initialValues}
        onSubmit={(v) => {
          const totalPembelian = Number(v.totalPembelian.replace(/[^0-9]/g, "")) || 0;
          const payload = { nama: v.nama, produk: v.produk, kontak: v.kontak, totalPembelian, status: v.status };
          if (editingId) updateItem(editingId, payload);
          else addItem(payload);
        }}
      />
    </>
  );
}
