import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/format";
import { useSalesStore } from "@/store/entityStores";
import type { KpiDatum, TableColumn, GenericRow } from "@/types/finance";

interface BrandSummary extends GenericRow {
  brand: string;
  jumlahOrder: number;
  omzet: number;
  beban: number;
  laba: number;
  margin: string;
}

const columns: TableColumn<BrandSummary>[] = [
  { key: "brand", header: "Produk / Brand" },
  { key: "jumlahOrder", header: "Jumlah Order", align: "center" },
  { key: "omzet", header: "Omzet (Total Customer Bayar)", align: "right", render: (r) => formatCurrency(r.omzet) },
  { key: "beban", header: "Beban (HPP + Biaya COD + Ongkir)", align: "right", render: (r) => formatCurrency(r.beban) },
  {
    key: "laba",
    header: "Laba Bersih (Gross Provit)",
    align: "right",
    render: (r) => <span className="font-semibold text-success-600">{formatCurrency(r.laba)}</span>,
  },
  { key: "margin", header: "Margin", align: "right" },
];

export default function BusinessFinance() {
  const orders = useSalesStore((s) => s.items);
  const navigate = useNavigate();

  const { kpis, rows } = useMemo(() => {
    const totalOmzet = orders.reduce((s, o) => s + o.totalCustomerBayar, 0);
    const totalBeban = orders.reduce((s, o) => s + o.hpp + o.biayaCod + o.pajakCod + o.diskonOngkir + o.promo, 0);
    const totalLaba = orders.reduce((s, o) => s + o.grossProvit, 0);
    const margin = totalOmzet > 0 ? `${((totalLaba / totalOmzet) * 100).toFixed(1)}%` : "0%";

    const kpis: KpiDatum[] = [
      { id: "b1", label: "Omzet Bisnis", value: formatCurrency(totalOmzet), icon: "Building2", accent: "primary", footnote: "Dari seluruh order penjualan" },
      { id: "b2", label: "Beban Operasional", value: formatCurrency(totalBeban), icon: "Factory", accent: "warning", footnote: "HPP + biaya COD + ongkir + promo" },
      { id: "b3", label: "Laba Bersih", value: formatCurrency(totalLaba), icon: "TrendingUp", accent: "success", footnote: "Total gross provit" },
      { id: "b4", label: "Margin Laba", value: margin, icon: "Percent", accent: "secondary", footnote: "Laba bersih / omzet" },
    ];

    const grouped = new Map<string, BrandSummary>();
    for (const o of orders) {
      const key = o.produk.trim() || "Tanpa Nama Produk";
      const beban = o.hpp + o.biayaCod + o.pajakCod + o.diskonOngkir + o.promo;
      const existing = grouped.get(key);
      if (existing) {
        existing.jumlahOrder += 1;
        existing.omzet += o.totalCustomerBayar;
        existing.beban += beban;
        existing.laba += o.grossProvit;
      } else {
        grouped.set(key, {
          id: key,
          brand: key,
          jumlahOrder: 1,
          omzet: o.totalCustomerBayar,
          beban,
          laba: o.grossProvit,
          margin: "0%",
        });
      }
    }
    const rows = Array.from(grouped.values())
      .map((r) => ({ ...r, margin: r.omzet > 0 ? `${((r.laba / r.omzet) * 100).toFixed(1)}%` : "0%" }))
      .sort((a, b) => b.omzet - a.omzet);

    return { kpis, rows };
  }, [orders]);

  return (
    <div>
      <PageHeader
        title="Keuangan Bisnis"
        description="Ringkasan keuangan bisnis, dihitung otomatis dari data Penjualan."
        action={
          <Button size="sm" onClick={() => navigate("/penjualan")}>
            <Plus size={15} /> Buat Order
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Halaman ini otomatis dihitung dari setiap order di <strong className="mx-1">Penjualan</strong> — tidak ada input manual di sini.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan per Produk / Brand</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              rows={rows}
              emptyTitle="Belum ada data"
              emptyDescription="Buat order di halaman Penjualan untuk melihat ringkasan di sini."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
