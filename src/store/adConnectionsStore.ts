import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type AdPlatform = "Meta Ads" | "Google Ads" | "TikTok Ads";

export interface AdConnection {
  id: string;
  platform: AdPlatform;
  accountId: string;
  accessToken: string;
  secondaryToken: string | null;
  connectedAt: string;
}

interface AdConnectionsState {
  items: AdConnection[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  saveConnection: (
    platform: AdPlatform,
    accountId: string,
    accessToken: string,
    secondaryToken?: string | null
  ) => Promise<void>;
  disconnect: (platform: AdPlatform) => Promise<void>;
  getByPlatform: (platform: AdPlatform) => AdConnection | undefined;
}

function fromRow(row: Record<string, unknown>): AdConnection {
  return {
    id: row.id as string,
    platform: row.platform as AdPlatform,
    accountId: row.account_id as string,
    accessToken: row.access_token as string,
    secondaryToken: (row.secondary_token as string) ?? null,
    connectedAt: row.connected_at as string,
  };
}

export const useAdConnectionsStore = create<AdConnectionsState>()((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ items: [], loading: false });
      return;
    }
    const { data, error } = await supabase.from("ad_connections").select("*");
    if (error) {
      console.error("[ad_connections] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    set({ items: (data ?? []).map(fromRow), loading: false });
  },

  saveConnection: async (platform, accountId, accessToken, secondaryToken = null) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const prev = get().items;

    const { data, error } = await supabase
      .from("ad_connections")
      .upsert(
        {
          user_id: userData.user.id,
          platform,
          account_id: accountId,
          access_token: accessToken,
          secondary_token: secondaryToken,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform" }
      )
      .select()
      .single();

    if (error || !data) {
      console.error("[ad_connections] saveConnection error:", error?.message);
      return;
    }
    const updated = fromRow(data);
    const exists = prev.some((c) => c.platform === platform);
    set({ items: exists ? prev.map((c) => (c.platform === platform ? updated : c)) : [...prev, updated] });
  },

  disconnect: async (platform) => {
    const prev = get().items;
    set({ items: prev.filter((c) => c.platform !== platform) });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("ad_connections")
      .delete()
      .eq("platform", platform)
      .eq("user_id", userData.user.id);
    if (error) {
      console.error("[ad_connections] disconnect error:", error.message);
      set({ items: prev });
    }
  },

  getByPlatform: (platform) => get().items.find((c) => c.platform === platform),
}));
