import { useMemo, useState } from "react";
import { Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MutationsTable } from "@/components/dashboard/MutationsTable";
import { TableFilterBar, FILTER_ALL } from "@/components/shared/TableFilterBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateSlash, parseDateSlash } from "@/utils/format";
import { sortByTanggalDesc } from "@/utils/sortByDate";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { computeLabaBersihBisnis, computeHppTerbayar } from "@/utils/businessCalc";
import type { KpiDatum } from "@/types/finance";

const KATEGORI_OPTIONS = ["Ads", "Biaya Lainnya", "Prive", "Bayar HPP", "Return"];

const fields: FieldConfig[] = [
  { key: "tanggal", label: "Tanggal", type: "date", defaultValue: formatDateSlash(new Date()) },
  { key: "kategori", label: "Keperluan", options: ["Ads", "Biaya Lainnya", "Prive", "Bayar HPP", "Return"] },
  { key: "jumlah", label: "Jumlah (Rp)", type: "number", placeholder: "0" },
  { key: "keterangan", label: "Keterangan", placeholder: "Contoh: Tiktok Ads, Bayar CV Sumber Kolagen", optional: true },
];

export default function BusinessFinance() {
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const addMutation = useBusinessMutationsStore((s) => s.addItem);
  const updateMutation = useBusinessMutationsStore((s) => s.updateItem);
  const removeMutation = useBusinessMutationsStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState(FILTER_ALL);

  const filtersActive = Boolean(search) || Boolean(dateFrom) || Boolean(dateTo) || kategoriFilter !== FILTER_ALL;
  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setKategoriFilter(FILTER_ALL);
  };

  const filteredMutations = useMemo(() => {
    let result = mutations;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((m) => m.keterangan.toLowerCase().includes(q));
    }
    if (dateFrom) {
      const from = parseDateSlash(dateFrom);
      result = result.filter((m) => {
        const d = parseDateSlash(m.tanggal);
        return d && from && d.getTime() >= from.getTime();
      });
    }
    if (dateTo) {
      const to = parseDateSlash(dateTo);
      result = result.filter((m) => {
        const d = parseDateSlash(m.tanggal);
        return d && to && d.getTime() <= to.getTime();
      });
    }
    if (kategoriFilter !== FILTER_ALL) result = result.filter((m) => m.kategori === kategoriFilter);
    return sortByTanggalDesc(result);
  }, [mutations, search, dateFrom, dateTo, kategoriFilter]);

  const kpis = useMemo<KpiDatum[]>(() => {
    const omzet = orders.reduce((s, o) => s + o.totalCustomerBayar, 0);
    const hppTerjual = orders.reduce((s, o) => s + o.hpp, 0);
    const hppTerbayar = computeHppTerbayar(mutations);
    const sisaHpp = Math.max(0, hppTerjual - hppTerbayar);
    const biayaOperasional = orders.reduce((s, o) => s + o.biayaCod + o.pajakCod + o.diskonOngkir + o.promo, 0);
    const labaBersih = computeLabaBersihBisnis(orders, mutations);
    const margin = omzet > 0 ? `${((labaBersih / omzet) * 100).toFixed(1)}%` : "0%";
    const adsSpend = mutations.filter((m) => m.kategori === "Ads").reduce((s, m) => s + m.jumlah, 0);
    const roas = adsSpend > 0 ? `${(omzet / adsSpend).toFixed(1)}x` : "-";

    return [
      { id: "b1", label: "Omzet Bisnis", value: formatCurrency(omzet), icon: "Building2", accent: "primary", footnote: "Dari seluruh order penjualan" },
      {
        id: "b2",
        label: "Sisa HPP Belum Dibayar",
        value: formatCurrency(sisaHpp),
        icon: "Package",
        accent: sisaHpp > 0 ? "warning" : "success",
        footnote: `Total HPP ${formatCurrency(hppTerjual, { compact: true })} — sudah dibayar ${formatCurrency(hppTerbayar, { compact: true })}`,
      },
      { id: "b3", label: "Biaya Operasional", value: formatCurrency(biayaOperasional), icon: "Factory", accent: "warning", footnote: "Biaya COD + ongkir + promo" },
      { id: "b4", label: "Laba Bersih", value: formatCurrency(labaBersih), icon: "TrendingUp", accent: "success", footnote: "Laba kotor dikurangi mutasi (kecuali Bayar HPP)" },
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
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setOpen(true);
            }}
          >
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
            <CardTitle>Mutasi Bisnis {filtersActive && `(${filteredMutations.length} hasil filter)`}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pt-5">
              <TableFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari keterangan..."
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                selects={[{ key: "kategori", label: "Keperluan", value: kategoriFilter, options: KATEGORI_OPTIONS, onChange: setKategoriFilter }]}
                onReset={resetFilters}
                active={filtersActive}
              />
            </div>
            <MutationsTable
              rows={filteredMutations}
              onDelete={removeMutation}
              onEdit={(row) => {
                setEditingId(row.id);
                setOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Mutasi" : "Tambah Mutasi"}
        description={
          editingId
            ? "Perbarui data mutasi bisnis."
            : "Catat pengeluaran Ads, biaya lainnya, prive, pembayaran HPP, atau return."
        }
        fields={fields}
        submitLabel={editingId ? "Simpan Perubahan" : "Simpan Mutasi"}
        initialValues={
          editingId
            ? (() => {
                const row = mutations.find((m) => m.id === editingId);
                return row
                  ? { tanggal: row.tanggal, kategori: row.kategori, jumlah: String(row.jumlah), keterangan: row.keterangan }
                  : null;
              })()
            : null
        }
        onSubmit={(v) => {
          const jumlah = Number(v.jumlah.replace(/[^0-9]/g, "")) || 0;
          if (editingId) {
            updateMutation(editingId, { tanggal: v.tanggal, kategori: v.kategori, jumlah, keterangan: v.keterangan || "" });
          } else {
            addMutation({
              tanggal: v.tanggal || formatDateSlash(new Date()),
              kategori: v.kategori,
              jumlah,
              keterangan: v.keterangan || "",
            });
          }
        }}
      />
    </div>
  );
}
