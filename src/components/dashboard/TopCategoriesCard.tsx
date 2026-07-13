import { PieChart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/format";
import { topCategories } from "@/data/dummy";

const barColors = ["#2563EB", "#22C55E", "#F59E0B", "#0F172A", "#94A3B8"];

export function TopCategoriesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Teratas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="Belum ada kategori"
            description="Kategori pengeluaran teratas akan muncul di sini."
            compact
          />
        ) : (
        topCategories.map((c, idx) => (
          <div key={c.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-secondary-700 dark:text-secondary-200">{c.name}</span>
              <span className="text-secondary-400">{formatCurrency(c.value, { compact: true })}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${c.share}%`, backgroundColor: barColors[idx % barColors.length] }}
              />
            </div>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  );
}
