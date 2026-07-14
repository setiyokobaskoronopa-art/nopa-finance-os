import { useMemo } from "react";
import Chart from "react-apexcharts";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/format";
import { getLastNMonths, isInBucket } from "@/utils/monthBuckets";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { getEffectiveGrossProvit } from "@/utils/businessCalc";

export function ProfitChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);

  const { categories, profit, hasData } = useMemo(() => {
    const buckets = getLastNMonths(7);
    const profit = buckets.map((b) => {
      const labaKotor = orders
        .filter((o) => isInBucket(o.tanggal, b))
        .reduce((s, o) => s + getEffectiveGrossProvit(o), 0);
      const mutasi = mutations.filter((m) => isInBucket(m.tanggal, b)).reduce((s, m) => s + m.jumlah, 0);
      return labaKotor - mutasi;
    });
    const hasData = profit.some((v) => v !== 0);
    return { categories: buckets.map((b) => b.label), profit, hasData };
  }, [orders, mutations]);

  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Belum ada data profit"
        description="Grafik profit bulanan akan terisi setelah ada order Penjualan tercatat."
      />
    );
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#2563EB"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "45%",
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? "#1E293B" : "#F1F5F9",
      strokeDashArray: 4,
    },
    xaxis: {
      categories,
      labels: { style: { colors: isDark ? "#94A3B8" : "#64748B", fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? "#94A3B8" : "#64748B", fontSize: "11px" },
        formatter: (val: number) => formatCurrency(val, { compact: true }),
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val: number) => formatCurrency(val) },
    },
  };

  const series = [{ name: "Laba Bersih", data: profit }];

  return <Chart options={options} series={series} type="bar" height={260} />;
}
