import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useSalesStore } from "@/store/entityStores";
import { parseGlobemerceCsv, parseManualFile, type ParsedImportResult } from "@/utils/importOrders";
import type { NewSalesOrder } from "@/store/salesStore";

const PLATFORM_OPTIONS = ["Database", "Website", "Meta", "Google", "Tiktok Shop", "Organik"];

type Source = "globemerce" | "manual";

interface ImportOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportOrdersDialog({ open, onOpenChange }: ImportOrdersDialogProps) {
  const existingOrders = useSalesStore((s) => s.items);
  const addManyItems = useSalesStore((s) => s.addManyItems);

  const [source, setSource] = useState<Source>("globemerce");
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[4]); // default Tiktok Shop untuk Globemerce
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ParsedImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFileName("");
    setResult(null);
    setDone(null);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setDone(null);
    if (source === "globemerce") {
      const text = await file.text();
      const existingIds = new Set(
        existingOrders.map((o) => o.externalOrderId).filter((id): id is string => !!id)
      );
      setResult(parseGlobemerceCsv(text, platform, existingIds));
    } else {
      const buffer = await file.arrayBuffer();
      setResult(parseManualFile(buffer, file.name));
    }
  };

  const handleConfirm = async () => {
    if (!result || result.orders.length === 0) return;
    setImporting(true);
    const successCount = await addManyItems(result.orders as NewSalesOrder[]);
    setImporting(false);
    setDone(successCount);
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      reset();
      setSource("globemerce");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Import Order</DialogTitle>
          <DialogDescription>
            Import banyak order sekaligus dari file Globemerce atau spreadsheet manual kamu.
          </DialogDescription>
        </DialogHeader>

        {done !== null ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/10">
              <CheckCircle2 size={22} />
            </span>
            <p className="font-semibold text-secondary-900 dark:text-white">
              {done} order berhasil diimport
            </p>
            <p className="text-xs text-secondary-400">
              Data langsung muncul di Penjualan, Keuangan Bisnis, Customer, dan Stok & Return.
            </p>
            <Button onClick={() => handleClose(false)}>Selesai</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSource("globemerce");
                    reset();
                  }}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    source === "globemerce"
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10"
                      : "border-secondary-200 text-secondary-500 dark:border-secondary-700"
                  }`}
                >
                  Globemerce (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSource("manual");
                    reset();
                  }}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    source === "manual"
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10"
                      : "border-secondary-200 text-secondary-500 dark:border-secondary-700"
                  }`}
                >
                  Format Manual (Excel/CSV)
                </button>
              </div>

              {source === "globemerce" ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-secondary-500">
                      Platform untuk semua order ini
                    </label>
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
                    <p className="mt-1.5 text-[11px] text-secondary-400">
                      Export Globemerce tidak mencantumkan channel asal, jadi pilih manual di sini.
                    </p>
                  </div>
                  <p className="text-[11px] text-secondary-400">
                    Ekspor order dari Globemerce ke CSV, lalu upload file-nya di bawah. Harga & HPP diambil
                    langsung dari data Globemerce; Biaya COD/Pajak COD/Cash In/Gross Provit dihitung ulang
                    otomatis pakai rumus yang sama seperti order manual.
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-secondary-400">
                  Upload file Excel/CSV dengan kolom: CS, Tanggal, Kode, Ekspedis, Produk, Box, Harga Total
                  Produk, Diskon Ongkir, Total Customer Bayar, Biaya COD, Pajak COD, Promo, Cash In, HPP,
                  Gross Provit, Status — sama seperti laporan manual kamu.
                </p>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={source === "globemerce" ? ".csv" : ".csv,.xlsx,.xls"}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-secondary-200 py-8 text-center transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:border-secondary-700 dark:hover:bg-primary-500/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-500 dark:bg-secondary-800">
                    {fileName ? <FileSpreadsheet size={18} /> : <Upload size={18} />}
                  </span>
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">
                    {fileName || "Klik untuk pilih file"}
                  </span>
                </button>
              </div>

              {result && (
                <div className="rounded-2xl border border-secondary-100 bg-secondary-50/60 p-4 text-xs dark:border-secondary-800 dark:bg-secondary-800/40">
                  <div className="flex items-center gap-2 font-semibold text-secondary-800 dark:text-white">
                    <CheckCircle2 size={14} className="text-success-600" />
                    {result.orders.length} order siap diimport
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-secondary-500">
                    <p>Total baris di file: {result.totalRows}</p>
                    {result.skippedDuplicates > 0 && (
                      <p className="flex items-center gap-1.5 text-warning-600">
                        <AlertCircle size={12} /> {result.skippedDuplicates} baris dilewati (sudah pernah diimport)
                      </p>
                    )}
                    {result.skippedInvalid > 0 && (
                      <p className="flex items-center gap-1.5 text-danger-600">
                        <AlertCircle size={12} /> {result.skippedInvalid} baris dilewati (data tidak lengkap)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button onClick={handleConfirm} disabled={!result || result.orders.length === 0 || importing}>
                {importing ? "Mengimport..." : `Import ${result?.orders.length ?? 0} Order`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
