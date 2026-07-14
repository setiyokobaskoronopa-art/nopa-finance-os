import { createSupabaseEntityStore } from "@/store/createSupabaseEntityStore";

export interface BusinessMutation {
  id: string;
  tanggal: string;
  kategori: string;
  jumlah: number;
  keterangan: string;
}

function toRow(item: Partial<BusinessMutation>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.tanggal !== undefined) row.tanggal = item.tanggal;
  if (item.kategori !== undefined) row.kategori = item.kategori;
  if (item.jumlah !== undefined) row.jumlah = item.jumlah;
  if (item.keterangan !== undefined) row.keterangan = item.keterangan;
  return row;
}

function fromRow(row: Record<string, unknown>): BusinessMutation {
  return {
    id: row.id as string,
    tanggal: row.tanggal as string,
    kategori: row.kategori as string,
    jumlah: Number(row.jumlah),
    keterangan: row.keterangan as string,
  };
}

export const useBusinessMutationsStore = createSupabaseEntityStore<BusinessMutation>(
  "business_mutations",
  toRow,
  fromRow
);
