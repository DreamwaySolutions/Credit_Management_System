export type Role = 'superadmin' | 'admin';
export type LineType = 'Line 1' | 'Line 2' | 'Line 3';

export interface User {
  id: number;
  username: string;
  name: string;
  role: Role;
}

export interface Chit {
  id: number;
  customer_id: number;
  chit_number: string | number;
  total_amount: number;
  due_amount: number;
  payment_type?: PaymentType;
  type?: 'due' | 'collection';
  line?: string;
  status: 'active' | 'deleted' | 'completed';
  created_at?: string;
}

export interface Customer {
  id: number;
  customer_number: number;
  name: string;
  chits: Chit[];
  created_at?: string;
}

export type PaymentType = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';

export interface Transaction {
  id: number;
  customer_id: number;
  chit_id?: number;
  chit_number: string | number;
  customer_name: string;
  amount: number;
  payment_type: PaymentType | string;
  type: 'payment' | 'deleted_with_due';
  created_by: string;
  created_at: string;
}

export interface SummaryTotals {
  totalDue: number;
  collectedToday: number;
}

export interface SavedRecord {
  id: string | number;
  date: string; // YYYY-MM-DD
  type: 'due' | 'collected';
  line?: string;
  savedAt?: string;
  totalAmount: number;
  customerCount?: number;
  created_at?: string;
  customers: {
    customer_number: number;
    name: string;
    chits: {
      id: number;
      chit_number: string | number;
      due_amount: number;
      payment_type?: string;
      line?: string;
    }[];
  }[];
}


