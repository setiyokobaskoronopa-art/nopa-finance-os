import { useMemo, useState } from "react";
import { FinancePageTemplate } from "@/components/shared/FinancePageTemplate";
import { AddAccountDialog } from "@/components/dashboard/AddAccountDialog";
import { formatCurrency } from "@/utils/format";
import { useAccountsStore } from "@/store/accountsStore";
import { useTransactionsStore, selectTotals } from "@/store/transactionsStore";
import type { BankAccount, KpiDatum, TableColumn } from "@/types/finance";

interface AccountRow extends BankAccount {
  [key: string]: string | number;
}

const columns: TableColumn<AccountRow>[] = [
  { key: "bankName", header: "Bank" },
  { key: "accountNumber", header: "No. Rekening" },
  { key: "accountName", header: "Atas Nama" },
  { key: "balance", header: "Saldo", align: "right", render: (r) => formatCurrency(r.balance) },
];

export default function Accounts() {
  const accounts = useAccountsStore((s) => s.accounts);
  const deleteAccount = useAccountsStore((s) => s.deleteAccount);
  const transactions = useTransactionsStore((s) => s.transactions);
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const kpis = useMemo<KpiDatum[]>(() => {
    const totalSaldo = accounts.reduce((s, a) => s + a.balance, 0);
    const { income, expense } = selectTotals(transactions);
    return [
      { id: "ac1", label: "Total Saldo Semua Rekening", value: formatCurrency(totalSaldo), icon: "Landmark", accent: "primary" },
      { id: "ac2", label: "Rekening Aktif", value: String(accounts.length), icon: "Wallet", accent: "secondary" },
      { id: "ac3", label: "Total Arus Masuk", value: formatCurrency(income), icon: "ArrowDownToLine", accent: "success" },
      { id: "ac4", label: "Total Arus Keluar", value: formatCurrency(expense), icon: "ArrowUpFromLine", accent: "danger" },
    ];
  }, [accounts, transactions]);

  return (
    <>
      <FinancePageTemplate
        title="Rekening"
        description="Kelola semua rekening bank pribadi dan bisnis Anda."
        kpis={kpis}
        tableTitle="Daftar Rekening"
        columns={columns}
        rows={accounts as AccountRow[]}
        addLabel="Tambah Rekening"
        onAdd={() => {
          setEditingAccount(null);
          setOpen(true);
        }}
        onEdit={(row) => {
          setEditingAccount(row);
          setOpen(true);
        }}
        onDelete={(row) => deleteAccount(row.id)}
        emptyTitle="Belum ada rekening"
        emptyDescription="Tambahkan rekening bank untuk mulai memantau saldo."
      />
      <AddAccountDialog open={open} onOpenChange={setOpen} editingAccount={editingAccount} />
    </>
  );
}
