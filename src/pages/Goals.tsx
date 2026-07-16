import { useState } from "react";
import { Plus, Trash2, Pencil, PiggyBank, Target as TargetIcon, Link2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { AddGoalDialog } from "@/components/dashboard/AddGoalDialog";
import { useGoalsStore, type Goal } from "@/store/goalsStore";
import { useSalesStore } from "@/store/entityStores";
import { useBusinessMutationsStore } from "@/store/businessMutationsStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { computeTotalProfit } from "@/utils/businessCalc";
import { formatCurrency } from "@/utils/format";

export default function Goals() {
  const goals = useGoalsStore((s) => s.goals);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const addToGoal = useGoalsStore((s) => s.addToGoal);
  const orders = useSalesStore((s) => s.items);
  const mutations = useBusinessMutationsStore((s) => s.items);
  const transactions = useTransactionsStore((s) => s.transactions);
  const labaBersih = computeTotalProfit(orders, mutations, transactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<Record<string, string>>({});

  const handleContribute = (id: string) => {
    const raw = contributions[id] || "";
    const amount = Number(raw.replace(/[^0-9]/g, ""));
    if (!amount) return;
    addToGoal(id, amount);
    setContributions((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div>
      <PageHeader
        title="Target"
        description="Pantau dan kelola progres target finansial Anda."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditingGoal(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={15} /> Set Target Baru
          </Button>
        }
      />

      {goals.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={TargetIcon}
              title="Belum ada target"
              description="Buat target tabungan pertama Anda untuk mulai memantau progres."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingGoal(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus size={14} /> Set Target Baru
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map((g) => {
            const isAutoLinked = g.autoLinked;
            const collected = isAutoLinked ? Math.max(0, labaBersih) : g.collected;
            const pct = g.target > 0 ? Math.min(100, Math.round((collected / g.target) * 100)) : 0;
            return (
              <Card key={g.id} className="group relative">
                <CardContent className="pt-5">
                  <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditingGoal(g);
                        setDialogOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-secondary-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10"
                      aria-label="Edit target"
                    >
                      <Pencil size={15} />
                    </button>
                    {!isAutoLinked && (
                      <button
                        onClick={() => deleteGoal(g.id)}
                        className="rounded-lg p-1.5 text-secondary-300 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10"
                        aria-label="Hapus target"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-50 text-warning-600 dark:bg-warning-500/10">
                      <PiggyBank size={20} />
                    </span>
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white">{g.name}</p>
                      <p className="text-xs text-secondary-400">{g.targetDate}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-end justify-between">
                      <p className="text-2xl font-bold text-secondary-900 dark:text-white">{pct}%</p>
                      <p className="text-xs text-secondary-400">
                        {formatCurrency(collected)} / {formatCurrency(g.target)}
                      </p>
                    </div>
                    <Progress value={pct} />
                  </div>

                  {isAutoLinked ? (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-50/60 px-3 py-2 text-[11px] text-primary-700 dark:bg-primary-500/5 dark:text-primary-300">
                      <Link2 size={12} className="shrink-0" />
                      Otomatis dari Laba Bersih Bisnis + transaksi manual
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Tambah dana (Rp)"
                        inputMode="numeric"
                        value={contributions[g.id] || ""}
                        onChange={(e) => setContributions((prev) => ({ ...prev, [g.id]: e.target.value }))}
                      />
                      <Button variant="outline" onClick={() => handleContribute(g.id)}>
                        Tambah
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} editingGoal={editingGoal} />
    </div>
  );
}
