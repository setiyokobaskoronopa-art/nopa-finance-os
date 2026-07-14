import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, parseDateSlash } from "@/utils/format";
import { useSalesStore } from "@/store/entityStores";
import type { KpiDatum, TableColumn, GenericRow } from "@/types/finance";

interface CustomerSummary extends GenericRow {
  nama: string;
  noWa: string;
  totalOrder: number;
  totalBelanja: number;
  pesananTerakhir: string;
  status: string;
}

const statusVariant: Record<string, "success" | "warning" | "default" | "secondary"> = {
  VIP: "success",
  Baru: "warning",
  Reguler: "default",
  Churn: "secondary",
};

const CHURN_THRESHOLD_DAYS = 90; // ~3 bulan

const columns: TableColumn<CustomerSummary>[] = [
  { key: "nama", header: "Nama" },
  { key: "noWa", header: "No. WA", render: (r) => r.noWa || "-" },
  { key: "totalOrder", header: "Total Order", align: "center" },
  { key: "totalBelanja", header: "Total Belanja", align: "right", render: (r) => formatCurrency(r.totalBelanja) },
  { key: "pesananTerakhir", header: "Order Terakhir" },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>,
  },
];

export default function Customers() {
  const orders = useSalesStore((s) => s.items);
  const navigate = useNavigate();

  const { kpis, rows } = useMemo(() => {
    const grouped = new Map<
      string,
      { nama: string; noWa: string; totalOrder: number; totalBelanja: number; lastDate: Date | null; lastDateStr: string; firstKode: string }
    >();

    for (const o of orders) {
      const key = (o.noWa.trim() || o.namaCustomer.trim()).toLowerCase();
      const orderDate = parseDateSlash(o.tanggal);
      const existing = grouped.get(key);
      if (existing) {
        existing.totalOrder += 1;
        existing.totalBelanja += o.totalCustomerBayar;
        if (orderDate && (!existing.lastDate || orderDate > existing.lastDate)) {
          existing.lastDate = orderDate;
          existing.lastDateStr = o.tanggal;
        }
      } else {
        grouped.set(key, {
          nama: o.namaCustomer.trim() || "Tanpa Nama",
          noWa: o.noWa.trim(),
          totalOrder: 1,
          totalBelanja: o.totalCustomerBayar,
          lastDate: orderDate,
          lastDateStr: o.tanggal,
          firstKode: o.kode,
        });
      }
    }

    const now = new Date();
    const rows: CustomerSummary[] = Array.from(grouped.entries()).map(([key, c]) => {
      const daysSinceLast = c.lastDate ? Math.floor((now.getTime() - c.lastDate.getTime()) / 86400000) : null;
      let status = "Reguler";
      if (c.totalOrder > 3) {
        status = "VIP";
      } else if (daysSinceLast !== null && daysSinceLast > CHURN_THRESHOLD_DAYS) {
        status = "Churn";
      } else if (c.totalOrder === 1) {
        status = "Baru";
      }
      return {
        id: key,
        nama: c.nama,
        noWa: c.noWa,
        totalOrder: c.totalOrder,
        totalBelanja: c.totalBelanja,
        pesananTerakhir: c.lastDateStr,
        status,
      };
    });
    rows.sort((a, b) => b.totalBelanja - a.totalBelanja);

    const vip = rows.filter((r) => r.status === "VIP").length;
    const baru = rows.filter((r) => r.status === "Baru").length;
    const churn = rows.filter((r) => r.status === "Churn").length;

    const kpis: KpiDatum[] = [
      { id: "cu1", label: "Total Customer", value: String(rows.length), icon: "Users", accent: "primary", footnote: "Unik berdasarkan No. WA / Nama" },
      { id: "cu2", label: "Customer Baru", value: String(baru), icon: "UserPlus", accent: "warning", footnote: "Kode O (OTS), baru 1x order" },
      { id: "cu3", label: "Customer VIP", value: String(vip), icon: "Star", accent: "success", footnote: "Repeat lebih dari 3x" },
      { id: "cu4", label: "Customer Churn", value: String(churn), icon: "UserMinus", accent: "danger", footnote: `Tidak order > ${CHURN_THRESHOLD_DAYS} hari` },
    ];

    return { kpis, rows };
  }, [orders]);

  return (
    <div>
      <PageHeader
        title="Customer"
        description="Penggolongan customer otomatis dari data Penjualan."
        action={
          <Button size="sm" onClick={() => navigate("/penjualan")}>
            <Plus size={15} /> Buat Order
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Status dihitung otomatis: <strong className="mx-1">Baru</strong> = kode OTS pertama kali order,{" "}
        <strong className="mx-1">VIP</strong> = repeat lebih dari 3x, <strong className="mx-1">Churn</strong> = belum order lagi lebih dari 3 bulan.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Customer</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              rows={rows}
              emptyTitle="Belum ada customer"
              emptyDescription="Buat order di halaman Penjualan untuk melihat data customer di sini."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
