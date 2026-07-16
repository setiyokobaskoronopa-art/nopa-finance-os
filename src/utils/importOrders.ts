import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { NewSalesOrder } from "@/store/salesStore";
import { formatDateSlash } from "@/utils/format";

const COD_FEE_RATE = 0.03;
const COD_TAX_RATE = 0.0033;

export interface ParsedImportResult {
  orders: NewSalesOrder[];
  totalRows: number;
  skippedDuplicates: number;
  skippedInvalid: number;
}

// ---------------------------------------------------------------------------
// GLOBEMERCE CSV IMPORT
// ---------------------------------------------------------------------------

const GLOBEMERCE_STATUS_MAP: Record<string, string> = {
  completed: "Delivered",
  delivered: "Delivered",
  pending: "On Proses",
  processing: "On Proses",
  confirmed: "On Proses",
  cancelled: "Problem",
  canceled: "Problem",
  failed: "Problem",
  rejected: "Problem",
  returned: "Return",
  refunded: "Return",
  return: "Return",
};

function mapGlobemerceStatus(raw: string): string {
  const key = (raw || "").trim().toLowerCase();
  return GLOBEMERCE_STATUS_MAP[key] ?? "On Proses";
}

function mapGlobemerceCourier(raw: string): string {
  const text = (raw || "").toUpperCase();
  if (text.includes("JNT") || text.includes("J&T")) return "J&T";
  if (text.includes("JNE")) return "JNE";
  if (text.includes("LION")) return "LION";
  if (text.includes("SICEPAT")) return "SICEPAT";
  if (text.includes("POS")) return "POS";
  if (text.includes("GOJEK") || text.includes("GOSEND")) return "GOJEK";
  const cleaned = (raw || "").replace(/marketplace/i, "").trim();
  return cleaned || "Lainnya";
}

function parseGlobemerceProducts(raw: string): { name: string; totalQty: number } {
  const parts = (raw || "")
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !/^courier charges/i.test(p));

  const names: string[] = [];
  let totalQty = 0;
  const re = /^(.*?)\s*\((\d+)\)$/;
  for (const part of parts) {
    const m = part.match(re);
    if (m) {
      names.push(m[1].trim());
      totalQty += Number(m[2]) || 0;
    } else {
      names.push(part);
    }
  }
  return { name: names.join(" + ") || "Tanpa Nama Produk", totalQty: totalQty || 1 };
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatGlobemerceDate(raw: string): string {
  // Format masuk: "2026-07-16 12:33" -> keluar: "16/07/2026"
  const datePart = (raw || "").split(" ")[0];
  const [y, m, d] = datePart.split("-");
  if (y && m && d) return `${d}/${m}/${y}`;
  return formatDateSlash(new Date());
}

export function parseGlobemerceCsv(
  fileText: string,
  platform: string,
  existingExternalIds: Set<string>
): ParsedImportResult {
  const parsed = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
  });

  const orders: NewSalesOrder[] = [];
  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  for (const row of parsed.data) {
    const externalOrderId = (row.o_id || "").trim();
    if (!externalOrderId) {
      skippedInvalid += 1;
      continue;
    }
    if (existingExternalIds.has(externalOrderId)) {
      skippedDuplicates += 1;
      continue;
    }

    const hargaTotalProduk = toNumber(row.total_price);
    const hpp = toNumber(row.total_product_cost || row.product_cost);
    if (!hargaTotalProduk) {
      skippedInvalid += 1;
      continue;
    }

    const { name: produk, totalQty } = parseGlobemerceProducts(row.product_quantity || "");
    const ekspedisRaw = row.shipment_courier_name || row.third_party_courier_name || row.courier_name || "";
    const ekspedis = mapGlobemerceCourier(ekspedisRaw);
    const metodePembayaran: string = "Transfer"; // Globemerce (via gateway/marketplace) tidak menandai COD di export ini
    const diskonOngkir = 0;
    const promo = 0;
    const totalCustomerBayar = hargaTotalProduk;
    const isCod = metodePembayaran === "COD";
    const biayaCod = isCod ? Math.round(totalCustomerBayar * COD_FEE_RATE) : 0;
    const pajakCod = isCod ? Math.round(totalCustomerBayar * COD_TAX_RATE) : 0;
    const cashIn = totalCustomerBayar - biayaCod - pajakCod - diskonOngkir - promo;
    const grossProvit = cashIn - hpp;

    orders.push({
      cs: row.username || "Setyo",
      tanggal: formatGlobemerceDate(row.created || row.created_at || ""),
      namaCustomer: row.receiver_name || "Tanpa Nama",
      noWa: row.receiver_mobile ? `0${row.receiver_mobile}`.replace(/^00/, "0") : "",
      kode: "O",
      platform,
      metodePembayaran,
      ekspedis,
      produk,
      box: String(totalQty),
      hppSource: "Baru",
      items: [{ produk, box: String(totalQty), hpp, hargaJual: hargaTotalProduk, hppSource: "Baru" }],
      hargaTotalProduk,
      diskonOngkir,
      totalCustomerBayar,
      biayaCod,
      pajakCod,
      promo,
      cashIn,
      hpp,
      grossProvit,
      status: mapGlobemerceStatus(row.status || ""),
      externalOrderId,
    });
  }

  return { orders, totalRows: parsed.data.length, skippedDuplicates, skippedInvalid };
}

// ---------------------------------------------------------------------------
// MANUAL SPREADSHEET FORMAT IMPORT (Excel/CSV dengan kolom sama seperti form)
// ---------------------------------------------------------------------------

function normalizeHeader(h: unknown): string {
  return String(h ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseManualDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateSlash(value);
  }
  const text = String(value ?? "").trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) return text;
  return "";
}

const MANUAL_HEADER_MAP: Record<string, string> = {
  CS: "cs",
  TANGGAL: "tanggal",
  NAMACUSTOMER: "namaCustomer",
  CUSTOMER: "namaCustomer",
  NAMA: "namaCustomer",
  KODE: "kode",
  EKSPEDIS: "ekspedis",
  EKSPEDISI: "ekspedis",
  PRODUK: "produk",
  BOX: "box",
  HARGATOTALPRODUK: "hargaTotalProduk",
  DISKONONGKIR: "diskonOngkir",
  TOTALCUSTOMERBAYAR: "totalCustomerBayar",
  BIAYACOD3: "biayaCod",
  BIAYACOD: "biayaCod",
  PAJAKCOD003: "pajakCod",
  PAJAKCOD033: "pajakCod",
  PAJAKCOD: "pajakCod",
  PROMO: "promo",
  CASHIN: "cashIn",
  HPP: "hpp",
  GROSSPROVIT: "grossProvit",
  STATUS: "status",
}; 

export function parseManualFile(arrayBuffer: ArrayBuffer, fileName: string): ParsedImportResult {
  const isCsv = fileName.toLowerCase().endsWith(".csv");
  const workbook = isCsv
    ? XLSX.read(new TextDecoder().decode(arrayBuffer), { type: "string" })
    : XLSX.read(arrayBuffer, { type: "array", cellDates: true });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const orders: NewSalesOrder[] = [];
  let skippedInvalid = 0;

  for (const raw of rows) {
    const mapped: Record<string, unknown> = {};
    for (const key of Object.keys(raw)) {
      const norm = normalizeHeader(key);
      const field = MANUAL_HEADER_MAP[norm];
      if (field) mapped[field] = raw[key];
    }

    const namaCustomer = String(mapped.namaCustomer ?? "").trim();
    const tanggal = parseManualDate(mapped.tanggal);
    const hargaTotalProduk = toNumber(mapped.hargaTotalProduk);

    if (!tanggal || !hargaTotalProduk) {
      skippedInvalid += 1;
      continue;
    }

    const kode = String(mapped.kode ?? "O").replace(/[()]/g, "").trim().toUpperCase() || "O";
    const produk = String(mapped.produk ?? "Tanpa Nama Produk").trim();
    const box = String(mapped.box ?? "1").trim();
    const hpp = toNumber(mapped.hpp);
    const diskonOngkir = toNumber(mapped.diskonOngkir);
    const totalCustomerBayar = toNumber(mapped.totalCustomerBayar) || hargaTotalProduk;
    const biayaCod = toNumber(mapped.biayaCod);
    const pajakCod = toNumber(mapped.pajakCod);
    const promo = toNumber(mapped.promo);
    const cashIn = toNumber(mapped.cashIn) || totalCustomerBayar - biayaCod - pajakCod - diskonOngkir - promo;
    const grossProvit = toNumber(mapped.grossProvit) || cashIn - hpp;
    const statusRaw = String(mapped.status ?? "On Proses").trim();
    const status = ["On Proses", "Delivered", "Problem", "Return"].includes(statusRaw) ? statusRaw : "On Proses";

    orders.push({
      cs: String(mapped.cs ?? "Setyo").trim() || "Setyo",
      tanggal,
      namaCustomer: namaCustomer || "Tanpa Nama",
      noWa: "",
      kode: ["O", "F", "R"].includes(kode) ? kode : "O",
      platform: "Database",
      metodePembayaran: biayaCod > 0 ? "COD" : "Transfer",
      ekspedis: String(mapped.ekspedis ?? "").trim(),
      produk,
      box,
      hppSource: "Baru",
      items: [{ produk, box, hpp, hargaJual: hargaTotalProduk, hppSource: "Baru" }],
      hargaTotalProduk,
      diskonOngkir,
      totalCustomerBayar,
      biayaCod,
      pajakCod,
      promo,
      cashIn,
      hpp,
      grossProvit,
      status,
      externalOrderId: null,
    });
  }

  return { orders, totalRows: rows.length, skippedDuplicates: 0, skippedInvalid };
}
