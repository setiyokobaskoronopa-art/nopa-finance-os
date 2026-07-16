import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { SalesOrder, OrderLineItem } from "@/data/pagesDummy";

export interface NewSalesOrder {
  cs: string;
  tanggal: string;
  namaCustomer: string;
  noWa: string;
  kode: string;
  platform: string;
  metodePembayaran: string;
  ekspedis: string;
  produk: string;
  box: string;
  hppSource: string;
  items: OrderLineItem[];
  hargaTotalProduk: number;
  diskonOngkir: number;
  totalCustomerBayar: number;
  biayaCod: number;
  pajakCod: number;
  promo: number;
  cashIn: number;
  hpp: number;
  grossProvit: number;
  status: string;
  externalOrderId: string | null;
}

interface SalesState {
  items: SalesOrder[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: NewSalesOrder) => Promise<void>;
  addManyItems: (items: NewSalesOrder[]) => Promise<number>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, patch: Partial<SalesOrder>) => Promise<void>;
}

function orderToRow(item: Partial<NewSalesOrder>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.cs !== undefined) row.cs = item.cs;
  if (item.tanggal !== undefined) row.tanggal = item.tanggal;
  if (item.namaCustomer !== undefined) row.nama_customer = item.namaCustomer;
  if (item.noWa !== undefined) row.no_wa = item.noWa;
  if (item.kode !== undefined) row.kode = item.kode;
  if (item.platform !== undefined) row.platform = item.platform;
  if (item.metodePembayaran !== undefined) row.metode_pembayaran = item.metodePembayaran;
  if (item.ekspedis !== undefined) row.ekspedis = item.ekspedis;
  if (item.produk !== undefined) row.produk = item.produk;
  if (item.box !== undefined) row.box = item.box;
  if (item.hppSource !== undefined) row.hpp_source = item.hppSource;
  if (item.hargaTotalProduk !== undefined) row.harga_total_produk = item.hargaTotalProduk;
  if (item.diskonOngkir !== undefined) row.diskon_ongkir = item.diskonOngkir;
  if (item.totalCustomerBayar !== undefined) row.total_customer_bayar = item.totalCustomerBayar;
  if (item.biayaCod !== undefined) row.biaya_cod = item.biayaCod;
  if (item.pajakCod !== undefined) row.pajak_cod = item.pajakCod;
  if (item.promo !== undefined) row.promo = item.promo;
  if (item.cashIn !== undefined) row.cash_in = item.cashIn;
  if (item.hpp !== undefined) row.hpp = item.hpp;
  if (item.grossProvit !== undefined) row.gross_provit = item.grossProvit;
  if (item.status !== undefined) row.status = item.status;
  if (item.externalOrderId !== undefined) row.external_order_id = item.externalOrderId;
  return row;
}

function itemRowToLineItem(row: Record<string, unknown>): OrderLineItem {
  return {
    produk: row.produk as string,
    box: row.box as string,
    hpp: Number(row.hpp),
    hargaJual: Number(row.harga_jual),
    hppSource: row.hpp_source as string,
  };
}

function orderFromRow(row: Record<string, unknown>): SalesOrder {
  const items = Array.isArray(row.order_items) ? (row.order_items as Record<string, unknown>[]).map(itemRowToLineItem) : [];
  return {
    id: row.id as string,
    cs: row.cs as string,
    tanggal: row.tanggal as string,
    namaCustomer: row.nama_customer as string,
    noWa: row.no_wa as string,
    kode: row.kode as string,
    platform: row.platform as string,
    metodePembayaran: row.metode_pembayaran as string,
    ekspedis: row.ekspedis as string,
    produk: row.produk as string,
    box: row.box as string,
    hppSource: row.hpp_source as string,
    items,
    hargaTotalProduk: Number(row.harga_total_produk),
    diskonOngkir: Number(row.diskon_ongkir),
    totalCustomerBayar: Number(row.total_customer_bayar),
    biayaCod: Number(row.biaya_cod),
    pajakCod: Number(row.pajak_cod),
    promo: Number(row.promo),
    cashIn: Number(row.cash_in),
    hpp: Number(row.hpp),
    grossProvit: Number(row.gross_provit),
    status: row.status as string,
    externalOrderId: (row.external_order_id as string) ?? null,
  };
}

export const useSalesStore = create<SalesState>()((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ items: [], loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("sales_orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[sales_orders] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    set({ items: (data ?? []).map(orderFromRow), loading: false });
  },

  addItem: async (item) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const userId = userData.user.id;

    const { data: orderRow, error: orderError } = await supabase
      .from("sales_orders")
      .insert({ ...orderToRow(item), user_id: userId })
      .select()
      .single();
    if (orderError || !orderRow) {
      console.error("[sales_orders] insert error:", orderError?.message);
      return;
    }

    const lineItems = item.items ?? [];
    if (lineItems.length > 0) {
      const rows = lineItems.map((li) => ({
        order_id: orderRow.id,
        user_id: userId,
        produk: li.produk,
        box: li.box,
        hpp: li.hpp,
        harga_jual: li.hargaJual,
        hpp_source: li.hppSource,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(rows);
      if (itemsError) console.error("[order_items] insert error:", itemsError.message);
    }

    set((state) => ({ items: [orderFromRow({ ...orderRow, order_items: lineItems.map((li) => ({
      produk: li.produk,
      box: li.box,
      hpp: li.hpp,
      harga_jual: li.hargaJual,
      hpp_source: li.hppSource,
    })) }), ...state.items] }));
  },

  addManyItems: async (items) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return 0;
    const userId = userData.user.id;
    let successCount = 0;
    const inserted: SalesOrder[] = [];

    for (const item of items) {
      const { data: orderRow, error: orderError } = await supabase
        .from("sales_orders")
        .insert({ ...orderToRow(item), user_id: userId })
        .select()
        .single();
      if (orderError || !orderRow) {
        console.error("[sales_orders] bulk insert error:", orderError?.message);
        continue;
      }
      const lineItems = item.items ?? [];
      if (lineItems.length > 0) {
        const rows = lineItems.map((li) => ({
          order_id: orderRow.id,
          user_id: userId,
          produk: li.produk,
          box: li.box,
          hpp: li.hpp,
          harga_jual: li.hargaJual,
          hpp_source: li.hppSource,
        }));
        const { error: itemsError } = await supabase.from("order_items").insert(rows);
        if (itemsError) console.error("[order_items] bulk insert error:", itemsError.message);
      }
      inserted.push(
        orderFromRow({
          ...orderRow,
          order_items: lineItems.map((li) => ({
            produk: li.produk,
            box: li.box,
            hpp: li.hpp,
            harga_jual: li.hargaJual,
            hpp_source: li.hppSource,
          })),
        })
      );
      successCount += 1;
    }

    if (inserted.length > 0) {
      set((state) => ({ items: [...inserted, ...state.items] }));
    }
    return successCount;
  },

  removeItem: async (id) => {
    const prev = get().items;
    set({ items: prev.filter((i) => i.id !== id) }); // order_items ikut terhapus via FK cascade
    const { error } = await supabase.from("sales_orders").delete().eq("id", id);
    if (error) {
      console.error("[sales_orders] delete error:", error.message);
      set({ items: prev });
    }
  },

  updateItem: async (id, patch) => {
    const prev = get().items;
    set({ items: prev.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
    const { error } = await supabase.from("sales_orders").update(orderToRow(patch)).eq("id", id);
    if (error) {
      console.error("[sales_orders] update error:", error.message);
      set({ items: prev });
    }
  },
}));
