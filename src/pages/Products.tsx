import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber } from "@/utils/format";
import { useSalesStore } from "@/store/entityStores";
import type { KpiDatum, TableColumn, GenericRow } from "@/types/finance";

interface StockRow extends GenericRow {
  produk: string;
  jumlahOrder: number;
  unitTerjual: number;
  totalReturn: number;
  returnRate: string;
  totalHpp: number;
}

const columns: TableColumn<StockRow>[] = [
  { key: "produk", header: "Produk" },
  { key: "jumlahOrder", header: "Jumlah Order", align: "center" },
  { key: "unitTerjual", header: "Unit Terjual (Box/Sachet)", align: "center", render: (r) => formatNumber(r.unitTerjual) },
  {
    key: "totalReturn",
    header: "Total Return",
    align: "center",
    render: (r) => <Badge variant={r.totalReturn > 0 ? "danger" : "success"}>{r.totalReturn}</Badge>,
  },
  { key: "returnRate", header: "Return Rate", align: "center" },
  { key: "totalHpp", header: "Total HPP", align: "right", render: (r) => formatCurrency(r.totalHpp) },
];

export default function Products() {
  const orders = useSalesStore((s) => s.items);
  const navigate = useNavigate();

  const { kpis, rows } = useMemo(() => {
    const grouped = new Map<string, StockRow>();
    for (const o of orders) {
      const key = o.produk.trim() || "Tanpa Nama Produk";
      const unit = Number(o.box) || 0;
      const isReturn = o.status === "Return";
      const existing = grouped.get(key);
      if (existing) {
        existing.jumlahOrder += 1;
        existing.unitTerjual += unit;
        existing.totalReturn += isReturn ? 1 : 0;
        existing.totalHpp += o.hpp;
      } else {
        grouped.set(key, {
          id: key,
          produk: key,
          jumlahOrder: 1,
          unitTerjual: unit,
          totalReturn: isReturn ? 1 : 0,
          returnRate: "0%",
          totalHpp: o.hpp,
        });
      }
    }
    const rows = Array.from(grouped.values())
      .map((r) => ({ ...r, returnRate: r.jumlahOrder > 0 ? `${((r.totalReturn / r.jumlahOrder) * 100).toFixed(1)}%` : "0%" }))
      .sort((a, b) => b.unitTerjual - a.unitTerjual);

    const totalUnit = rows.reduce((s, r) => s + r.unitTerjual, 0);
    const totalReturn = rows.reduce((s, r) => s + r.totalReturn, 0);
    const totalOrder = rows.reduce((s, r) => s + r.jumlahOrder, 0);
    const returnRateAll = totalOrder > 0 ? `${((totalReturn / totalOrder) * 100).toFixed(1)}%` : "0%";
    const terlaris = rows[0]?.produk ?? "-";

    const kpis: KpiDatum[] = [
      { id: "pr1", label: "Total Unit Terjual", value: formatNumber(totalUnit), icon: "Package", accent: "primary" },
      { id: "pr2", label: "Total Return", value: String(totalReturn), icon: "AlertTriangle", accent: totalReturn > 0 ? "danger" : "secondary" },
      { id: "pr3", label: "Return Rate", value: returnRateAll, icon: "Percent", accent: "warning" },
      { id: "pr4", label: "Produk Terlaris", value: terlaris, icon: "Star", accent: "success" },
    ];

    return { kpis, rows };
  }, [orders]);

  return (
    <div>
      <PageHeader
        title="Stok & Return"
        description="Ringkasan unit terjual dan return per produk, otomatis dari data Penjualan."
        action={
          <Button size="sm" onClick={() => navigate("/penjualan")}>
            <Plus size={15} /> Buat Order
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Halaman ini otomatis dihitung dari status order di <strong className="mx-1">Penjualan</strong> — ubah status ke "Return" di sana untuk melihat perubahannya di sini.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan per Produk</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              rows={rows}
              emptyTitle="Belum ada data"
              emptyDescription="Buat order di halaman Penjualan untuk melihat stok & return di sini."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
