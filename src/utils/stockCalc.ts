import type { SalesOrder, OrderLineItem } from "@/data/pagesDummy";

function lineItemsOf(order: SalesOrder): OrderLineItem[] {
  if (order.items && order.items.length > 0) return order.items;
  // fallback for legacy single-product orders
  return [{ produk: order.produk, box: order.box, hpp: order.hpp, hargaJual: order.hargaTotalProduk, hppSource: order.hppSource }];
}

export function getReturnedUnits(orders: SalesOrder[], produk: string): number {
  return orders
    .filter((o) => o.status === "Return")
    .flatMap((o) => lineItemsOf(o))
    .filter((item) => item.produk === produk)
    .reduce((sum, item) => sum + (Number(item.box) || 0), 0);
}

export function getReusedStockReturnUnits(orders: SalesOrder[], produk: string): number {
  return orders
    .flatMap((o) => lineItemsOf(o))
    .filter((item) => item.produk === produk && item.hppSource === "Stock Return")
    .reduce((sum, item) => sum + (Number(item.box) || 0), 0);
}

export function getAvailableStockReturn(orders: SalesOrder[], produk: string): number {
  return Math.max(0, getReturnedUnits(orders, produk) - getReusedStockReturnUnits(orders, produk));
}
