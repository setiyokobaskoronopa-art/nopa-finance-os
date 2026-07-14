import { createEntityStore } from "@/store/createEntityStore";

export interface BusinessMutation {
  id: string;
  tanggal: string;
  kategori: string; // "Ads" | "Biaya Lainnya" | "Prive" | "Return"
  jumlah: number;
  keterangan: string;
}

export const useBusinessMutationsStore = createEntityStore<BusinessMutation>("business-mutations");
