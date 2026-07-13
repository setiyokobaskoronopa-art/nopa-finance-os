import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, ArrowDownCircle, ArrowUpCircle, FileText, Target } from "lucide-react";
import { cn } from "@/utils/cn";

const actions = [
  { label: "Catat Pemasukan", icon: ArrowUpCircle, className: "bg-success-600" },
  { label: "Catat Pengeluaran", icon: ArrowDownCircle, className: "bg-danger-600" },
  { label: "Buat Laporan", icon: FileText, className: "bg-primary-600" },
  { label: "Set Target Baru", icon: Target, className: "bg-warning-600" },
];

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open &&
          actions.map((action, idx) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ delay: idx * 0.04, duration: 0.18 }}
              className="flex items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-medium text-secondary-700 shadow-soft dark:bg-secondary-800 dark:text-secondary-100"
              onClick={() => setOpen(false)}
            >
              {action.label}
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", action.className)}>
                <action.icon size={15} />
              </span>
            </motion.button>
          ))}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow"
        aria-label="Quick actions"
      >
        <motion.div animate={{ rotate: open ? 135 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X size={22} /> : <Plus size={22} />}
        </motion.div>
      </motion.button>
    </div>
  );
}
