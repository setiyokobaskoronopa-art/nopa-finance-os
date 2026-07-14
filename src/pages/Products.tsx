import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency, formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useProductsStore } from "@/store/entityStores";
import type { ProductItem } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "nama", label: "Nama Produk", placeholder: "Contoh: DVN Collagen Gold 30s" },
  { key: "kategori", label: "Kategori", options: ["Suplemen", "Skincare", "Lainnya"] },
  { key: "stok", label: "Stok", type: "number", placeholder: "0" },
  { key: "harga", label: "Harga (Rp)", type: "number", placeholder: "0" },
];

const columns: TableColumn<ProductItem>[] = [
  { key: "nama", header: "Nama Produk" },
  { key: "kategori", header: "Kategori" },
  {
    key: "stok",
    header: "Stok",
    align: "center",
    render: (r) => <Badge variant={r.stok <= 10 ? "danger" : "success"}>{formatNumber(r.stok)}</Badge>,
  },
  { key: "harga", header: "Harga", align: "right", render: (r) => formatCurrency(r.harga) },
  { key: "terjual", header: "Terjual", align: "right", render: (r) => formatNumber(r.terjual) },
];

export default function Products() {
  const products = useProductsStore((s) => s.items);
  const addItem = useProductsStore((s) => s.addItem);
  const removeItem = useProductsStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const lowStock = products.filter((p) => p.stok <= 10).length;
    const totalValue = products.reduce((s, p) => s + p.stok * p.harga, 0);
    const bestSeller = [...products].sort((a, b) => b.terjual - a.terjual)[0];
    return [
      { id: "pr1", label: "Total Produk", value: String(products.length), icon: "Package", accent: "primary" },
      { id: "pr2", label: "Stok Menipis", value: String(lowStock), icon: "AlertTriangle", accent: "warning" },
      { id: "pr3", label: "Produk Terlaris", value: bestSeller ? bestSeller.nama : "-", icon: "Star", accent: "success" },
      { id: "pr4", label: "Total Nilai Stok", value: formatCurrency(totalValue), icon: "Warehouse", accent: "secondary" },
    ];
  }, [products]);

  return (
    <>
      <FinancePageTemplate
        title="Produk"
        description="Kelola katalog dan stok produk DVN Collagen & Ais Beauty."
        kpis={kpis}
        tableTitle="Daftar Produk"
        columns={columns}
        rows={products}
        addLabel="Tambah Produk"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada produk"
        emptyDescription="Tambahkan produk untuk mulai mengelola katalog."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Tambah Produk"
        description="Tambahkan produk baru ke katalog."
        fields={fields}
        submitLabel="Simpan Produk"
        onSubmit={(v) => {
          const stok = Number(v.stok.replace(/[^0-9]/g, "")) || 0;
          const harga = Number(v.harga.replace(/[^0-9]/g, "")) || 0;
          addItem({ nama: v.nama, kategori: v.kategori, stok, harga, terjual: 0 });
        }}
      />
    </>
  );
}
