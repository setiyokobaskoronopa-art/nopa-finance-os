import { useMemo } from "react";
import Chart from "react-apexcharts";
import { LineChart } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/format";
import { getLastNMonths, isInBucket } from "@/utils/monthBuckets";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";

export function CashFlowChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);

  const { categories, income, expense, hasData } = useMemo(() => {
    const buckets = getLastNMonths(7);
    const income = buckets.map((b) => {
      const sales = orders.filter((o) => isInBucket(o.tanggal, b)).reduce((s, o) => s + o.cashIn, 0);
      return sales;
    });
    const expense = buckets.map((b) => {
      const mut = mutations.filter((m) => isInBucket(m.tanggal, b)).reduce((s, m) => s + m.jumlah, 0);
      return mut;
    });
    const hasData = income.some((v) => v > 0) || expense.some((v) => v > 0);
    return { categories: buckets.map((b) => b.label), income, expense, hasData };
  }, [orders, mutations]);

  if (!hasData) {
    return (
      <EmptyState
        icon={LineChart}
        title="Belum ada data cash flow"
        description="Grafik akan terisi setelah ada order Penjualan atau Mutasi Bisnis."
      />
    );
  }

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
    { name: "Cash In (Penjualan)", data: income },
    { name: "Mutasi Bisnis", data: expense },
  ];

  return <Chart options={options} series={series} type="area" height={300} />;
}
