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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { formatCurrency } from "@/utils/format";
import { PRODUCT_PRICING, PRODUCT_NAMES } from "@/data/productPricing";
import { useStockReturnsStore, type StockReturnItem } from "@/store/stockReturnsStore";

interface AddStockReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: StockReturnItem | null;
}

export function AddStockReturnDialog({ open, onOpenChange, editingItem }: AddStockReturnDialogProps) {
  const addItem = useStockReturnsStore((s) => s.addItem);
  const updateItem = useStockReturnsStore((s) => s.updateItem);
  const isEditing = Boolean(editingItem);

  const [produk, setProduk] = useState(PRODUCT_NAMES[0]);
  const [box, setBox] = useState(String(PRODUCT_PRICING[PRODUCT_NAMES[0]][0].box));
  const [idOrder, setIdOrder] = useState("");
  const [resiLama, setResiLama] = useState("");

  const boxOptions = PRODUCT_PRICING[produk] ?? [];
  const tier = boxOptions.find((t) => String(t.box) === box) ?? boxOptions[0];
  const isCoffiy = produk.startsWith("COFFIY");
  const boxLabel = isCoffiy ? "Sachet" : "Box";

  const reset = () => {
    setProduk(PRODUCT_NAMES[0]);
    setBox(String(PRODUCT_PRICING[PRODUCT_NAMES[0]][0].box));
    setIdOrder("");
    setResiLama("");
  };

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setProduk(editingItem.produk);
      setBox(editingItem.box);
      setIdOrder(editingItem.idOrder);
      setResiLama(editingItem.resiLama);
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingItem]);

  const handleProdukChange = (p: string) => {
    setProduk(p);
    setBox(String(PRODUCT_PRICING[p][0].box));
  };

  const handleSubmit = () => {
    if (!tier) return;
    const payload = {
      produk,
      box,
      hpp: tier.hpp,
      hargaJual: tier.hargaJual,
      idOrder: idOrder.trim(),
      resiLama: resiLama.trim(),
    };
    if (isEditing && editingItem) {
      updateItem(editingItem.id, payload);
    } else {
      addItem(payload);
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
          <DialogTitle>{isEditing ? "Edit Stock Return" : "Catat Stock Return"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui catatan barang return ini."
              : "Catat barang yang di-return dari customer, biar bisa dipakai ulang di order berikutnya."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Produk</label>
              <Select value={produk} onValueChange={handleProdukChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_NAMES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">{boxLabel}</label>
              <Select value={box} onValueChange={setBox}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boxOptions.map((t) => (
                    <SelectItem key={t.box} value={String(t.box)}>
                      {t.box} {boxLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-secondary-50 p-3 text-xs dark:bg-secondary-800/50">
            <div>
              <p className="text-secondary-400">HPP (otomatis)</p>
              <p className="font-semibold text-secondary-800 dark:text-white">{formatCurrency(tier?.hpp ?? 0)}</p>
            </div>
            <div>
              <p className="text-secondary-400">Harga Jual (otomatis)</p>
              <p className="font-semibold text-secondary-800 dark:text-white">{formatCurrency(tier?.hargaJual ?? 0)}</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">ID Order</label>
            <Input value={idOrder} onChange={(e) => setIdOrder(e.target.value)} placeholder="Contoh: 2349297" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">
              Resi Lama <span className="text-secondary-300">— opsional</span>
            </label>
            <Input value={resiLama} onChange={(e) => setResiLama(e.target.value)} placeholder="No. resi yang di-return" />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>{isEditing ? "Simpan Perubahan" : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
