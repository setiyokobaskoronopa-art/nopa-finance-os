import { createSupabaseEntityStore } from "@/store/createSupabaseEntityStore";
import type { BankAccount } from "@/types/finance";

interface Row {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  balance: number;
  color: string;
  logo_initial: string;
}

function toRow(item: Partial<BankAccount>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.bankName !== undefined) row.bank_name = item.bankName;
  if (item.accountNumber !== undefined) row.account_number = item.accountNumber;
  if (item.accountName !== undefined) row.account_name = item.accountName;
  if (item.balance !== undefined) row.balance = item.balance;
  if (item.color !== undefined) row.color = item.color;
  if (item.logoInitial !== undefined) row.logo_initial = item.logoInitial;
  return row;
}

function fromRow(row: Record<string, unknown>): BankAccount {
  const r = row as unknown as Row;
  return {
    id: r.id,
    bankName: r.bank_name,
    accountNumber: r.account_number,
    accountName: r.account_name,
    balance: Number(r.balance),
    color: r.color,
    logoInitial: r.logo_initial,
  };
}

const useAccountsStoreBase = createSupabaseEntityStore<BankAccount>("accounts", toRow, fromRow);

interface AccountsStoreView {
  accounts: BankAccount[];
  addAccount: (item: Omit<BankAccount, "id">) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  fetchAccounts: () => Promise<void>;
}

// Wrapper agar nama action tetap sama seperti sebelumnya (accounts/addAccount/deleteAccount)
// supaya komponen yang sudah ada tidak perlu diubah.
export function useAccountsStore<T>(selector: (s: AccountsStoreView) => T): T {
  return useAccountsStoreBase((s) =>
    selector({
      accounts: s.items,
      addAccount: s.addItem,
      deleteAccount: s.removeItem,
      fetchAccounts: s.fetchItems,
    })
  );
}

export { useAccountsStoreBase };
