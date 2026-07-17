import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Bell, BellRing, CheckCircle2, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SetReminderDialog } from "@/components/dashboard/SetReminderDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, parseDateSlash } from "@/utils/format";
import { sortByTanggalDesc } from "@/utils/sortByDate";
import { useSalesStore } from "@/store/entityStores";
import { useCustomersMetaStore } from "@/store/customersMetaStore";
import { getCustomerKey } from "@/utils/customerKey";
import { buildWhatsAppLink } from "@/utils/whatsapp";
import type { KpiDatum, TableColumn } from "@/types/finance";
import type { SalesOrder } from "@/data/pagesDummy";

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  Delivered: "success",
  "On Proses": "warning",
  Problem: "danger",
  Return: "secondary",
};

const CHURN_THRESHOLD_DAYS = 90;

const orderColumns: TableColumn<SalesOrder>[] = [
  { key: "tanggal", header: "Tanggal" },
  { key: "produk", header: "Produk" },
  { key: "box", header: "Box/Sachet", align: "center" },
  { key: "totalCustomerBayar", header: "Total Bayar", align: "right", render: (r) => formatCurrency(r.totalCustomerBayar) },
  { key: "grossProvit", header: "Gross Provit", align: "right", render: (r) => formatCurrency(r.grossProvit) },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={statusVariant[r.status] ?? "secondary"}>{r.status}</Badge>,
  },
];

export default function CustomerDetail() {
  const { key } = useParams<{ key: string }>();
  const customerKey = decodeURIComponent(key ?? "");
  const navigate = useNavigate();
  const orders = useSalesStore((s) => s.items);
  const meta = useCustomersMetaStore((s) => s.getByKey(customerKey));
  const markReminderDone = useCustomersMetaStore((s) => s.markReminderDone);
  const [reminderOpen, setReminderOpen] = useState(false);

  const customerOrders = useMemo(
    () => sortByTanggalDesc(orders.filter((o) => getCustomerKey(o.noWa, o.namaCustomer) === customerKey)),
    [orders, customerKey]
  );

  if (customerOrders.length === 0) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/customer")} className="mb-4">
          <ArrowLeft size={15} /> Kembali ke Customer
        </Button>
        <Card>
          <CardContent>
            <EmptyState
              icon={ShoppingBag}
              title="Customer tidak ditemukan"
              description="Customer ini mungkin belum punya order, atau datanya sudah berubah."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const nama = customerOrders[0].namaCustomer.trim() || "Tanpa Nama";
  const noWa = customerOrders[0].noWa.trim();
  const totalOrder = customerOrders.length;
  const totalBelanja = customerOrders.reduce((s, o) => s + o.totalCustomerBayar, 0);
  const totalProvit = customerOrders.reduce((s, o) => s + o.grossProvit, 0);
  const lastOrderDate = parseDateSlash(customerOrders[0].tanggal);
  const daysSinceLast = lastOrderDate ? Math.floor((Date.now() - lastOrderDate.getTime()) / 86400000) : null;

  let status = "Reguler";
  if (totalOrder > 3) status = "VIP";
  else if (daysSinceLast !== null && daysSinceLast > CHURN_THRESHOLD_DAYS) status = "Churn";
  else if (totalOrder === 1) status = "Baru";

  const waLink = buildWhatsAppLink(noWa);
  const reminderActive = meta && !meta.reminderDone && meta.reminderDate;
  const reminderOverdue = reminderActive
    ? (parseDateSlash(meta!.reminderDate!)?.getTime() ?? 0) <= new Date().setHours(0, 0, 0, 0)
    : false;

  const kpis: KpiDatum[] = [
    { id: "d1", label: "Total Order", value: String(totalOrder), icon: "ShoppingBag", accent: "primary" },
    { id: "d2", label: "Total Belanja", value: formatCurrency(totalBelanja), icon: "Wallet", accent: "success" },
    { id: "d3", label: "Total Gross Provit", value: formatCurrency(totalProvit), icon: "TrendingUp", accent: "secondary" },
    { id: "d4", label: "Order Terakhir", value: customerOrders[0].tanggal, icon: "CalendarClock", accent: "warning", footnote: daysSinceLast !== null ? `${daysSinceLast} hari lalu` : undefined },
  ];

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/customer")} className="mb-4">
        <ArrowLeft size={15} /> Kembali ke Customer
      </Button>

      <PageHeader
        title={nama}
        description={noWa || "No. WA tidak tercatat"}
        action={
          <div className="flex items-center gap-2">
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer">
                <Button variant="success" size="sm">
                  <MessageCircle size={15} /> Chat WhatsApp
                </Button>
              </a>
            )}
            <Button size="sm" onClick={() => setReminderOpen(true)}>
              <Bell size={15} /> {reminderActive ? "Edit Reminder" : "Set Reminder"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={status === "VIP" ? "success" : status === "Churn" ? "secondary" : status === "Baru" ? "warning" : "default"}>
          {status}
        </Badge>
        {reminderActive && (
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${
              reminderOverdue
                ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400"
                : "border-secondary-200 bg-secondary-50 text-secondary-600 dark:border-secondary-700 dark:bg-secondary-800/50 dark:text-secondary-300"
            }`}
          >
            {reminderOverdue ? <BellRing size={13} /> : <Bell size={13} />}
            <span className="font-medium">Follow-up {meta!.reminderDate}</span>
            {meta!.reminderNote && <span className="text-secondary-400">— {meta!.reminderNote}</span>}
            <button
              onClick={() => markReminderDone(customerKey, true)}
              className="ml-1 flex items-center gap-1 rounded-lg px-1.5 py-0.5 hover:bg-white/60 dark:hover:bg-black/20"
            >
              <CheckCircle2 size={13} /> Selesai
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Order</CardTitle>
            <span className="text-xs text-secondary-400">{customerOrders.length} order</span>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={orderColumns} rows={customerOrders} />
          </CardContent>
        </Card>
      </div>

      <SetReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        customerKey={customerKey}
        customerName={nama}
        existingDate={meta?.reminderDate}
        existingNote={meta?.reminderNote}
      />
    </div>
  );
}
