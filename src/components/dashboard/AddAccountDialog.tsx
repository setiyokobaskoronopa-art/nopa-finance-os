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
import { useAccountsStore } from "@/store/accountsStore";

const colorOptions = [
  { color: "#2563EB", label: "Biru" },
  { color: "#0F172A", label: "Navy" },
  { color: "#22C55E", label: "Hijau" },
  { color: "#F59E0B", label: "Kuning" },
  { color: "#EF4444", label: "Merah" },
];

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const addAccount = useAccountsStore((s) => s.addAccount);

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(colorOptions[0].color);

  const reset = () => {
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setBalance("");
    setColor(colorOptions[0].color);
  };

  const handleSubmit = () => {
    if (!bankName.trim() || !accountName.trim()) return;
    const numericBalance = Number(balance.replace(/[^0-9]/g, "")) || 0;

    addAccount({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim() || "••••",
      accountName: accountName.trim(),
      balance: numericBalance,
      color,
      logoInitial: bankName.trim().charAt(0).toUpperCase() || "B",
    });

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
          <DialogTitle>Tambah Rekening</DialogTitle>
          <DialogDescription>Tambahkan rekening bank baru untuk dipantau saldonya.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nama Bank</label>
            <Input placeholder="Contoh: BCA, BRI, Mandiri" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Atas Nama</label>
            <Input
              placeholder="Nama pemilik rekening"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">No. Rekening (opsional)</label>
              <Input
                placeholder="•••• 1234"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Saldo Awal (Rp)</label>
              <Input placeholder="0" inputMode="numeric" value={balance} onChange={(e) => setBalance(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Warna Kartu</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setColor(c.color)}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c.color ? "scale-110 ring-2 ring-offset-2 ring-primary-500" : ""
                  }`}
                  style={{ backgroundColor: c.color }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Simpan Rekening</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
