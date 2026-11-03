import axios from 'axios';
import { Customer, Transaction, SummaryTotals, User, SavedRecord } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dreamway_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pure MySQL Database REST API client helpers
export async function fetchCustomersApi(): Promise<Customer[]> {
  try {
    const res = await api.get('/customers');
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    console.error('API fetchCustomers database error:', e);
  }
  return [];
}

export async function createCustomerApi(name: string, customer_number?: number): Promise<Customer> {
  const res = await api.post('/customers', { name, customer_number });
  return res.data;
}

export async function updateCustomerApi(id: number, name?: string, customer_number?: number) {
  const res = await api.put(`/customers/${id}`, { name, customer_number });
  return res.data;
}

export async function deleteCustomerApi(id: number) {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
}

export async function createChitApi(
  customer_id: number,
  chit_number: number | undefined,
  amount: number,
  payment_type?: string,
  type?: 'due' | 'collection',
  line?: string
) {
  const res = await api.post('/chits', { customer_id, chit_number, amount, payment_type, type, line });
  return res.data;
}

export async function clearCollectionChitsApi(line?: string) {
  const res = await api.post('/chits/clear-collection', { line });
  return res.data;
}

export async function clearDueChitsApi(line?: string) {
  const res = await api.post('/chits/clear-dues', { line });
  return res.data;
}

export async function updateChitApi(id: number, due_amount: number, total_amount?: number) {
  const res = await api.put(`/chits/${id}`, { due_amount, total_amount });
  return res.data;
}

export async function deleteChitApi(id: number, created_by?: string) {
  const res = await api.delete(`/chits/${id}`, { data: { created_by } });
  return res.data;
}

export async function deductPaymentApi(chit_id: number, amount: number, payment_type: string, created_by?: string) {
  const res = await api.post('/transactions/deduct', { chit_id, amount, payment_type, created_by });
  return res.data;
}

export async function fetchSavedRecordsApi(): Promise<SavedRecord[]> {
  try {
    const res = await api.get('/saved-records');
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    console.error('API fetchSavedRecords database error:', e);
  }
  return [];
}

export async function createSavedRecordApi(record: Omit<SavedRecord, 'id' | 'created_at'>): Promise<SavedRecord> {
  const res = await api.post('/saved-records', record);
  return res.data;
}

export async function deleteSavedRecordApi(id: string | number) {
  const res = await api.delete(`/saved-records/${id}`);
  return res.data;
}

export async function editRecordChitApi(recordId: string | number, chitId: number, newDueAmount: number) {
  const res = await api.put(`/saved-records/${recordId}/chits`, {
    action: 'edit',
    chitId,
    newDueAmount
  });
  return res.data;
}

export async function deleteRecordChitApi(recordId: string | number, chitId: number) {
  const res = await api.put(`/saved-records/${recordId}/chits`, {
    action: 'delete',
    chitId
  });
  return res.data;
}

export async function fetchTransactionsApi(): Promise<Transaction[]> {
  try {
    const res = await api.get('/transactions/history');
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    console.error('API fetchTransactions error:', e);
  }
  return [];
}

export async function loginApi(username: string, password: string) {
  const res = await api.post('/login', { username, password });
  return res.data;
}

export async function updateProfileApi(userId: number, name: string, password?: string) {
  const res = await api.put('/auth/profile', { userId, name, password });
  return res.data;
}

export async function fetchAdminsApi() {
  try {
    const res = await api.get('/auth/admins');
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    console.error('API fetchAdmins error:', e);
  }
  return [];
}

export async function createAdminApi(username: string, password: string) {
  const res = await api.post('/auth/admins', { username, password });
  return res.data;
}

export async function updateAdminApi(id: number, username: string, password?: string, status?: 'active' | 'deactivated') {
  const res = await api.put(`/auth/admins/${id}`, { username, password, status });
  return res.data;
}

