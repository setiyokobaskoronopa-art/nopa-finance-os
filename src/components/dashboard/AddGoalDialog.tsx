import { useState, useEffect } from "react";
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
import { useGoalsStore, type Goal } from "@/store/goalsStore";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingGoal?: Goal | null;
}

export function AddGoalDialog({ open, onOpenChange, editingGoal }: AddGoalDialogProps) {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const isEditing = Boolean(editingGoal);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const reset = () => {
    setName("");
    setTarget("");
    setTargetDate("");
  };

  useEffect(() => {
    if (!open) return;
    if (editingGoal) {
      setName(editingGoal.name);
      setTarget(String(editingGoal.target));
      setTargetDate(editingGoal.targetDate === "Berkelanjutan" ? "" : editingGoal.targetDate);
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingGoal]);

  const handleSubmit = () => {
    const numericTarget = Number(target.replace(/[^0-9]/g, ""));
    if (!name.trim() || !numericTarget) return;

    if (isEditing && editingGoal) {
      updateGoal(editingGoal.id, {
        name: name.trim(),
        target: numericTarget,
        targetDate: targetDate.trim() || "Berkelanjutan",
      });
    } else {
      addGoal({ name: name.trim(), target: numericTarget, collected: 0, targetDate: targetDate.trim() || "Berkelanjutan" });
    }

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
          <DialogTitle>{isEditing ? "Edit Target" : "Set Target Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail target tabungan ini." : "Buat target tabungan baru untuk dipantau progresnya."}
          </DialogDescription>
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
          <Button onClick={handleSubmit}>{isEditing ? "Simpan Perubahan" : "Simpan Target"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
