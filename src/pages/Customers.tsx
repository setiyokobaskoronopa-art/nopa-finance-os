import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus, MessageCircle, Bell, BellRing } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, parseDateSlash } from "@/utils/format";
import { useSalesStore } from "@/store/entityStores";
import { useCustomersMetaStore } from "@/store/customersMetaStore";
import { getCustomerKey } from "@/utils/customerKey";
import { buildWhatsAppLink } from "@/utils/whatsapp";
import type { KpiDatum, TableColumn, GenericRow } from "@/types/finance";

interface CustomerSummary extends GenericRow {
  nama: string;
  noWa: string;
  totalOrder: number;
  totalBelanja: number;
  pesananTerakhir: string;
  status: string;
  reminderDate: string | null;
  reminderOverdue: boolean;
}

const statusVariant: Record<string, "success" | "warning" | "default" | "secondary"> = {
  VIP: "success",
  Baru: "warning",
  Reguler: "default",
  Churn: "secondary",
};

const CHURN_THRESHOLD_DAYS = 90; // ~3 bulan

export default function Customers() {
  const orders = useSalesStore((s) => s.items);
  const customersMeta = useCustomersMetaStore((s) => s.items);
  const navigate = useNavigate();

  const { kpis, rows } = useMemo(() => {
    const grouped = new Map<
      string,
      { nama: string; noWa: string; totalOrder: number; totalBelanja: number; lastDate: Date | null; lastDateStr: string }
    >();

    for (const o of orders) {
      const key = getCustomerKey(o.noWa, o.namaCustomer);
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

      const meta = customersMeta.find((m) => m.customerKey === key);
      const reminderDate = meta && !meta.reminderDone ? meta.reminderDate : null;
      const reminderOverdue = reminderDate
        ? (parseDateSlash(reminderDate)?.getTime() ?? 0) <= now.setHours(0, 0, 0, 0)
        : false;

      return {
        id: key,
        nama: c.nama,
        noWa: c.noWa,
        totalOrder: c.totalOrder,
        totalBelanja: c.totalBelanja,
        pesananTerakhir: c.lastDateStr,
        status,
        reminderDate,
        reminderOverdue,
      };
    });
    rows.sort((a, b) => b.totalBelanja - a.totalBelanja);

    const vip = rows.filter((r) => r.status === "VIP").length;
    const baru = rows.filter((r) => r.status === "Baru").length;
    const churn = rows.filter((r) => r.status === "Churn").length;
    const reminderDue = rows.filter((r) => r.reminderOverdue).length;

    const kpis: KpiDatum[] = [
      { id: "cu1", label: "Total Customer", value: String(rows.length), icon: "Users", accent: "primary", footnote: "Unik berdasarkan No. WA / Nama" },
      { id: "cu2", label: "Customer Baru", value: String(baru), icon: "UserPlus", accent: "warning", footnote: "Kode O (OTS), baru 1x order" },
      { id: "cu3", label: "Customer VIP", value: String(vip), icon: "Star", accent: "success", footnote: "Repeat lebih dari 3x" },
      { id: "cu4", label: "Reminder Jatuh Tempo", value: String(reminderDue), icon: "BellRing", accent: reminderDue > 0 ? "danger" : "secondary", footnote: `${churn} customer Churn` },
    ];

    return { kpis, rows };
  }, [orders, customersMeta]);

  const columns: TableColumn<CustomerSummary>[] = [
    {
      key: "nama",
      header: "Nama",
      render: (r) => (
        <button
          onClick={() => navigate(`/customer/${encodeURIComponent(r.id)}`)}
          className="font-medium text-secondary-800 hover:text-primary-600 hover:underline dark:text-secondary-100"
        >
          {r.nama}
        </button>
      ),
    },
    {
      key: "noWa",
      header: "No. WA",
      render: (r) => {
        const link = buildWhatsAppLink(r.noWa);
        return (
          <div className="flex items-center gap-1.5">
            <span>{r.noWa || "-"}</span>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10"
                aria-label="Chat WhatsApp"
              >
                <MessageCircle size={14} />
              </a>
            )}
          </div>
        );
      },
    },
    { key: "totalOrder", header: "Total Order", align: "center" },
    { key: "totalBelanja", header: "Total Belanja", align: "right", render: (r) => formatCurrency(r.totalBelanja) },
    { key: "pesananTerakhir", header: "Order Terakhir" },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>,
    },
    {
      key: "reminderDate",
      header: "Reminder",
      align: "center",
      render: (r) =>
        r.reminderDate ? (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              r.reminderOverdue ? "text-danger-600" : "text-secondary-500"
            }`}
          >
            {r.reminderOverdue ? <BellRing size={13} /> : <Bell size={13} />}
            {r.reminderDate}
          </span>
        ) : (
          <span className="text-secondary-300">-</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customer"
        description="Penggolongan customer otomatis dari data Penjualan, plus reminder follow-up."
        action={
          <Button size="sm" onClick={() => navigate("/penjualan")}>
            <Plus size={15} /> Buat Order
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Klik nama customer buat lihat detail & riwayat order lengkap, atur reminder follow-up, atau chat langsung via WhatsApp.
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
