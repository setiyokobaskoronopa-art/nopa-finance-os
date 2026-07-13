import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/utils/cn";
import { recentActivities } from "@/data/dummy";

const accentBg = {
  primary: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
  success: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success",
  danger: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger",
  warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning",
  secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-300",
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <EmptyState
            icon={Icons.Activity}
            title="Belum ada aktivitas"
            description="Aktivitas terbaru akan muncul di sini."
          />
        ) : (
        <div className="space-y-4">
          {recentActivities.map((act, idx) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[act.icon] ?? Icons.Circle;
            return (
              <div key={act.id} className="relative flex gap-3">
                {idx !== recentActivities.length - 1 && (
                  <span className="absolute left-[19px] top-9 h-[calc(100%-4px)] w-px bg-secondary-100 dark:bg-secondary-800" />
                )}
                <div className={cn("z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", accentBg[act.accent])}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">{act.title}</p>
                  <p className="mt-0.5 text-xs text-secondary-400">{act.description}</p>
                  <p className="mt-1 text-[11px] text-secondary-300">{act.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
