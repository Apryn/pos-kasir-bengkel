const express = require('express');
const router = express.Router();
const db = require('../database');

// Get by barcode
router.get('/barcode/:code', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE barcode = ?').get(req.params.code);
  if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json(product);
});

// Get all products
router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name').all();
  res.json(products);
});

// Get low stock products
router.get('/low-stock', (req, res) => {
  const products = db.prepare(
    'SELECT * FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC'
  ).all();
  res.json(products);
});

// Add product
router.post('/', (req, res) => {
  const { name, price, stock, low_stock_threshold, category, barcode } = req.body;
  const result = db.prepare(
    'INSERT INTO products (name, price, stock, low_stock_threshold, category, barcode) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, price, stock ?? 0, low_stock_threshold ?? 5, category ?? 'Umum', barcode || null);
  res.json({ id: result.lastInsertRowid, message: 'Produk berhasil ditambahkan' });
});

// Update product
router.put('/:id', (req, res) => {
  const { name, price, stock, low_stock_threshold, category, barcode } = req.body;
  db.prepare(
    'UPDATE products SET name=?, price=?, stock=?, low_stock_threshold=?, category=?, barcode=? WHERE id=?'
  ).run(name, price, stock, low_stock_threshold, category, barcode || null, req.params.id);
  res.json({ message: 'Produk berhasil diupdate' });
});

// Update stock only
router.patch('/:id/stock', (req, res) => {
  const { stock } = req.body;
  db.prepare('UPDATE products SET stock=? WHERE id=?').run(stock, req.params.id);
  res.json({ message: 'Stok berhasil diupdate' });
});

// Delete product
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ message: 'Produk berhasil dihapus' });
});

module.exports = router;
