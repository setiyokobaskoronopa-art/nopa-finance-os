import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Bell } from "lucide-react";
import { cn } from "@/utils/cn";

const notifications = [
  {
    id: 1,
    title: "Budget Marketing hampir habis",
    desc: "82% dari budget bulan ini sudah terpakai",
    time: "8 jam lalu",
    type: "warning" as const,
  },
  {
    id: 2,
    title: "Pembayaran diterima",
    desc: "Order Shopee Rp458.000 telah dikonfirmasi",
    time: "2 jam lalu",
    type: "success" as const,
  },
  {
    id: 3,
    title: "Laporan bulanan siap",
    desc: "Laporan Keuangan Juni 2026 telah dibuat",
    time: "1 hari lalu",
    type: "info" as const,
  },
];

const iconMap = {
  warning: { icon: AlertTriangle, className: "bg-warning-50 text-warning-600 dark:bg-warning-500/10" },
  success: { icon: CheckCircle2, className: "bg-success-50 text-success-600 dark:bg-success-500/10" },
  info: { icon: Info, className: "bg-primary-50 text-primary-600 dark:bg-primary-500/10" },
};

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-soft dark:border-secondary-700 dark:bg-secondary-900"
          >
            <div className="flex items-center justify-between border-b border-secondary-100 px-4 py-3 dark:border-secondary-800">
              <p className="text-sm font-semibold text-secondary-900 dark:text-white">Notifikasi</p>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                {notifications.length} baru
              </span>
            </div>
            <div className="scrollbar-thin max-h-80 overflow-y-auto">
              {notifications.map((n) => {
                const cfg = iconMap[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className="flex gap-3 border-b border-secondary-50 px-4 py-3 last:border-0 hover:bg-secondary-50/60 dark:border-secondary-800 dark:hover:bg-secondary-800/40"
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.className)}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-secondary-900 dark:text-white">{n.title}</p>
                      <p className="truncate text-xs text-secondary-400">{n.desc}</p>
                      <p className="mt-0.5 text-[11px] text-secondary-300">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-medium text-primary-600 hover:bg-primary-50/60 dark:text-primary-400 dark:hover:bg-primary-500/5">
              <Bell size={13} /> Lihat semua notifikasi
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
