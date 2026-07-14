import { createSupabaseEntityStore } from "@/store/createSupabaseEntityStore";
import type { TransactionItem } from "@/types/finance";

interface Row {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  method: string;
  avatar_color: string;
}

function toRow(item: Partial<TransactionItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.name !== undefined) row.name = item.name;
  if (item.category !== undefined) row.category = item.category;
  if (item.date !== undefined) row.date = item.date;
  if (item.amount !== undefined) row.amount = item.amount;
  if (item.type !== undefined) row.type = item.type;
  if (item.status !== undefined) row.status = item.status;
  if (item.method !== undefined) row.method = item.method;
  if (item.avatarColor !== undefined) row.avatar_color = item.avatarColor;
  return row;
}

function fromRow(row: Record<string, unknown>): TransactionItem {
  const r = row as unknown as Row;
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    date: r.date,
    amount: Number(r.amount),
    type: r.type as TransactionItem["type"],
    status: r.status as TransactionItem["status"],
    method: r.method,
    avatarColor: r.avatar_color,
  };
}

const useTransactionsStoreBase = createSupabaseEntityStore<TransactionItem>("transactions", toRow, fromRow);

interface TransactionsStoreView {
  transactions: TransactionItem[];
  addTransaction: (item: Omit<TransactionItem, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

// Wrapper agar nama action tetap sama seperti sebelumnya.
export function useTransactionsStore<T>(selector: (s: TransactionsStoreView) => T): T {
  return useTransactionsStoreBase((s) =>
    selector({
      transactions: s.items,
      addTransaction: s.addItem,
      deleteTransaction: s.removeItem,
      fetchTransactions: s.fetchItems,
    })
  );
}

export { useTransactionsStoreBase };

export function selectTotals(transactions: TransactionItem[]) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, cashFlow: income - expense };
}
