import { useMemo, useState } from "react";
import { Link2, Upload, Trash2 } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { AddSalesOrderDialog } from "@/components/dashboard/AddSalesOrderDialog";
import { ImportOrdersDialog } from "@/components/dashboard/ImportOrdersDialog";
import { EverproCallbackLog } from "@/components/dashboard/EverproCallbackLog";
import { TableFilterBar, FILTER_ALL } from "@/components/shared/TableFilterBar";
import { Button } from "@/components/ui/Button";
import { formatCurrency, parseDateSlash } from "@/utils/format";
import { sortByTanggalDesc } from "@/utils/sortByDate";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useSalesStore } from "@/store/entityStores";
import { useStockReturnsStore } from "@/store/stockReturnsStore";
import { getEffectiveGrossProvit } from "@/utils/businessCalc";
import type { SalesOrder } from "@/data/pagesDummy";
import type { KpiDatum, TableColumn } from "@/types/finance";

const STATUS_OPTIONS = ["On Proses", "Delivered", "Problem", "Return"];
const PLATFORM_OPTIONS = ["Database", "Website", "Meta", "Google", "Tiktok Shop", "Organik"];

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  Delivered: "success",
  "On Proses": "warning",
  Problem: "danger",
  Return: "secondary",
};

const kodeLabel: Record<string, string> = { O: "OTS", F: "Follow Up", R: "Repeat" };
const kodeVariant: Record<string, "default" | "warning" | "success"> = { O: "default", F: "warning", R: "success" };

function StatusCell({ row }: { row: SalesOrder }) {
  const updateItem = useSalesStore((s) => s.updateItem);
  return (
    <Select value={row.status} onValueChange={(v) => updateItem(row.id, { status: v })}>
      <SelectTrigger
        className={`h-8 w-[120px] text-xs ${
          row.status === "Delivered"
            ? "border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
            : row.status === "Problem"
            ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400"
            : row.status === "Return"
            ? "border-secondary-200 bg-secondary-100 text-secondary-700 dark:border-secondary-700 dark:bg-secondary-800"
            : "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400"
        }`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const columns: TableColumn<SalesOrder>[] = [
  { key: "tanggal", header: "Tanggal" },
  { key: "cs", header: "CS" },
  { key: "namaCustomer", header: "Customer" },
  { key: "noWa", header: "No. WA", render: (r) => r.noWa || "-" },
  { key: "awbNumber", header: "No. Resi", render: (r) => r.awbNumber || "-" },
  {
    key: "kode",
    header: "Kode",
    align: "center",
    render: (r) => <Badge variant={kodeVariant[r.kode] ?? "default"}>{kodeLabel[r.kode] ?? r.kode}</Badge>,
  },
  { key: "platform", header: "Platform" },
  { key: "metodePembayaran", header: "Metode Bayar" },
  { key: "ekspedis", header: "Ekspedisi" },
  { key: "produk", header: "Produk" },
  { key: "box", header: "Box/Sachet", align: "center" },
  { key: "hargaTotalProduk", header: "Harga Total Produk", align: "right", render: (r) => formatCurrency(r.hargaTotalProduk) },
  { key: "diskonOngkir", header: "Diskon Ongkir", align: "right", render: (r) => formatCurrency(r.diskonOngkir) },
  { key: "totalCustomerBayar", header: "Total Customer Bayar", align: "right", render: (r) => formatCurrency(r.totalCustomerBayar) },
  { key: "biayaCod", header: "Biaya COD 3%", align: "right", render: (r) => (r.biayaCod ? formatCurrency(r.biayaCod) : "-") },
  { key: "pajakCod", header: "Pajak COD 0,33%", align: "right", render: (r) => (r.pajakCod ? formatCurrency(r.pajakCod) : "-") },
  { key: "cashIn", header: "Cash In", align: "right", render: (r) => formatCurrency(r.cashIn) },
  { key: "hpp", header: "HPP", align: "right", render: (r) => (
    <span>
      {formatCurrency(r.hpp)}
      {r.hppSource === "Stock Return" && <span className="ml-1 text-[10px] text-warning-600">(SR)</span>}
    </span>
  ) },
  {
    key: "grossProvit",
    header: "Gross Provit",
    align: "right",
    render: (r) =>
      r.status === "Return" ? (
        <span className="text-secondary-400">Rp0 (Return)</span>
      ) : (
        <span className="font-semibold text-success-600">{formatCurrency(r.grossProvit)}</span>
      ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <StatusCell row={r} />,
  },
];

export default function Sales() {
  const orders = useSalesStore((s) => s.items);
  const removeItem = useSalesStore((s) => s.removeItem);
  const markStockReturnAvailable = useStockReturnsStore((s) => s.markAsAvailable);
  const removeAllItems = useSalesStore((s) => s.removeAllItems);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [platformFilter, setPlatformFilter] = useState(FILTER_ALL);
  const [kodeFilter, setKodeFilter] = useState(FILTER_ALL);

  const filtersActive =
    Boolean(search) || Boolean(dateFrom) || Boolean(dateTo) || statusFilter !== FILTER_ALL || platformFilter !== FILTER_ALL || kodeFilter !== FILTER_ALL;

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter(FILTER_ALL);
    setPlatformFilter(FILTER_ALL);
    setKodeFilter(FILTER_ALL);
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((o) => o.namaCustomer.toLowerCase().includes(q) || o.noWa.includes(q) || o.produk.toLowerCase().includes(q));
    }
    if (dateFrom) {
      const from = parseDateSlash(dateFrom);
      result = result.filter((o) => {
        const d = parseDateSlash(o.tanggal);
        return d && from && d.getTime() >= from.getTime();
      });
    }
    if (dateTo) {
      const to = parseDateSlash(dateTo);
      result = result.filter((o) => {
        const d = parseDateSlash(o.tanggal);
        return d && to && d.getTime() <= to.getTime();
      });
    }
    if (statusFilter !== FILTER_ALL) result = result.filter((o) => o.status === statusFilter);
    if (platformFilter !== FILTER_ALL) result = result.filter((o) => o.platform === platformFilter);
    if (kodeFilter !== FILTER_ALL) result = result.filter((o) => kodeLabel[o.kode] === kodeFilter);
    return sortByTanggalDesc(result);
  }, [orders, search, dateFrom, dateTo, statusFilter, platformFilter, kodeFilter]);

  const kpis = useMemo<KpiDatum[]>(() => {
    const totalBayar = filteredOrders.reduce((s, o) => s + o.totalCustomerBayar, 0);
    const totalOmzet = filteredOrders.reduce((s, o) => s + o.hargaTotalProduk, 0);
    const totalProvit = filteredOrders.reduce((s, o) => s + getEffectiveGrossProvit(o), 0);
    const count = filteredOrders.length;
    return [
      { id: "s1", label: "Total Penjualan", value: formatCurrency(totalBayar), icon: "TrendingUp", accent: "primary" },
      { id: "s2", label: "Jumlah Order", value: String(count), icon: "ShoppingBag", accent: "success" },
      { id: "s3", label: "Total Omzet", value: formatCurrency(totalOmzet), icon: "Receipt", accent: "secondary" },
      { id: "s4", label: "Total Gross Provit", value: formatCurrency(totalProvit), icon: "TrendingUp", accent: "success" },
    ];
  }, [filteredOrders]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
          <Link2 size={14} className="shrink-0" />
          Data ini otomatis terhubung ke <strong className="mx-1">Keuangan Bisnis</strong>,{" "}
          <strong className="mx-1">Customer</strong>, dan <strong className="mx-1">Stok & Return</strong> — klik dropdown Status untuk update progres order.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="shrink-0">
            <Upload size={15} /> Import Order
          </Button>
          {orders.length > 0 && (
            <Button
              variant={confirmClearAll ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                if (confirmClearAll) {
                  removeAllItems();
                  setConfirmClearAll(false);
                } else {
                  setConfirmClearAll(true);
                  setTimeout(() => setConfirmClearAll(false), 4000);
                }
              }}
              className="shrink-0"
            >
              <Trash2 size={15} /> {confirmClearAll ? `Yakin hapus ${orders.length} order?` : "Hapus Semua"}
            </Button>
          )}
        </div>
      </div>
      <TableFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari customer, no WA, produk..."
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selects={[
          { key: "status", label: "Status", value: statusFilter, options: STATUS_OPTIONS, onChange: setStatusFilter },
          { key: "platform", label: "Platform", value: platformFilter, options: PLATFORM_OPTIONS, onChange: setPlatformFilter },
          { key: "kode", label: "Kode", value: kodeFilter, options: ["OTS", "Follow Up", "Repeat"], onChange: setKodeFilter },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />
      <FinancePageTemplate
        title="Penjualan"
        description="Pantau performa penjualan dari semua channel."
        kpis={kpis}
        tableTitle={`Order ${filtersActive ? `(${filteredOrders.length} hasil filter)` : "Terbaru"}`}
        columns={columns}
        rows={filteredOrders}
        addLabel="Buat Order"
        onAdd={() => {
          setEditingOrder(null);
          setOpen(true);
        }}
        onEdit={(row) => {
          setEditingOrder(row);
          setOpen(true);
        }}
        onDelete={(row) => {
          (row.items ?? []).forEach((li) => {
            if (li.stockReturnId) markStockReturnAvailable(li.stockReturnId);
          });
          removeItem(row.id);
        }}
        emptyTitle={filtersActive ? "Tidak ada order yang cocok" : "Belum ada order"}
        emptyDescription={filtersActive ? "Coba ubah atau reset filter kamu." : "Order penjualan yang kamu buat akan muncul di sini."}
      />
      <AddSalesOrderDialog open={open} onOpenChange={setOpen} editingOrder={editingOrder} />
      <ImportOrdersDialog open={importOpen} onOpenChange={setImportOpen} />
      <EverproCallbackLog />
    </>
  );
}
