import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TransactionItem } from "@/types/finance";

interface TransactionsState {
  transactions: TransactionItem[];
  addTransaction: (tx: Omit<TransactionItem, "id">) => void;
  deleteTransaction: (id: string) => void;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
            ...state.transactions,
          ],
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
    }),
    { name: "nopa-finance-os-transactions" }
  )
);

export function selectTotals(transactions: TransactionItem[]) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, cashFlow: income - expense };
}
