import { useEffect } from "react";
import { Webhook } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useEverproCallbacksStore } from "@/store/everproCallbacksStore";

export function EverproCallbackLog() {
  const callbacks = useEverproCallbacksStore((s) => s.callbacks);
  const fetchCallbacks = useEverproCallbacksStore((s) => s.fetchCallbacks);

  useEffect(() => {
    fetchCallbacks();
  }, [fetchCallbacks]);

  if (callbacks.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Log Callback Everpro</CardTitle>
        <span className="text-xs text-secondary-400">{callbacks.length} event terakhir</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="scrollbar-thin max-h-72 overflow-y-auto">
          {callbacks.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 border-b border-secondary-50 px-5 py-3 last:border-0 dark:border-secondary-800"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-secondary-500 dark:bg-secondary-800">
                <Webhook size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-secondary-800 dark:text-secondary-100">
                  AWB: {c.awbNumber || "-"} · Status: {c.trackingCode || "-"}
                </p>
                <p className="truncate text-[11px] text-secondary-400">
                  {new Date(c.receivedAt).toLocaleString("id-ID")}
                </p>
              </div>
              <Badge variant={c.matched ? "success" : "warning"} className="shrink-0 text-[10px]">
                {c.matched ? "Ter-update" : "Tidak cocok"}
              </Badge>
            </div>
          ))}
        </div>
        <p className="border-t border-secondary-100 px-5 py-3 text-[11px] text-secondary-400 dark:border-secondary-800">
          Kalau ada yang "Tidak cocok", isi No. Resi (AWB) di order yang sesuai lewat tombol Edit di tabel Penjualan.
        </p>
      </CardContent>
    </Card>
  );
}
