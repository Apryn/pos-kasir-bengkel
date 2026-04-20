const BASE = '/api';

export const api = {
  // Products
  getProducts: () => fetch(`${BASE}/products`).then(r => r.json()),
  getLowStock: () => fetch(`${BASE}/products/low-stock`).then(r => r.json()),
  getByBarcode: (code) => fetch(`${BASE}/products/barcode/${code}`).then(r => r.json()),
  addProduct: (data) => fetch(`${BASE}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  updateProduct: (id, data) => fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  updateStock: (id, stock) => fetch(`${BASE}/products/${id}/stock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) }).then(r => r.json()),
  deleteProduct: (id) => fetch(`${BASE}/products/${id}`, { method: 'DELETE' }).then(r => r.json()),

  sendLowStockNotif: () => fetch('/api/notifications/low-stock', { method: 'POST' }).then(r => r.json()),
  getTransactions: (date) => fetch(`${BASE}/transactions${date ? `?date=${date}` : ''}`).then(r => r.json()),
  createTransaction: (data) => fetch(`${BASE}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  getReport: (from, to) => fetch(`${BASE}/transactions/report/summary?from=${from}&to=${to}`).then(r => r.json()),
};
