import { initialCustomers } from '../seed.js';

// Unified in-memory fallback store for offline / local mode
export let inMemoryCustomers = initialCustomers.map((name, index) => ({
  id: index + 1,
  customer_number: index + 1,
  name,
  chits: []
}));

export function deleteInMemoryCustomer(id) {
  const numId = Number(id);
  const index = inMemoryCustomers.findIndex(c => c.id === numId);
  if (index !== -1) {
    inMemoryCustomers.splice(index, 1);
    return true;
  }
  return false;
}

export function updateInMemoryCustomer(id, data) {
  const numId = Number(id);
  const cust = inMemoryCustomers.find(c => c.id === numId);
  if (cust) {
    if (data.name !== undefined) cust.name = data.name;
    if (data.customer_number !== undefined) cust.customer_number = Number(data.customer_number);
    return cust;
  }
  return null;
}

export let inMemorySavedRecords = [];
export let inMemoryTransactions = [];

export function setInMemorySavedRecords(records) {
  inMemorySavedRecords = records;
}

export function setInMemoryTransactions(txs) {
  inMemoryTransactions = txs;
}
