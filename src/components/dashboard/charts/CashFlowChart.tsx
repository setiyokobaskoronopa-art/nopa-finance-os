import Chart from "react-apexcharts";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/format";
import { cashFlowSeries } from "@/data/dummy";

export function CashFlowChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#22C55E", "#EF4444"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: isDark ? "#1E293B" : "#F1F5F9",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: cashFlowSeries.categories,
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
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: isDark ? "#CBD5E1" : "#334155" },
      fontSize: "12px",
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val: number) => formatCurrency(val) },
    },
  };

  const series = [
    { name: "Pemasukan", data: cashFlowSeries.income },
    { name: "Pengeluaran", data: cashFlowSeries.expense },
  ];

  return <Chart options={options} series={series} type="area" height={300} />;
}
