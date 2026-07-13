import Chart from "react-apexcharts";
import { PieChart } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { EmptyState } from "@/components/shared/EmptyState";
import { expenseCategorySeries } from "@/data/dummy";

export function ExpenseCategoryChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (expenseCategorySeries.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="Belum ada data pengeluaran"
        description="Grafik kategori akan terisi setelah ada pengeluaran tercatat."
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
    labels: expenseCategorySeries.map((c) => c.label),
    colors: expenseCategorySeries.map((c) => c.color),
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

  const series = expenseCategorySeries.map((c) => c.value);

  return <Chart options={options} series={series} type="donut" height={300} />;
}
