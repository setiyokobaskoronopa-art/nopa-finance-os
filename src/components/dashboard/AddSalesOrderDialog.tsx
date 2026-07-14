import { useMemo, useState, useEffect } from "react";
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
import { useSalesStore } from "@/store/entityStores";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDateSlash } from "@/utils/format";

const COD_FEE_RATE = 0.03; // 3%
const COD_TAX_RATE = 0.0033; // 0.33% (dihitung dari data aktual sheet kamu)

interface AddSalesOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSalesOrderDialog({ open, onOpenChange }: AddSalesOrderDialogProps) {
  const addItem = useSalesStore((s) => s.addItem);
  const profile = useAuthStore((s) => s.profile);

  const [cs, setCs] = useState(profile.name || "");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [kode, setKode] = useState("O");
  const [ekspedis, setEkspedis] = useState("");
  const [produk, setProduk] = useState("");
  const [box, setBox] = useState("");
  const [hargaTotalProduk, setHargaTotalProduk] = useState("");
  const [diskonOngkir, setDiskonOngkir] = useState("0");
  const [totalCustomerBayar, setTotalCustomerBayar] = useState("");
  const [promo, setPromo] = useState("0");
  const [hpp, setHpp] = useState("");
  const [status, setStatus] = useState("On Proses");

  const reset = () => {
    setCs(profile.name || "");
    setNamaCustomer("");
    setKode("O");
    setEkspedis("");
    setProduk("");
    setBox("");
    setHargaTotalProduk("");
    setDiskonOngkir("0");
    setTotalCustomerBayar("");
    setPromo("0");
    setHpp("");
    setStatus("On Proses");
  };

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const num = (v: string) => Number(v.replace(/[^0-9]/g, "")) || 0;
  const isCod = /cod/i.test(ekspedis);

  const preview = useMemo(() => {
    const totalBayar = num(totalCustomerBayar) || num(hargaTotalProduk);
    const biayaCod = isCod ? Math.round(totalBayar * COD_FEE_RATE) : 0;
    const pajakCod = isCod ? Math.round(totalBayar * COD_TAX_RATE) : 0;
    const cashIn = totalBayar - biayaCod - pajakCod - num(diskonOngkir) - num(promo);
    const grossProvit = cashIn - num(hpp);
    return { totalBayar, biayaCod, pajakCod, cashIn, grossProvit };
  }, [totalCustomerBayar, hargaTotalProduk, diskonOngkir, promo, hpp, isCod]);

  const handleSubmit = () => {
    if (!namaCustomer.trim() || !hargaTotalProduk || !hpp) return;

    addItem({
      cs: cs.trim() || "Setyo",
      tanggal: formatDateSlash(new Date()),
      namaCustomer: namaCustomer.trim(),
      kode,
      ekspedis: ekspedis.trim(),
      produk: produk.trim(),
      box: box.trim(),
      hargaTotalProduk: num(hargaTotalProduk),
      diskonOngkir: num(diskonOngkir),
      totalCustomerBayar: preview.totalBayar,
      biayaCod: preview.biayaCod,
      pajakCod: preview.pajakCod,
      promo: num(promo),
      cashIn: preview.cashIn,
      hpp: num(hpp),
      grossProvit: preview.grossProvit,
      status,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Buat Order Baru</DialogTitle>
          <DialogDescription>
            Isi sesuai kolom laporan penjualan Anda. Biaya COD, Cash In, dan Gross Provit dihitung otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">CS</label>
              <Input value={cs} onChange={(e) => setCs(e.target.value)} placeholder="Nama CS" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Kode</label>
              <Select value={kode} onValueChange={setKode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="O">(O) Online / Transfer</SelectItem>
                  <SelectItem value="R">(R) COD / Retur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nama Customer</label>
            <Input value={namaCustomer} onChange={(e) => setNamaCustomer(e.target.value)} placeholder="Nama pelanggan" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Ekspedis</label>
              <Input
                value={ekspedis}
                onChange={(e) => setEkspedis(e.target.value)}
                placeholder="Contoh: JNT TIKTOK, JNE COD"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Produk</label>
              <Input value={produk} onChange={(e) => setProduk(e.target.value)} placeholder="Contoh: DVN Collagen" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Box</label>
            <Input value={box} onChange={(e) => setBox(e.target.value)} placeholder="Contoh: 5 Sachet, 1+1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Harga Total Produk (Rp)</label>
              <Input
                inputMode="numeric"
                value={hargaTotalProduk}
                onChange={(e) => setHargaTotalProduk(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Diskon Ongkir (Rp)</label>
              <Input inputMode="numeric" value={diskonOngkir} onChange={(e) => setDiskonOngkir(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">
                Total Customer Bayar (Rp)
              </label>
              <Input
                inputMode="numeric"
                value={totalCustomerBayar}
                onChange={(e) => setTotalCustomerBayar(e.target.value)}
                placeholder={hargaTotalProduk || "0"}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Promo (Rp)</label>
              <Input inputMode="numeric" value={promo} onChange={(e) => setPromo(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">HPP (Rp)</label>
              <Input inputMode="numeric" value={hpp} onChange={(e) => setHpp(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Proses">On Proses</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
            <p className="mb-2 text-xs font-semibold text-primary-700 dark:text-primary-300">
              Kalkulasi Otomatis {isCod && "(COD terdeteksi dari Ekspedis)"}
            </p>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs text-secondary-600 dark:text-secondary-300">
              <span>Biaya COD (3%)</span>
              <span className="text-right font-medium">{formatCurrency(preview.biayaCod)}</span>
              <span>Pajak COD (0,33%)</span>
              <span className="text-right font-medium">{formatCurrency(preview.pajakCod)}</span>
              <span className="font-semibold text-secondary-800 dark:text-white">Cash In</span>
              <span className="text-right font-semibold text-secondary-800 dark:text-white">
                {formatCurrency(preview.cashIn)}
              </span>
              <span className="font-semibold text-success-600">Gross Provit</span>
              <span className="text-right font-semibold text-success-600">{formatCurrency(preview.grossProvit)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Simpan Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
