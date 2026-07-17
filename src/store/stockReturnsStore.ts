import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface StockReturnItem {
  id: string;
  produk: string;
  box: string;
  hpp: number;
  hargaJual: number;
  idOrder: string;
  resiLama: string;
  resiBaru: string | null;
  status: "Tersedia" | "Terpakai";
  usedByOrderId: string | null;
  sourceOrderId: string | null;
  createdAt: string;
}

export interface NewStockReturnItem {
  produk: string;
  box: string;
  hpp: number;
  hargaJual: number;
  idOrder: string;
  resiLama: string;
}

interface StockReturnsState {
  items: StockReturnItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: NewStockReturnItem) => Promise<void>;
  updateItem: (id: string, patch: Partial<NewStockReturnItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  markAsUsed: (id: string, orderId: string, resiBaru: string | null) => Promise<void>;
  markAsAvailable: (id: string) => Promise<void>;
  autoLogFromOrder: (
    orderId: string,
    items: { produk: string; box: string; hpp: number; hargaJual: number }[],
    resiLama: string | null
  ) => Promise<void>;
}

function fromRow(row: Record<string, unknown>): StockReturnItem {
  return {
    id: row.id as string,
    produk: row.produk as string,
    box: row.box as string,
    hpp: Number(row.hpp) || 0,
    hargaJual: Number(row.harga_jual) || 0,
    idOrder: (row.id_order as string) ?? "",
    resiLama: (row.resi_lama as string) ?? "",
    resiBaru: (row.resi_baru as string) ?? null,
    status: (row.status as "Tersedia" | "Terpakai") ?? "Tersedia",
    usedByOrderId: (row.used_by_order_id as string) ?? null,
    sourceOrderId: (row.source_order_id as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export const useStockReturnsStore = create<StockReturnsState>()((set, get) => ({
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
      .from("stock_returns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[stock_returns] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    set({ items: (data ?? []).map(fromRow), loading: false });
  },

  addItem: async (item) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("stock_returns")
      .insert({
        user_id: userData.user.id,
        produk: item.produk,
        box: item.box,
        hpp: item.hpp,
        harga_jual: item.hargaJual,
        id_order: item.idOrder,
        resi_lama: item.resiLama,
        status: "Tersedia",
      })
      .select()
      .single();
    if (error || !data) {
      console.error("[stock_returns] insert error:", error?.message);
      return;
    }
    set((state) => ({ items: [fromRow(data), ...state.items] }));
  },

  updateItem: async (id, patch) => {
    const prev = get().items;
    set({
      items: prev.map((it) => (it.id === id ? { ...it, ...patch, hargaJual: patch.hargaJual ?? it.hargaJual } : it)),
    });
    const row: Record<string, unknown> = {};
    if (patch.produk !== undefined) row.produk = patch.produk;
    if (patch.box !== undefined) row.box = patch.box;
    if (patch.hpp !== undefined) row.hpp = patch.hpp;
    if (patch.hargaJual !== undefined) row.harga_jual = patch.hargaJual;
    if (patch.idOrder !== undefined) row.id_order = patch.idOrder;
    if (patch.resiLama !== undefined) row.resi_lama = patch.resiLama;
    const { error } = await supabase.from("stock_returns").update(row).eq("id", id);
    if (error) {
      console.error("[stock_returns] update error:", error.message);
      set({ items: prev });
    }
  },

  removeItem: async (id) => {
    const prev = get().items;
    set({ items: prev.filter((it) => it.id !== id) });
    const { error } = await supabase.from("stock_returns").delete().eq("id", id);
    if (error) {
      console.error("[stock_returns] delete error:", error.message);
      set({ items: prev });
    }
  },

  markAsUsed: async (id, orderId, resiBaru) => {
    const prev = get().items;
    set({
      items: prev.map((it) =>
        it.id === id ? { ...it, status: "Terpakai", usedByOrderId: orderId, resiBaru } : it
      ),
    });
    const { error } = await supabase
      .from("stock_returns")
      .update({ status: "Terpakai", used_by_order_id: orderId, resi_baru: resiBaru })
      .eq("id", id);
    if (error) {
      console.error("[stock_returns] markAsUsed error:", error.message);
      set({ items: prev });
    }
  },

  markAsAvailable: async (id) => {
    const prev = get().items;
    set({
      items: prev.map((it) =>
        it.id === id ? { ...it, status: "Tersedia", usedByOrderId: null, resiBaru: null } : it
      ),
    });
    const { error } = await supabase
      .from("stock_returns")
      .update({ status: "Tersedia", used_by_order_id: null, resi_baru: null })
      .eq("id", id);
    if (error) {
      console.error("[stock_returns] markAsAvailable error:", error.message);
      set({ items: prev });
    }
  },

  autoLogFromOrder: async (orderId, items, resiLama) => {
    // Jangan bikin dobel kalau order ini sudah pernah otomatis dicatat sebelumnya
    const alreadyLogged = get().items.some((it) => it.sourceOrderId === orderId);
    if (alreadyLogged || items.length === 0) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const rows = items.map((li) => ({
      user_id: userData.user!.id,
      produk: li.produk,
      box: li.box,
      hpp: li.hpp,
      harga_jual: li.hargaJual,
      id_order: "",
      resi_lama: resiLama ?? "",
      status: "Tersedia",
      source_order_id: orderId,
    }));
    const { data, error } = await supabase.from("stock_returns").insert(rows).select();
    if (error || !data) {
      console.error("[stock_returns] autoLogFromOrder error:", error?.message);
      return;
    }
    set((state) => ({ items: [...data.map(fromRow), ...state.items] }));
  },
}));
