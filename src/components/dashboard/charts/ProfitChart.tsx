import Chart from "react-apexcharts";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/format";
import { profitSeries } from "@/data/dummy";

export function ProfitChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasData = profitSeries.profit.some((v) => v > 0);
  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Belum ada data profit"
        description="Grafik profit bulanan akan terisi setelah ada pemasukan tercatat."
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
      categories: profitSeries.categories,
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

  const series = [{ name: "Profit", data: profitSeries.profit }];

  return <Chart options={options} series={series} type="bar" height={260} />;
}
