import { useMemo } from "react";
import Chart from "react-apexcharts";
import { PieChart } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";

const CATEGORY_COLORS: Record<string, string> = {
  "HPP Produk": "#0F172A",
  "Biaya COD + Ongkir + Promo": "#F59E0B",
  Ads: "#2563EB",
  "Biaya Lainnya": "#64748B",
  Prive: "#EF4444",
  Return: "#94A3B8",
};

export function ExpenseCategoryChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);

  const { labels, series, colors } = useMemo(() => {
    const hpp = orders.reduce((s, o) => s + o.hpp, 0);
    const biayaOperasional = orders.reduce((s, o) => s + o.biayaCod + o.pajakCod + o.diskonOngkir + o.promo, 0);
    const byKategori: Record<string, number> = { Ads: 0, "Biaya Lainnya": 0, Prive: 0, Return: 0 };
    for (const m of mutations) {
      if (byKategori[m.kategori] !== undefined) byKategori[m.kategori] += m.jumlah;
    }

    const entries = (
      [
        ["HPP Produk", hpp],
        ["Biaya COD + Ongkir + Promo", biayaOperasional],
        ["Ads", byKategori["Ads"]],
        ["Biaya Lainnya", byKategori["Biaya Lainnya"]],
        ["Prive", byKategori["Prive"]],
        ["Return", byKategori["Return"]],
      ] as [string, number][]
    ).filter(([, v]) => v > 0);

    return {
      labels: entries.map(([l]) => l),
      series: entries.map(([, v]) => v),
      colors: entries.map(([l]) => CATEGORY_COLORS[l] ?? "#94A3B8"),
    };
  }, [orders, mutations]);

  if (series.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="Belum ada data pengeluaran"
        description="Grafik kategori akan terisi setelah ada order Penjualan atau Mutasi Bisnis."
      />
    );
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    labels,
    colors,
    stroke: { show: true, width: 3, colors: [isDark ? "#111827" : "#FFFFFF"] },
    dataLabels: {
      enabled: true,
      style: { fontSize: "11px", fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    legend: {
      position: "bottom",
      labels: { colors: isDark ? "#CBD5E1" : "#334155" },
      fontSize: "12px",
      markers: { size: 6 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: isDark ? "#F8FAFC" : "#0F172A",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  return <Chart options={options} series={series} type="donut" height={300} />;
}
