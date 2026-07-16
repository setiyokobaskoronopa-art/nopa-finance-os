import { parseDateSlash } from "@/utils/format";

/** Urutkan array berdasarkan field `tanggal` (format dd/mm/yyyy), terbaru duluan. */
export function sortByTanggalDesc<T extends { tanggal: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const da = parseDateSlash(a.tanggal)?.getTime() ?? 0;
    const db = parseDateSlash(b.tanggal)?.getTime() ?? 0;
    return db - da;
  });
}
