import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface CustomerMeta {
  id: string;
  customerKey: string;
  reminderDate: string | null; // dd/mm/yyyy
  reminderNote: string | null;
  reminderDone: boolean;
}

interface CustomersMetaState {
  items: CustomerMeta[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  setReminder: (customerKey: string, reminderDate: string, reminderNote: string) => Promise<void>;
  markReminderDone: (customerKey: string, done: boolean) => Promise<void>;
  clearReminder: (customerKey: string) => Promise<void>;
  getByKey: (customerKey: string) => CustomerMeta | undefined;
}

function fromRow(row: Record<string, unknown>): CustomerMeta {
  return {
    id: row.id as string,
    customerKey: row.customer_key as string,
    reminderDate: (row.reminder_date as string) ?? null,
    reminderNote: (row.reminder_note as string) ?? null,
    reminderDone: Boolean(row.reminder_done),
  };
}

export const useCustomersMetaStore = create<CustomersMetaState>()((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ items: [], loading: false });
      return;
    }
    const { data, error } = await supabase.from("customers").select("*");
    if (error) {
      console.error("[customers] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    set({ items: (data ?? []).map(fromRow), loading: false });
  },

  setReminder: async (customerKey, reminderDate, reminderNote) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const prev = get().items;
    const existing = prev.find((c) => c.customerKey === customerKey);

    const { data, error } = await supabase
      .from("customers")
      .upsert(
        {
          user_id: userData.user.id,
          customer_key: customerKey,
          reminder_date: reminderDate,
          reminder_note: reminderNote,
          reminder_done: false,
        },
        { onConflict: "user_id,customer_key" }
      )
      .select()
      .single();

    if (error || !data) {
      console.error("[customers] setReminder error:", error?.message);
      return;
    }
    const updated = fromRow(data);
    set({
      items: existing ? prev.map((c) => (c.customerKey === customerKey ? updated : c)) : [...prev, updated],
    });
  },

  markReminderDone: async (customerKey, done) => {
    const prev = get().items;
    set({ items: prev.map((c) => (c.customerKey === customerKey ? { ...c, reminderDone: done } : c)) });
    const { error } = await supabase
      .from("customers")
      .update({ reminder_done: done })
      .eq("customer_key", customerKey);
    if (error) {
      console.error("[customers] markReminderDone error:", error.message);
      set({ items: prev });
    }
  },

  clearReminder: async (customerKey) => {
    const prev = get().items;
    set({ items: prev.filter((c) => c.customerKey !== customerKey) });
    const { error } = await supabase.from("customers").delete().eq("customer_key", customerKey);
    if (error) {
      console.error("[customers] clearReminder error:", error.message);
      set({ items: prev });
    }
  },

  getByKey: (customerKey) => get().items.find((c) => c.customerKey === customerKey),
}));
