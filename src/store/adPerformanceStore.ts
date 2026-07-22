import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { GenericRow } from "@/types/finance";

export interface AdPerformanceItem extends GenericRow {
  id: string;
  platform: string; // "Meta Ads" | "Google Ads"
  namaCampaign: string;
  tanggal: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  sumber: string; // "Manual" | "API"
}

export type NewAdPerformanceItem = Omit<AdPerformanceItem, "id">;

interface AdPerformanceState {
  items: AdPerformanceItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: NewAdPerformanceItem) => Promise<void>;
  updateItem: (id: string, patch: Partial<NewAdPerformanceItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

function toRow(item: Partial<NewAdPerformanceItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.platform !== undefined) row.platform = item.platform;
  if (item.namaCampaign !== undefined) row.nama_campaign = item.namaCampaign;
  if (item.tanggal !== undefined) row.tanggal = item.tanggal;
  if (item.spend !== undefined) row.spend = item.spend;
  if (item.impressions !== undefined) row.impressions = item.impressions;
  if (item.clicks !== undefined) row.clicks = item.clicks;
  if (item.conversions !== undefined) row.conversions = item.conversions;
  if (item.revenue !== undefined) row.revenue = item.revenue;
  if (item.sumber !== undefined) row.sumber = item.sumber;
  return row;
}

function fromRow(row: Record<string, unknown>): AdPerformanceItem {
  return {
    id: row.id as string,
    platform: row.platform as string,
    namaCampaign: row.nama_campaign as string,
    tanggal: row.tanggal as string,
    spend: Number(row.spend) || 0,
    impressions: Number(row.impressions) || 0,
    clicks: Number(row.clicks) || 0,
    conversions: Number(row.conversions) || 0,
    revenue: Number(row.revenue) || 0,
    sumber: row.sumber as string,
  };
}

export const useAdPerformanceStore = create<AdPerformanceState>()((set, get) => ({
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
      .from("ad_performance")
      .select("*")
      .order("tanggal", { ascending: false });
    if (error) {
      console.error("[ad_performance] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    set({ items: (data ?? []).map(fromRow), loading: false });
  },

  addItem: async (item) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("ad_performance")
      .insert({ ...toRow(item), user_id: userData.user.id })
      .select()
      .single();
    if (error || !data) {
      console.error("[ad_performance] insert error:", error?.message);
      return;
    }
    set((state) => ({ items: [fromRow(data), ...state.items] }));
  },

  updateItem: async (id, patch) => {
    const prev = get().items;
    set({ items: prev.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
    const { error } = await supabase.from("ad_performance").update(toRow(patch)).eq("id", id);
    if (error) {
      console.error("[ad_performance] update error:", error.message);
      set({ items: prev });
    }
  },

  removeItem: async (id) => {
    const prev = get().items;
    set({ items: prev.filter((it) => it.id !== id) });
    const { error } = await supabase.from("ad_performance").delete().eq("id", id);
    if (error) {
      console.error("[ad_performance] delete error:", error.message);
      set({ items: prev });
    }
  },
}));
