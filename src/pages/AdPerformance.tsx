import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Radio, Search, Sparkles, Settings2 } from "lucide-react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { EntityFormDialog, type FieldConfig } from "@/components/shared/EntityFormDialog";
import { TableFilterBar, FILTER_ALL } from "@/components/shared/TableFilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateSlash, parseDateSlash, formatNumber } from "@/utils/format";
import { sortByTanggalDesc } from "@/utils/sortByDate";
import { useAdPerformanceStore, type AdPerformanceItem } from "@/store/adPerformanceStore";
import type { KpiDatum, TableColumn } from "@/types/finance";

const PLATFORM_OPTIONS = ["Meta Ads", "Google Ads"];

const fields: FieldConfig[] = [
  { key: "platform", label: "Platform", options: PLATFORM_OPTIONS },
  { key: "namaCampaign", label: "Nama Campaign", placeholder: "Contoh: DVN Collagen - Konversi Juli" },
  { key: "tanggal", label: "Tanggal", type: "date", defaultValue: formatDateSlash(new Date()) },
  { key: "spend", label: "Spend / Biaya (Rp)", type: "number", placeholder: "0" },
  { key: "impressions", label: "Impressions", type: "number", placeholder: "0" },
  { key: "clicks", label: "Clicks", type: "number", placeholder: "0" },
  { key: "conversions", label: "Conversions", type: "number", placeholder: "0" },
  { key: "revenue", label: "Revenue Dihasilkan (Rp)", type: "number", placeholder: "0", optional: true },
];

function platformIcon(platform: string) {
  if (platform === "Meta Ads") return <Radio size={13} className="text-[#1877F2]" />;
  if (platform === "Google Ads") return <Search size={13} className="text-[#4285F4]" />;
  return <Megaphone size={13} />;
}

export default function AdPerformance() {
  const navigate = useNavigate();
  const rows = useAdPerformanceStore((s) => s.items);
  const addItem = useAdPerformanceStore((s) => s.addItem);
  const updateItem = useAdPerformanceStore((s) => s.updateItem);
  const removeItem = useAdPerformanceStore((s) => s.removeItem);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [platformFilter, setPlatformFilter] = useState(FILTER_ALL);

  const filtersActive = Boolean(search) || Boolean(dateFrom) || Boolean(dateTo) || platformFilter !== FILTER_ALL;
  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPlatformFilter(FILTER_ALL);
  };

  const filteredRows = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => r.namaCampaign.toLowerCase().includes(q));
    }
    if (dateFrom) {
      const from = parseDateSlash(dateFrom);
      result = result.filter((r) => {
        const d = parseDateSlash(r.tanggal);
        return d && from && d.getTime() >= from.getTime();
      });
    }
    if (dateTo) {
      const to = parseDateSlash(dateTo);
      result = result.filter((r) => {
        const d = parseDateSlash(r.tanggal);
        return d && to && d.getTime() <= to.getTime();
      });
    }
    if (platformFilter !== FILTER_ALL) result = result.filter((r) => r.platform === platformFilter);
    return sortByTanggalDesc(result);
  }, [rows, search, dateFrom, dateTo, platformFilter]);

  const kpis = useMemo<KpiDatum[]>(() => {
    const totalSpend = filteredRows.reduce((s, r) => s + r.spend, 0);
    const totalClicks = filteredRows.reduce((s, r) => s + r.clicks, 0);
    const totalImpressions = filteredRows.reduce((s, r) => s + r.impressions, 0);
    const totalRevenue = filteredRows.reduce((s, r) => s + r.revenue, 0);
    const avgCtr = totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0%";
    const avgRoas = totalSpend > 0 ? `${(totalRevenue / totalSpend).toFixed(1)}x` : "0x";

    return [
      { id: "ad1", label: "Total Spend", value: formatCurrency(totalSpend), icon: "Wallet", accent: "danger" },
      { id: "ad2", label: "Total Clicks", value: formatNumber(totalClicks), icon: "MousePointerClick", accent: "primary", footnote: `CTR rata-rata ${avgCtr}` },
      { id: "ad3", label: "Total Conversions", value: formatNumber(filteredRows.reduce((s, r) => s + r.conversions, 0)), icon: "Target", accent: "success" },
      { id: "ad4", label: "ROAS Rata-rata", value: avgRoas, icon: "TrendingUp", accent: avgRoas === "0x" ? "secondary" : "warning" },
    ];
  }, [filteredRows]);

  const columns: TableColumn<AdPerformanceItem>[] = [
    {
      key: "platform",
      header: "Platform",
      render: (r) => (
        <span className="flex items-center gap-1.5">
          {platformIcon(r.platform)} {r.platform}
        </span>
      ),
    },
    { key: "namaCampaign", header: "Campaign" },
    { key: "tanggal", header: "Tanggal" },
    { key: "spend", header: "Spend", align: "right", render: (r) => formatCurrency(r.spend) },
    { key: "clicks", header: "Clicks", align: "right", render: (r) => formatNumber(r.clicks) },
    {
      key: "impressions",
      header: "CTR",
      align: "right",
      render: (r) => (r.impressions > 0 ? `${((r.clicks / r.impressions) * 100).toFixed(2)}%` : "-"),
    },
    {
      key: "conversions",
      header: "CPA",
      align: "right",
      render: (r) => (r.conversions > 0 ? formatCurrency(r.spend / r.conversions) : "-"),
    },
    {
      key: "revenue",
      header: "ROAS",
      align: "right",
      render: (r) => {
        if (r.spend <= 0 || r.revenue <= 0) return "-";
        const roas = r.revenue / r.spend;
        return (
          <span className={roas >= 3 ? "font-semibold text-success-600" : roas >= 1 ? "text-secondary-700" : "text-danger-600"}>
            {roas.toFixed(1)}x
          </span>
        );
      },
    },
    {
      key: "sumber",
      header: "Sumber",
      align: "center",
      render: (r) =>
        r.sumber === "API" ? (
          <Badge variant="success" className="gap-1">
            <Sparkles size={10} /> API
          </Badge>
        ) : (
          <Badge variant="secondary">Manual</Badge>
        ),
    },
  ];

  const editingRow = rows.find((r) => r.id === editingId) ?? null;
  const initialValues = editingRow
    ? {
        platform: editingRow.platform,
        namaCampaign: editingRow.namaCampaign,
        tanggal: editingRow.tanggal,
        spend: String(editingRow.spend),
        impressions: String(editingRow.impressions),
        clicks: String(editingRow.clicks),
        conversions: String(editingRow.conversions),
        revenue: String(editingRow.revenue),
      }
    : null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpen(true);
  };
  const handleOpenEdit = (row: AdPerformanceItem) => {
    setEditingId(row.id);
    setOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => navigate("/performa-ads/integrasi")}>
          <Settings2 size={15} /> Kelola Integrasi Platform
        </Button>
      </div>

      <TableFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama campaign..."
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selects={[{ key: "platform", label: "Platform", value: platformFilter, options: PLATFORM_OPTIONS, onChange: setPlatformFilter }]}
        onReset={resetFilters}
        active={filtersActive}
      />

      <FinancePageTemplate
        title="Performa Ads"
        description="Pantau performa campaign Meta Ads & Google Ads — CTR, CPA, ROAS otomatis dihitung."
        kpis={kpis}
        tableTitle={`Riwayat Campaign ${filtersActive ? `(${filteredRows.length} hasil filter)` : ""}`}
        columns={columns}
        rows={filteredRows}
        addLabel="Catat Performa"
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(row) => removeItem(row.id)}
        emptyTitle={filtersActive ? "Tidak ada campaign yang cocok" : "Belum ada data performa ads"}
        emptyDescription={filtersActive ? "Coba ubah atau reset filter kamu." : "Klik 'Catat Performa' untuk mulai mencatat campaign Meta Ads atau Google Ads."}
      />

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Performa Campaign" : "Catat Performa Campaign"}
        description="Isi angka dari dashboard Meta Ads Manager / Google Ads kamu."
        fields={fields}
        submitLabel={editingId ? "Simpan Perubahan" : "Simpan"}
        initialValues={initialValues}
        onSubmit={(v) => {
          const payload = {
            platform: v.platform,
            namaCampaign: v.namaCampaign,
            tanggal: v.tanggal || formatDateSlash(new Date()),
            spend: Number(v.spend.replace(/[^0-9]/g, "")) || 0,
            impressions: Number(v.impressions.replace(/[^0-9]/g, "")) || 0,
            clicks: Number(v.clicks.replace(/[^0-9]/g, "")) || 0,
            conversions: Number(v.conversions.replace(/[^0-9]/g, "")) || 0,
            revenue: Number((v.revenue || "0").replace(/[^0-9]/g, "")) || 0,
            sumber: "Manual",
          };
          if (editingId) updateItem(editingId, payload);
          else addItem(payload);
        }}
      />
    </div>
  );
}
