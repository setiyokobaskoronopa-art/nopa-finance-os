import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

const notifications: {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: "warning" | "success" | "info";
}[] = [];

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
              {notifications.length > 0 && (
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                  {notifications.length} baru
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Belum ada notifikasi"
                description="Notifikasi transaksi dan budget akan muncul di sini."
                compact
              />
            ) : (
              <div className="scrollbar-thin max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 text-sm">
                    {n.title}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
