import { useMemo, useState } from "react";
import { Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MutationsTable } from "@/components/dashboard/MutationsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateSlash } from "@/utils/format";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { getEffectiveGrossProvit } from "@/utils/businessCalc";
import type { KpiDatum } from "@/types/finance";

const fields: FieldConfig[] = [
  { key: "kategori", label: "Keperluan", options: ["Ads", "Biaya Lainnya", "Prive", "Return"] },
  { key: "jumlah", label: "Jumlah (Rp)", type: "number", placeholder: "0" },
  { key: "keterangan", label: "Keterangan", placeholder: "Contoh: Tiktok Ads, Operasional Juli", optional: true },
];

export default function BusinessFinance() {
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const addMutation = useBusinessMutationsStore((s) => s.addItem);
  const removeMutation = useBusinessMutationsStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);

  const kpis = useMemo<KpiDatum[]>(() => {
    const omzet = orders.reduce((s, o) => s + o.totalCustomerBayar, 0);
    const hpp = orders.reduce((s, o) => s + o.hpp, 0);
    const biayaOperasional = orders.reduce((s, o) => s + o.biayaCod + o.pajakCod + o.diskonOngkir + o.promo, 0);
    const labaKotor = orders.reduce((s, o) => s + getEffectiveGrossProvit(o), 0);
    const totalMutasi = mutations.reduce((s, m) => s + m.jumlah, 0);
    const labaBersih = labaKotor - totalMutasi;
    const margin = omzet > 0 ? `${((labaBersih / omzet) * 100).toFixed(1)}%` : "0%";
    const adsSpend = mutations.filter((m) => m.kategori === "Ads").reduce((s, m) => s + m.jumlah, 0);
    const roas = adsSpend > 0 ? `${(omzet / adsSpend).toFixed(1)}x` : "-";

    return [
      { id: "b1", label: "Omzet Bisnis", value: formatCurrency(omzet), icon: "Building2", accent: "primary", footnote: "Dari seluruh order penjualan" },
      { id: "b2", label: "HPP", value: formatCurrency(hpp), icon: "Package", accent: "secondary", footnote: "Harga pokok penjualan" },
      { id: "b3", label: "Biaya Operasional", value: formatCurrency(biayaOperasional), icon: "Factory", accent: "warning", footnote: "Biaya COD + ongkir + promo" },
      { id: "b4", label: "Laba Bersih", value: formatCurrency(labaBersih), icon: "TrendingUp", accent: "success", footnote: "Laba kotor dikurangi mutasi" },
      { id: "b5", label: "Margin Laba", value: margin, icon: "Percent", accent: "secondary", footnote: "Laba bersih / omzet" },
      { id: "b6", label: "ROAS", value: roas, icon: "Target", accent: "primary", footnote: "Omzet / biaya Ads" },
    ];
  }, [orders, mutations]);

  return (
    <div>
      <PageHeader
        title="Keuangan Bisnis"
        description="Ringkasan keuangan bisnis, dihitung otomatis dari data Penjualan."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={15} /> Tambah Mutasi
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
        <Link2 size={14} className="shrink-0" />
        Omzet, HPP & Biaya Operasional otomatis dari <strong className="mx-1">Penjualan</strong>. Laba Bersih otomatis masuk ke{" "}
        <strong className="mx-1">Target 100 Juta Pertama</strong>.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.id} data={kpi} index={idx} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Mutasi Bisnis</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MutationsTable rows={mutations} onDelete={removeMutation} />
          </CardContent>
        </Card>
      </div>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Tambah Mutasi"
        description="Catat pengeluaran Ads, biaya lainnya, prive, atau return."
        fields={fields}
        submitLabel="Simpan Mutasi"
        onSubmit={(v) => {
          const jumlah = Number(v.jumlah.replace(/[^0-9]/g, "")) || 0;
          addMutation({
            tanggal: formatDateSlash(new Date()),
            kategori: v.kategori,
            jumlah,
            keterangan: v.keterangan || "",
          });
        }}
      />
    </div>
  );
}
