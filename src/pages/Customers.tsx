import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { formatCurrency, formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { useCustomersStore } from "@/store/entityStores";
import type { CustomerItem } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const statusVariant: Record<string, "success" | "warning" | "default" | "secondary"> = {
  VIP: "success",
  Reseller: "default",
  Reguler: "secondary",
  Baru: "warning",
};

const fields: FieldConfig[] = [
  { key: "nama", label: "Nama Customer", placeholder: "Contoh: Rina Amelia" },
  { key: "email", label: "Email", placeholder: "nama@email.com" },
  { key: "totalBelanja", label: "Total Belanja (Rp)", type: "number", placeholder: "0" },
  { key: "status", label: "Status", options: ["Baru", "Reguler", "VIP", "Reseller"] },
];

const columns: TableColumn<CustomerItem>[] = [
  { key: "nama", header: "Nama" },
  { key: "email", header: "Email" },
  { key: "totalOrder", header: "Total Order", align: "center", render: (r) => formatNumber(r.totalOrder) },
  { key: "totalBelanja", header: "Total Belanja", align: "right", render: (r) => formatCurrency(r.totalBelanja) },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>,
  },
];

export default function Customers() {
  const customers = useCustomersStore((s) => s.items);
  const addItem = useCustomersStore((s) => s.addItem);
  const removeItem = useCustomersStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const vip = customers.filter((c) => c.status === "VIP").length;
    const baru = customers.filter((c) => c.status === "Baru").length;
    return [
      { id: "cu1", label: "Total Customer", value: String(customers.length), icon: "Users", accent: "primary" },
      { id: "cu2", label: "Customer Baru", value: String(baru), icon: "UserPlus", accent: "success" },
      { id: "cu3", label: "Customer VIP", value: String(vip), icon: "Repeat", accent: "secondary" },
      { id: "cu4", label: "Customer Churn", value: "0%", icon: "UserMinus", accent: "danger" },
    ];
  }, [customers]);

  return (
    <>
      <FinancePageTemplate
        title="Customer"
        description="Kelola data dan riwayat belanja pelanggan Anda."
        kpis={kpis}
        tableTitle="Daftar Customer"
        columns={columns}
        rows={customers}
        addLabel="Tambah Customer"
        onAdd={() => setOpen(true)}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle="Belum ada customer"
        emptyDescription="Tambahkan customer untuk mulai melacak riwayat belanja."
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Tambah Customer"
        description="Tambahkan data customer baru."
        fields={fields}
        submitLabel="Simpan Customer"
        onSubmit={(v) => {
          const totalBelanja = Number(v.totalBelanja.replace(/[^0-9]/g, "")) || 0;
          addItem({ nama: v.nama, email: v.email, totalOrder: 0, totalBelanja, status: v.status });
        }}
      />
    </>
  );
}
