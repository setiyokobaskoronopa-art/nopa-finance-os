import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import type { KpiDatum } from "@/types/finance";

const accentStyles = {
  primary: {
    bg: "bg-primary-50 dark:bg-primary-500/10",
    text: "text-primary-600 dark:text-primary-400",
    ring: "from-primary-500/10",
  },
  success: {
    bg: "bg-success-50 dark:bg-success-500/10",
    text: "text-success-600 dark:text-success",
    ring: "from-success-500/10",
  },
  danger: {
    bg: "bg-danger-50 dark:bg-danger-500/10",
    text: "text-danger-600 dark:text-danger",
    ring: "from-danger-500/10",
  },
  warning: {
    bg: "bg-warning-50 dark:bg-warning-500/10",
    text: "text-warning-600 dark:text-warning",
    ring: "from-warning-500/10",
  },
  secondary: {
    bg: "bg-secondary-100 dark:bg-secondary-800",
    text: "text-secondary-600 dark:text-secondary-300",
    ring: "from-secondary-500/10",
  },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / range) * 28}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 28" className="h-7 w-20" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({ data, index = 0 }: { data: KpiDatum; index?: number }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[data.icon] ?? Icons.Circle;
  const accent = accentStyles[data.accent];
  const isUp = data.trend === "up";
  const isDown = data.trend === "down";
  const strokeColor =
    data.accent === "primary"
      ? "#2563EB"
      : data.accent === "success"
      ? "#22C55E"
      : data.accent === "danger"
      ? "#EF4444"
      : data.accent === "warning"
      ? "#F59E0B"
      : "#64748B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Card className="group relative overflow-hidden">
        <div
          className={cn(
            "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90",
            accent.ring
          )}
        />
        <div className="relative flex items-start justify-between p-5 pb-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accent.bg, accent.text)}>
            <Icon size={19} />
          </div>
          {data.delta && (
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                isUp && "bg-success-50 text-success-600 dark:bg-success-500/10",
                isDown && "bg-danger-50 text-danger-600 dark:bg-danger-500/10",
                !isUp && !isDown && "bg-secondary-100 text-secondary-600 dark:bg-secondary-800"
              )}
            >
              {isUp && <Icons.ArrowUpRight size={12} />}
              {isDown && <Icons.ArrowDownRight size={12} />}
              {data.delta}
            </span>
          )}
        </div>
        <div className="relative px-5 pb-2">
          <p className="text-xs font-medium text-secondary-400">{data.label}</p>
          <p className="mt-1 text-[22px] font-bold tracking-tight text-secondary-900 dark:text-white">
            {data.value}
          </p>
        </div>
        <div className="relative flex items-end justify-between px-5 pb-5">
          <p className="max-w-[10rem] text-[11px] leading-snug text-secondary-400">{data.footnote}</p>
          {data.sparkline && <MiniSparkline data={data.sparkline} color={strokeColor} />}
        </div>
      </Card>
    </motion.div>
  );
}
