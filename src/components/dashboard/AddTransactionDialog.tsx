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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useTransactionsStoreBase } from "@/store/transactionsStore";
import { formatDateSlash } from "@/utils/format";
import type { TransactionItem } from "@/types/finance";

const categories = [
  "Penjualan",
  "Marketing",
  "Bahan Baku",
  "Operasional",
  "Kebutuhan Harian",
  "Transportasi",
  "Tabungan",
  "Lainnya",
];

const methods = ["Transfer Bank", "Kartu Debit", "Kartu Kredit", "E-Wallet", "Tunai"];

const avatarColors = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#0F172A"];

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "income" | "expense";
  editingTransaction?: TransactionItem | null;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultType = "income",
  editingTransaction,
}: AddTransactionDialogProps) {
  const addItem = useTransactionsStoreBase((s) => s.addItem);
  const updateItem = useTransactionsStoreBase((s) => s.updateItem);
  const isEditing = Boolean(editingTransaction);

  const [name, setName] = useState("");
  const [tanggal, setTanggal] = useState(formatDateSlash(new Date()));
  const [category, setCategory] = useState(categories[0]);
  const [method, setMethod] = useState(methods[0]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">(defaultType);

  useEffect(() => {
    if (!open) return;
    if (editingTransaction) {
      setName(editingTransaction.name);
      setTanggal(editingTransaction.date);
      setCategory(editingTransaction.category);
      setMethod(editingTransaction.method);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
    } else {
      setType(defaultType);
      setTanggal(formatDateSlash(new Date()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultType, editingTransaction]);

  const reset = () => {
    setName("");
    setTanggal(formatDateSlash(new Date()));
    setCategory(categories[0]);
    setMethod(methods[0]);
    setAmount("");
    setType(defaultType);
  };

  const handleSubmit = () => {
    const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!name.trim() || !numericAmount) return;

    if (isEditing && editingTransaction) {
      updateItem(editingTransaction.id, {
        name: name.trim(),
        date: tanggal,
        category,
        amount: numericAmount,
        type,
        method,
      });
    } else {
      addItem({
        name: name.trim(),
        category,
        date: tanggal,
        amount: numericAmount,
        type,
        status: "success",
        method,
        avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      });
    }

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
          <DialogTitle>{isEditing ? "Edit Transaksi" : "Catat Transaksi Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail transaksi ini." : "Tambahkan pemasukan atau pengeluaran baru ke dashboard Anda."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`rounded-xl border py-2 text-sm font-medium transition-colors ${
                type === "income"
                  ? "border-success-500 bg-success-50 text-success-600 dark:bg-success-500/10"
                  : "border-secondary-200 text-secondary-500 dark:border-secondary-700"
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`rounded-xl border py-2 text-sm font-medium transition-colors ${
                type === "expense"
                  ? "border-danger-500 bg-danger-50 text-danger-600 dark:bg-danger-500/10"
                  : "border-secondary-200 text-secondary-500 dark:border-secondary-700"
              }`}
            >
              Pengeluaran
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Keterangan</label>
            <Input
              placeholder="Contoh: Order Shopee, Bayar Supplier"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Tanggal</label>
              <DateInput value={tanggal} onChange={setTanggal} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Jumlah (Rp)</label>
              <Input
                placeholder="0"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Kategori</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Metode</label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>{isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
