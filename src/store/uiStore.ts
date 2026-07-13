import { create } from "zustand";

interface UIState {
  transactionDialogOpen: boolean;
  transactionDialogType: "income" | "expense";
  accountDialogOpen: boolean;
  openTransactionDialog: (type?: "income" | "expense") => void;
  closeTransactionDialog: () => void;
  openAccountDialog: () => void;
  closeAccountDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  transactionDialogOpen: false,
  transactionDialogType: "income",
  accountDialogOpen: false,
  openTransactionDialog: (type = "income") =>
    set({ transactionDialogOpen: true, transactionDialogType: type }),
  closeTransactionDialog: () => set({ transactionDialogOpen: false }),
  openAccountDialog: () => set({ accountDialogOpen: true }),
  closeAccountDialog: () => set({ accountDialogOpen: false }),
}));
