import type { ReactNode } from "react";

export type TrendDirection = "up" | "down" | "flat";

export interface KpiDatum {
  id: string;
  label: string;
  value: string;
  rawValue?: number;
  delta?: string;
  trend?: TrendDirection;
  icon: string;
  accent: "primary" | "success" | "danger" | "warning" | "secondary";
  sparkline?: number[];
  footnote?: string;
}

export interface TransactionItem {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  status: "success" | "pending" | "failed";
  method: string;
  avatarColor: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  accent: "primary" | "success" | "danger" | "warning" | "secondary";
}

export interface BudgetProgressItem {
  id: string;
  category: string;
  spent: number;
  limit: number;
  icon: string;
  color: string;
}

export interface CategoryShare {
  label: string;
  value: number;
  color: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  color: string;
  logoInitial: string;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
}

export interface GenericRow {
  id: string;
  [key: string]: string | number;
}
