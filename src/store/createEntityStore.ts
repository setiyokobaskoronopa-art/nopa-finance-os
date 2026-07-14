import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EntityStoreState<T extends { id: string }> {
  items: T[];
  addItem: (item: Omit<T, "id">) => void;
  removeItem: (id: string) => void;
}

export function createEntityStore<T extends { id: string }>(storageKey: string) {
  return create<EntityStoreState<T>>()(
    persist(
      (set) => ({
        items: [],
        addItem: (item) =>
          set((state) => ({
            items: [
              { ...item, id: `${storageKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` } as T,
              ...state.items,
            ],
          })),
        removeItem: (id) =>
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          })),
      }),
      { name: `nopa-finance-os-${storageKey}` }
    )
  );
}
