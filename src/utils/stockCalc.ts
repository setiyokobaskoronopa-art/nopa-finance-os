import type { SalesOrder } from "@/data/pagesDummy";

export function getReturnedUnits(orders: SalesOrder[], produk: string): number {
  return orders
    .filter((o) => o.produk === produk && o.status === "Return")
    .reduce((sum, o) => sum + (Number(o.box) || 0), 0);
}

export function getReusedStockReturnUnits(orders: SalesOrder[], produk: string): number {
  return orders
    .filter((o) => o.produk === produk && o.hppSource === "Stock Return")
    .reduce((sum, o) => sum + (Number(o.box) || 0), 0);
}

export function getAvailableStockReturn(orders: SalesOrder[], produk: string): number {
  return Math.max(0, getReturnedUnits(orders, produk) - getReusedStockReturnUnits(orders, produk));
}
