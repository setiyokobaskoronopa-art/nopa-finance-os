import { useMemo, useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { getAvailableStockReturn } from "@/utils/stockCalc";
import type { OrderLineItem } from "@/data/pagesDummy";

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

function makeDefaultLineItem(): OrderLineItem {
  const produk = PRODUCT_NAMES[0];
  const tier = PRODUCT_PRICING[produk][0];
  return { produk, box: String(tier.box), hpp: tier.hpp, hargaJual: tier.hargaJual, hppSource: "Baru" };
}

interface AddSalesOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSalesOrderDialog({ open, onOpenChange }: AddSalesOrderDialogProps) {
  const addItem = useSalesStore((s) => s.addItem);
  const allOrders = useSalesStore((s) => s.items);
  const profile = useAuthStore((s) => s.profile);

  const [cs, setCs] = useState(profile.name || "");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [noWa, setNoWa] = useState("");
  const [kode, setKode] = useState("O");
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0]);
  const [metodePembayaran, setMetodePembayaran] = useState("Transfer");
  const [ekspedis, setEkspedis] = useState(EKSPEDIS_OPTIONS[0]);
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([makeDefaultLineItem()]);
  const [hargaTotalProduk, setHargaTotalProduk] = useState("");
  const [diskonOngkir, setDiskonOngkir] = useState("0");
  const [totalCustomerBayar, setTotalCustomerBayar] = useState("");
  const [promo, setPromo] = useState("0");
  const [status, setStatus] = useState("On Proses");

  const totalHpp = lineItems.reduce((s, i) => s + i.hpp, 0);
  const totalHargaJual = lineItems.reduce((s, i) => s + i.hargaJual, 0);

  const reset = () => {
    setCs(profile.name || "");
    setNamaCustomer("");
    setNoWa("");
    setKode("O");
    setPlatform(PLATFORM_OPTIONS[0]);
    setMetodePembayaran("Transfer");
    setEkspedis(EKSPEDIS_OPTIONS[0]);
    setLineItems([makeDefaultLineItem()]);
    setDiskonOngkir("0");
    setTotalCustomerBayar("");
    setPromo("0");
    setStatus("On Proses");
  };

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setHargaTotalProduk(String(totalHargaJual));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalHargaJual]);

  const num = (v: string) => Number(v.replace(/[^0-9]/g, "")) || 0;
  const isCod = metodePembayaran === "COD";

  const preview = useMemo(() => {
    const totalBayar = num(totalCustomerBayar) || num(hargaTotalProduk);
    const biayaCod = isCod ? Math.round(totalBayar * COD_FEE_RATE) : 0;
    const pajakCod = isCod ? Math.round(totalBayar * COD_TAX_RATE) : 0;
    const cashIn = totalBayar - biayaCod - pajakCod - num(diskonOngkir) - num(promo);
    const grossProvit = cashIn - totalHpp;
    return { totalBayar, biayaCod, pajakCod, cashIn, grossProvit };
  }, [totalCustomerBayar, hargaTotalProduk, diskonOngkir, promo, totalHpp, isCod]);

  const updateLineItem = (idx: number, patch: Partial<OrderLineItem>) => {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const handleProdukChange = (idx: number, produk: string) => {
    const tier = PRODUCT_PRICING[produk][0];
    updateLineItem(idx, { produk, box: String(tier.box), hpp: tier.hpp, hargaJual: tier.hargaJual, hppSource: "Baru" });
  };

  const handleBoxChange = (idx: number, boxValue: string) => {
    const item = lineItems[idx];
    const tier = PRODUCT_PRICING[item.produk]?.find((t) => String(t.box) === boxValue);
    if (tier) {
      updateLineItem(idx, { box: boxValue, hpp: tier.hpp, hargaJual: tier.hargaJual, hppSource: "Baru" });
    }
  };

  const handleToggleStockReturn = (idx: number, checked: boolean) => {
    const item = lineItems[idx];
    if (checked) {
      updateLineItem(idx, { hpp: 0, hppSource: "Stock Return" });
    } else {
      const tier = PRODUCT_PRICING[item.produk]?.find((t) => String(t.box) === item.box);
      updateLineItem(idx, { hpp: tier?.hpp ?? 0, hppSource: "Baru" });
    }
  };

  const addLineItem = () => setLineItems((prev) => [...prev, makeDefaultLineItem()]);
  const removeLineItem = (idx: number) => setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!namaCustomer.trim() || !hargaTotalProduk || lineItems.length === 0) return;

    const produkSummary = lineItems.map((i) => i.produk).join(" + ");
    const boxSummary = lineItems.map((i) => i.box).join("+");
    const hppSourceSummary = lineItems.every((i) => i.hppSource === "Stock Return")
      ? "Stock Return"
      : lineItems.some((i) => i.hppSource === "Stock Return")
      ? "Campuran"
      : "Baru";

    addItem({
      cs: cs.trim() || "Setyo",
      tanggal: formatDateSlash(new Date()),
      namaCustomer: namaCustomer.trim(),
      noWa: noWa.trim(),
      kode,
      platform,
      metodePembayaran,
      ekspedis,
      produk: produkSummary,
      box: boxSummary,
      hppSource: hppSourceSummary,
      items: lineItems,
      hargaTotalProduk: num(hargaTotalProduk),
      diskonOngkir: num(diskonOngkir),
      totalCustomerBayar: preview.totalBayar,
      biayaCod: preview.biayaCod,
      pajakCod: preview.pajakCod,
      promo: num(promo),
      cashIn: preview.cashIn,
      hpp: totalHpp,
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
            Bisa pilih lebih dari satu produk dalam satu order. HPP & harga otomatis terisi per produk.
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

          {/* Multi-product line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-secondary-500">Produk dalam Order</label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus size={13} /> Tambah Produk
              </Button>
            </div>

            {lineItems.map((item, idx) => {
              const boxOptions = PRODUCT_PRICING[item.produk] ?? [];
              const isCoffiy = item.produk.startsWith("COFFIY");
              const boxLabel = isCoffiy ? "Sachet" : "Box";
              const available = getAvailableStockReturn(allOrders, item.produk);
              const boxQty = Number(item.box) || 0;
              const stockReturnUsable = available >= boxQty && boxQty > 0;

              return (
                <div key={idx} className="rounded-2xl border border-secondary-200 p-3 dark:border-secondary-700">
                  <div className="flex items-start gap-2">
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <Select value={item.produk} onValueChange={(v) => handleProdukChange(idx, v)}>
                        <SelectTrigger className="h-9 text-xs">
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
                      <Select value={item.box} onValueChange={(v) => handleBoxChange(idx, v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {boxOptions.map((t) => (
                            <SelectItem key={t.box} value={String(t.box)}>
                              {t.box} {boxLabel} — {formatCurrency(t.hargaJual, { compact: true })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="mt-1 shrink-0 rounded-lg p-1.5 text-secondary-300 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10"
                        aria-label="Hapus produk"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <label
                    className={`mt-2.5 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                      stockReturnUsable
                        ? "cursor-pointer border-secondary-200 hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800"
                        : "cursor-not-allowed border-secondary-100 opacity-50 dark:border-secondary-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.hppSource === "Stock Return"}
                      disabled={!stockReturnUsable}
                      onChange={(e) => handleToggleStockReturn(idx, e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-primary-600"
                    />
                    <span className="text-secondary-600 dark:text-secondary-300">
                      Gunakan Stock Return (tersedia {available}) — HPP: {formatCurrency(item.hpp)}
                    </span>
                  </label>
                </div>
              );
            })}
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
                Total HPP (Rp) <span className="text-secondary-300">— otomatis</span>
              </label>
              <Input value={formatCurrency(totalHpp)} disabled />
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
