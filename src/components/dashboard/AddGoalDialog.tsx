import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useGoalsStore } from "@/store/goalsStore";

export function AddGoalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const reset = () => {
    setName("");
    setTarget("");
    setTargetDate("");
  };

  const handleSubmit = () => {
    const numericTarget = Number(target.replace(/[^0-9]/g, ""));
    if (!name.trim() || !numericTarget) return;
    addGoal({ name: name.trim(), target: numericTarget, collected: 0, targetDate: targetDate.trim() || "Berkelanjutan" });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Target Baru</DialogTitle>
          <DialogDescription>Buat target tabungan baru untuk dipantau progresnya.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nama Target</label>
            <Input placeholder="Contoh: Dana Pernikahan" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nominal Target (Rp)</label>
            <Input placeholder="0" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Target Tanggal (opsional)</label>
            <Input placeholder="Contoh: 14 Agu 2026" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Simpan Target</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
