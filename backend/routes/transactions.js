const express = require('express');
const router = express.Router();
const db = require('../database');
const { notifyLowStock } = require('../telegram');

// Get all transactions
router.get('/', (req, res) => {
  const { date } = req.query;
  let query = `
    SELECT t.*, GROUP_CONCAT(ti.product_name || ' x' || ti.quantity, ', ') as items_summary
    FROM transactions t
    LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  `;
  const params = [];
  if (date) {
    query += ' WHERE DATE(t.created_at) = ?';
    params.push(date);
  }
  query += ' GROUP BY t.id ORDER BY t.created_at DESC';
  const transactions = db.prepare(query).all(...params);
  res.json(transactions);
});

// Get transaction detail
router.get('/:id', (req, res) => {
  const transaction = db.prepare('SELECT * FROM transactions WHERE id=?').get(req.params.id);
  const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id=?').all(req.params.id);
  res.json({ ...transaction, items });
});

// Create transaction
router.post('/', (req, res) => {
  const { items, payment } = req.body;
  // items: [{ product_id, quantity }]

  const createTransaction = db.transaction(() => {
    let total = 0;
    const enrichedItems = items.map(item => {
      const product = db.prepare('SELECT * FROM products WHERE id=?').get(item.product_id);
      if (!product) throw new Error(`Produk ID ${item.product_id} tidak ditemukan`);
      if (product.stock < item.quantity) throw new Error(`Stok ${product.name} tidak cukup`);
      const subtotal = product.price * item.quantity;
      total += subtotal;
      return { ...item, product, subtotal };
    });

    const change = payment - total;
    if (change < 0) throw new Error('Pembayaran kurang');

    const txResult = db.prepare(
      'INSERT INTO transactions (total, payment, change) VALUES (?, ?, ?)'
    ).run(total, payment, change);

    const txId = txResult.lastInsertRowid;

    for (const item of enrichedItems) {
      db.prepare(
        'INSERT INTO transaction_items (transaction_id, product_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(txId, item.product_id, item.product.name, item.product.price, item.quantity, item.subtotal);

      db.prepare('UPDATE products SET stock = stock - ? WHERE id=?').run(item.quantity, item.product_id);
    }

    return { id: txId, total, change };
  });

  try {
    const result = createTransaction();

    // Cek stok rendah setelah transaksi & kirim notif Telegram
    const lowStock = db.prepare(
      'SELECT * FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC'
    ).all();
    if (lowStock.length > 0) notifyLowStock(lowStock);

    res.json({ message: 'Transaksi berhasil', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Summary / laporan
router.get('/report/summary', (req, res) => {
  const { from, to } = req.query;
  let where = '';
  const params = [];
  if (from && to) {
    where = 'WHERE DATE(created_at) BETWEEN ? AND ?';
    params.push(from, to);
  }
  const summary = db.prepare(`
    SELECT 
      COUNT(*) as total_transactions,
      SUM(total) as total_revenue,
      DATE(created_at) as date
    FROM transactions ${where}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `).all(...params);
  res.json(summary);
});

module.exports = router;
