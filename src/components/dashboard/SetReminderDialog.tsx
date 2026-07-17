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
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { formatDateSlash } from "@/utils/format";
import { useCustomersMetaStore } from "@/store/customersMetaStore";

interface SetReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerKey: string;
  customerName: string;
  existingDate?: string | null;
  existingNote?: string | null;
}

export function SetReminderDialog({
  open,
  onOpenChange,
  customerKey,
  customerName,
  existingDate,
  existingNote,
}: SetReminderDialogProps) {
  const setReminder = useCustomersMetaStore((s) => s.setReminder);
  const clearReminder = useCustomersMetaStore((s) => s.clearReminder);

  const [date, setDate] = useState(formatDateSlash(new Date()));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setDate(existingDate || formatDateSlash(new Date()));
    setNote(existingNote || "");
  }, [open, existingDate, existingNote]);

  const handleSubmit = () => {
    setReminder(customerKey, date, note.trim());
    onOpenChange(false);
  };

  const handleClear = () => {
    clearReminder(customerKey);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reminder Follow-up</DialogTitle>
          <DialogDescription>Atur pengingat untuk hubungi {customerName}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Tanggal Follow-up</label>
            <DateInput value={date} onChange={setDate} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">
              Catatan <span className="text-secondary-300">— opsional</span>
            </label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Tawarkan promo repeat order" />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {existingDate && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-danger-600">
              Hapus Reminder
            </Button>
          )}
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Simpan Reminder</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
