import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Goal {
  id: string;
  name: string;
  targetDate: string;
  collected: number;
  target: number;
}

interface GoalsState {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id">) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
}

const defaultGoals: Goal[] = [
  {
    id: "goal-100jt",
    name: "Target 100 Juta Pertama",
    targetDate: "Berkelanjutan",
    collected: 0,
    target: 100000000,
  },
];

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: defaultGoals,
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            { ...goal, id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
            ...state.goals,
          ],
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
      addToGoal: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, collected: Math.max(0, g.collected + amount) } : g
          ),
        })),
    }),
    { name: "nopa-finance-os-goals" }
  )
);
