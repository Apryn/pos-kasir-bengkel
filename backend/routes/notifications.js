const express = require('express');
const router = express.Router();
const db = require('../database');
const { notifyLowStock } = require('../telegram');

// Kirim notif stok rendah manual
router.post('/low-stock', async (req, res) => {
  const lowStock = db.prepare(
    'SELECT * FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC'
  ).all();

  if (lowStock.length === 0) {
    return res.json({ message: 'Semua stok aman, tidak ada notifikasi dikirim' });
  }

  await notifyLowStock(lowStock);
  res.json({ message: `Notifikasi dikirim untuk ${lowStock.length} produk`, count: lowStock.length });
});

module.exports = router;
