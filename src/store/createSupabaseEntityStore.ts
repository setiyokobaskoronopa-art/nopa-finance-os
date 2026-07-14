import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface SupabaseEntityState<T extends { id: string }> {
  items: T[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<T, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, patch: Partial<T>) => Promise<void>;
}

/**
 * Membuat zustand store yang tersinkron dengan tabel Supabase.
 * `table`      : nama tabel di Postgres (snake_case)
 * `toRow`      : ubah objek JS (camelCase) -> baris DB (snake_case) untuk insert/update
 * `fromRow`    : ubah baris DB (snake_case) -> objek JS (camelCase) dipakai di UI
 */
export function createSupabaseEntityStore<T extends { id: string }>(
  table: string,
  toRow: (item: Partial<T>) => Record<string, unknown>,
  fromRow: (row: Record<string, unknown>) => T
) {
  return create<SupabaseEntityState<T>>()((set, get) => ({
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
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(`[${table}] fetch error:`, error.message);
        set({ loading: false });
        return;
      }
      set({ items: (data ?? []).map(fromRow), loading: false });
    },

    addItem: async (item) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const row = { ...toRow(item as Partial<T>), user_id: userData.user.id };
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) {
        console.error(`[${table}] insert error:`, error.message);
        return;
      }
      set((state) => ({ items: [fromRow(data), ...state.items] }));
    },

    removeItem: async (id) => {
      const prev = get().items;
      set({ items: prev.filter((i) => i.id !== id) }); // optimistic
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        console.error(`[${table}] delete error:`, error.message);
        set({ items: prev }); // rollback
      }
    },

    updateItem: async (id, patch) => {
      const prev = get().items;
      set({ items: prev.map((i) => (i.id === id ? { ...i, ...patch } : i)) }); // optimistic
      const { error } = await supabase.from(table).update(toRow(patch)).eq("id", id);
      if (error) {
        console.error(`[${table}] update error:`, error.message);
        set({ items: prev }); // rollback
      }
    },
  }));
}
