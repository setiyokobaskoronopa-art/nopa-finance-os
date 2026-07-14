import type { SalesOrder } from "@/data/pagesDummy";
import type { BusinessMutation } from "@/store/businessMutationsStore";

export function getEffectiveGrossProvit(order: SalesOrder): number {
  return order.status === "Return" ? 0 : order.grossProvit;
}

export function computeLabaBersihBisnis(orders: SalesOrder[], mutations: BusinessMutation[]): number {
  const labaKotor = orders.reduce((sum, o) => sum + getEffectiveGrossProvit(o), 0);
  const totalMutasi = mutations.reduce((sum, m) => sum + m.jumlah, 0);
  return labaKotor - totalMutasi;
}
