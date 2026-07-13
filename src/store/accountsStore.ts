import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BankAccount } from "@/types/finance";

interface AccountsState {
  accounts: BankAccount[];
  addAccount: (acc: Omit<BankAccount, "id">) => void;
  deleteAccount: (id: string) => void;
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      accounts: [],
      addAccount: (acc) =>
        set((state) => ({
          accounts: [
            { ...acc, id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
            ...state.accounts,
          ],
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),
    }),
    { name: "nopa-finance-os-accounts" }
  )
);
