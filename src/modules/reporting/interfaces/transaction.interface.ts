// src/reporting/interfaces/transaction.interface.ts
export interface Transaction {
  type: "Invoice" | "Payment";
  date: Date;
  reference: string;
  debit: number;
  credit: number;
  currency: string;
  runningBalance?: number;
}
