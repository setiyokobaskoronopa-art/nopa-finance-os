import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface EverproCallback {
  id: string;
  callbackType: string;
  awbNumber: string | null;
  clientOrderNo: string | null;
  orderReferenceId: string | null;
  trackingCode: string | null;
  cancelReason: string | null;
  matched: boolean;
  receivedAt: string;
}

interface EverproCallbacksState {
  callbacks: EverproCallback[];
  loading: boolean;
  fetchCallbacks: () => Promise<void>;
}

function fromRow(row: Record<string, unknown>): EverproCallback {
  return {
    id: row.id as string,
    callbackType: row.callback_type as string,
    awbNumber: (row.awb_number as string) ?? null,
    clientOrderNo: (row.client_order_no as string) ?? null,
    orderReferenceId: (row.order_reference_id as string) ?? null,
    trackingCode: (row.tracking_code as string) ?? null,
    cancelReason: (row.cancel_reason as string) ?? null,
    matched: Boolean(row.matched),
    receivedAt: row.received_at as string,
  };
}

export const useEverproCallbacksStore = create<EverproCallbacksState>()((set) => ({
  callbacks: [],
  loading: false,
  fetchCallbacks: async () => {
    set({ loading: true });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ callbacks: [], loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("everpro_callbacks")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("[everpro_callbacks] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    set({ callbacks: (data ?? []).map(fromRow), loading: false });
  },
}));
