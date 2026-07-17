import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Plus, Pencil, Trash2, Package } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AddStockReturnDialog } from "@/components/dashboard/AddStockReturnDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber } from "@/utils/format";
import { useSalesStore } from "@/store/entityStores";
import { useStockReturnsStore, type StockReturnItem } from "@/store/stockReturnsStore";
import type { KpiDatum } from "@/types/finance";

export default function Products() {
  const orders = useSalesStore((s) => s.items);
  const stockReturns = useStockReturnsStore((s) => s.items);
  const removeStockReturn = useStockReturnsStore((s) => s.removeItem);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockReturnItem | null>(null);

  const kpis = useMemo<KpiDatum[]>(() => {
    let totalUnit = 0;
    let totalReturnOrder = 0;
    let totalOrder = 0;
    for (const o of orders) {
      const items = o.items && o.items.length > 0 ? o.items : [{ box: o.box }];
      for (const item of items) {
        totalUnit += Number(item.box) || 0;
        totalOrder += 1;
      }
      if (o.status === "Return") totalReturnOrder += 1;
    }
    const returnRate = totalOrder > 0 ? `${((totalReturnOrder / totalOrder) * 100).toFixed(1)}%` : "0%";
    const tersedia = stockReturns.filter((s) => s.status === "Tersedia").length;

    return [
      { id: "pr1", label: "Total Unit Terjual", value: formatNumber(totalUnit), icon: "Package", accent: "primary" },
      { id: "pr2", label: "Total Return", value: String(totalReturnOrder), icon: "AlertTriangle", accent: totalReturnOrder > 0 ? "danger" : "secondary" },
      { id: "pr3", label: "Return Rate", value: returnRate, icon: "Percent", accent: "warning" },
      { id: "pr4", label: "Stock Return Tersedia", value: String(tersedia), icon: "PackageCheck", accent: tersedia > 0 ? "warning" : "secondary", footnote: "Siap dipakai ulang di order baru" },
    ];
  }, [orders, stockReturns]);

  return (
    <div>
      <PageHeader
        title="Stok & Return"
        description="Catat manual barang yang di-return, pakai ulang sebagai HPP Rp0 di order berikutnya."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/penjualan")}>
              Ke Penjualan
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setOpen(true);
              }}
            >
              <Plus size={15} /> Catat Return
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Barang berstatus <strong className="mx-1">Tersedia</strong> bisa dipilih di form Buat/Edit Order (Penjualan) sebagai Stock Return — otomatis jadi <strong className="mx-1">Terpakai</strong> begitu dipakai, dan balik <strong className="mx-1">Tersedia</strong> kalau order itu diedit/dihapus.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Stock Return</CardTitle>
            <span className="text-xs text-secondary-400">{stockReturns.length} catatan</span>
          </CardHeader>
          <CardContent className="p-0">
            {stockReturns.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Belum ada catatan return"
                description="Klik 'Catat Return' untuk mencatat barang yang dikembalikan customer."
                action={
                  <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus size={14} /> Catat Return
                  </Button>
                }
              />
            ) : (
              <div className="scrollbar-thin overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-secondary-100 dark:border-secondary-800">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Produk</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">HPP</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Harga Jual</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">ID Order</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Resi Lama</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Resi Baru</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary-400">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockReturns.map((sr) => (
                      <tr
                        key={sr.id}
                        className="group border-b border-secondary-50 transition-colors last:border-0 hover:bg-secondary-50/60 dark:border-secondary-800 dark:hover:bg-secondary-800/30"
                      >
                        <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">
                          {sr.produk} — {sr.box} {sr.produk.startsWith("COFFIY") ? "Sachet" : "Box"}
                        </td>
                        <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{formatCurrency(sr.hpp)}</td>
                        <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{formatCurrency(sr.hargaJual)}</td>
                        <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{sr.idOrder || "-"}</td>
                        <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{sr.resiLama || "-"}</td>
                        <td className="px-5 py-3.5 text-secondary-700 dark:text-secondary-200">{sr.resiBaru || "-"}</td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={sr.status === "Tersedia" ? "success" : "secondary"}>{sr.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(sr);
                                setOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-secondary-300 opacity-0 transition-all hover:bg-primary-50 hover:text-primary-600 group-hover:opacity-100 dark:hover:bg-primary-500/10"
                              aria-label="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => removeStockReturn(sr.id)}
                              className="rounded-lg p-1.5 text-secondary-300 opacity-0 transition-all hover:bg-danger-50 hover:text-danger-600 group-hover:opacity-100 dark:hover:bg-danger-500/10"
                              aria-label="Hapus"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddStockReturnDialog open={open} onOpenChange={setOpen} editingItem={editingItem} />
    </div>
  );
}
