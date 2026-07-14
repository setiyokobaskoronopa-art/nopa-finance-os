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
import { PRODUCT_PRICING, PRODUCT_NAMES } from "@/data/productPricing";

const COD_FEE_RATE = 0.03; // 3%
const COD_TAX_RATE = 0.0033; // 0.33% (dihitung dari data aktual laporan kamu)

const EKSPEDIS_OPTIONS = ["JNE", "J&T", "SICEPAT", "LION", "POS", "GOJEK"];
const METODE_OPTIONS = ["Transfer", "COD", "Kredit"];
const PLATFORM_OPTIONS = ["Database", "Website", "Meta", "Google", "Tiktok Shop", "Organik"];
const STATUS_OPTIONS = ["On Proses", "Delivered", "Problem", "Return"];
const KODE_OPTIONS = [
  { value: "O", label: "O - OTS" },
  { value: "F", label: "F - Follow Up" },
  { value: "R", label: "R - Repeat" },
];

interface AddSalesOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSalesOrderDialog({ open, onOpenChange }: AddSalesOrderDialogProps) {
  const addItem = useSalesStore((s) => s.addItem);
  const profile = useAuthStore((s) => s.profile);

  const [cs, setCs] = useState(profile.name || "");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [noWa, setNoWa] = useState("");
  const [kode, setKode] = useState("O");
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0]);
  const [metodePembayaran, setMetodePembayaran] = useState("Transfer");
  const [ekspedis, setEkspedis] = useState(EKSPEDIS_OPTIONS[0]);
  const [produk, setProduk] = useState(PRODUCT_NAMES[0]);
  const [box, setBox] = useState("1");
  const [hargaTotalProduk, setHargaTotalProduk] = useState("");
  const [diskonOngkir, setDiskonOngkir] = useState("0");
  const [totalCustomerBayar, setTotalCustomerBayar] = useState("");
  const [promo, setPromo] = useState("0");
  const [hpp, setHpp] = useState("");
  const [status, setStatus] = useState("On Proses");

  const isCoffiy = produk.startsWith("COFFIY");
  const boxFieldLabel = isCoffiy ? "Sachet" : "Box";

  const boxOptions = PRODUCT_PRICING[produk] ?? [];

  const applyPricing = (produkName: string, boxValue: string) => {
    const tier = PRODUCT_PRICING[produkName]?.find((t) => String(t.box) === boxValue);
    if (tier) {
      setHpp(String(tier.hpp));
      setHargaTotalProduk(String(tier.hargaJual));
    }
  };

  const handleProdukChange = (v: string) => {
    setProduk(v);
    const firstBox = String(PRODUCT_PRICING[v]?.[0]?.box ?? "1");
    setBox(firstBox);
    applyPricing(v, firstBox);
  };

  const handleBoxChange = (v: string) => {
    setBox(v);
    applyPricing(produk, v);
  };

  const reset = () => {
    setCs(profile.name || "");
    setNamaCustomer("");
    setNoWa("");
    setKode("O");
    setPlatform(PLATFORM_OPTIONS[0]);
    setMetodePembayaran("Transfer");
    setEkspedis(EKSPEDIS_OPTIONS[0]);
    setProduk(PRODUCT_NAMES[0]);
    setBox("1");
    setDiskonOngkir("0");
    setTotalCustomerBayar("");
    setPromo("0");
    setStatus("On Proses");
    applyPricing(PRODUCT_NAMES[0], "1");
  };

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const num = (v: string) => Number(v.replace(/[^0-9]/g, "")) || 0;
  const isCod = metodePembayaran === "COD";

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
      noWa: noWa.trim(),
      kode,
      platform,
      metodePembayaran,
      ekspedis,
      produk,
      box,
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
            Pilih produk & box — HPP otomatis terisi. Biaya COD, Cash In, dan Gross Provit dihitung otomatis.
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
                  {KODE_OPTIONS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nama Customer</label>
            <Input value={namaCustomer} onChange={(e) => setNamaCustomer(e.target.value)} placeholder="Nama pelanggan" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">No. WhatsApp</label>
            <Input value={noWa} onChange={(e) => setNoWa(e.target.value)} placeholder="08xx-xxxx-xxxx" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Metode Pembayaran</label>
              <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METODE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Ekspedisi</label>
            <Select value={ekspedis} onValueChange={setEkspedis}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EKSPEDIS_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">{boxFieldLabel}</label>
              <Select value={box} onValueChange={handleBoxChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boxOptions.map((t) => (
                    <SelectItem key={t.box} value={String(t.box)}>
                      {t.box} {boxFieldLabel} — {formatCurrency(t.hargaJual, { compact: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">
                Harga Total Produk (Rp) <span className="text-secondary-300">— otomatis</span>
              </label>
              <Input
                inputMode="numeric"
                value={hargaTotalProduk}
                onChange={(e) => setHargaTotalProduk(e.target.value)}
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
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">
                HPP (Rp) <span className="text-secondary-300">— otomatis</span>
              </label>
              <Input inputMode="numeric" value={hpp} onChange={(e) => setHpp(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
            <p className="mb-2 text-xs font-semibold text-primary-700 dark:text-primary-300">
              Kalkulasi Otomatis {isCod && "(Metode Pembayaran: COD)"}
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
