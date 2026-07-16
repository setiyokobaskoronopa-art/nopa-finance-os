import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Goal {
  id: string;
  name: string;
  targetDate: string;
  collected: number;
  target: number;
  autoLinked: boolean;
}

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "autoLinked">) => Promise<void>;
  updateGoal: (id: string, patch: { name?: string; targetDate?: string; target?: number }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addToGoal: (id: string, amount: number) => Promise<void>;
}

function fromRow(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    name: row.name as string,
    targetDate: row.target_date as string,
    collected: Number(row.collected),
    target: Number(row.target),
    autoLinked: Boolean(row.auto_linked),
  };
}

export const useGoalsStore = create<GoalsState>()((set, get) => ({
  goals: [],
  loading: false,

  fetchGoals: async () => {
    set({ loading: true });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ goals: [], loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[goals] fetch error:", error.message);
      set({ loading: false });
      return;
    }
    let goals = (data ?? []).map(fromRow);

    // Buat goal default "Target 100 Juta Pertama" untuk user baru, sekali saja.
    if (goals.length === 0) {
      const { data: created, error: createError } = await supabase
        .from("goals")
        .insert({
          user_id: userData.user.id,
          name: "Target 100 Juta Pertama",
          target_date: "Berkelanjutan",
          collected: 0,
          target: 100000000,
          auto_linked: true,
        })
        .select()
        .single();
      if (!createError && created) {
        goals = [fromRow(created)];
      }
    }

    set({ goals, loading: false });
  },

  addGoal: async (goal) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userData.user.id,
        name: goal.name,
        target_date: goal.targetDate,
        collected: goal.collected,
        target: goal.target,
        auto_linked: false,
      })
      .select()
      .single();
    if (error) {
      console.error("[goals] insert error:", error.message);
      return;
    }
    set((state) => ({ goals: [...state.goals, fromRow(data)] }));
  },

  updateGoal: async (id, patch) => {
    const prev = get().goals;
    set({
      goals: prev.map((g) =>
        g.id === id
          ? {
              ...g,
              ...(patch.name !== undefined ? { name: patch.name } : {}),
              ...(patch.targetDate !== undefined ? { targetDate: patch.targetDate } : {}),
              ...(patch.target !== undefined ? { target: patch.target } : {}),
            }
          : g
      ),
    });
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.targetDate !== undefined) row.target_date = patch.targetDate;
    if (patch.target !== undefined) row.target = patch.target;
    const { error } = await supabase.from("goals").update(row).eq("id", id);
    if (error) {
      console.error("[goals] update error:", error.message);
      set({ goals: prev });
    }
  },

  deleteGoal: async (id) => {
    const prev = get().goals;
    set({ goals: prev.filter((g) => g.id !== id) });
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      console.error("[goals] delete error:", error.message);
      set({ goals: prev });
    }
  },

  addToGoal: async (id, amount) => {
    const prev = get().goals;
    const target = prev.find((g) => g.id === id);
    if (!target) return;
    const newCollected = Math.max(0, target.collected + amount);
    set({ goals: prev.map((g) => (g.id === id ? { ...g, collected: newCollected } : g)) });
    const { error } = await supabase.from("goals").update({ collected: newCollected }).eq("id", id);
    if (error) {
      console.error("[goals] update error:", error.message);
      set({ goals: prev });
    }
  },
}));
