const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/products'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve frontend build
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Seed sample data if empty
const db = require('./database');
const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (count.c === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, stock, low_stock_threshold, category) VALUES (?, ?, ?, ?, ?)');
  
  // Oli & Pelumas
  insert.run('Oli Mesin Matic 0.8L', 42000, 25, 5, 'Oli & Pelumas');
  insert.run('Oli Mesin 4T 1L', 45000, 30, 5, 'Oli & Pelumas');
  insert.run('Oli Gardan 1L', 35000, 20, 5, 'Oli & Pelumas');
  insert.run('Oli Rem DOT 3', 25000, 15, 5, 'Oli & Pelumas');
  insert.run('Oli Shock Breaker', 18000, 12, 5, 'Oli & Pelumas');
  insert.run('Grease/Gemuk 500g', 22000, 10, 3, 'Oli & Pelumas');
  
  // Sparepart
  insert.run('Filter Oli', 25000, 20, 5, 'Sparepart');
  insert.run('Busi NGK', 35000, 25, 5, 'Sparepart');
  insert.run('Kampas Rem Depan', 45000, 15, 5, 'Sparepart');
  insert.run('Kampas Rem Belakang', 40000, 12, 5, 'Sparepart');
  insert.run('Rantai Motor 428', 85000, 8, 3, 'Sparepart');
  insert.run('Gear Depan 14T', 35000, 10, 3, 'Sparepart');
  insert.run('Gear Belakang 42T', 55000, 8, 3, 'Sparepart');
  insert.run('Kabel Gas', 25000, 12, 5, 'Sparepart');
  insert.run('Kabel Kopling', 22000, 10, 5, 'Sparepart');
  insert.run('V-Belt', 65000, 15, 5, 'Sparepart');
  insert.run('Roller CVT', 45000, 18, 5, 'Sparepart');
  insert.run('Per Kopling', 35000, 10, 3, 'Sparepart');
  
  // Ban
  insert.run('Ban Dalam 70/90-14', 55000, 12, 3, 'Ban');
  insert.run('Ban Luar 70/90-14', 185000, 8, 3, 'Ban');
  insert.run('Ban Dalam 80/90-14', 60000, 10, 3, 'Ban');
  insert.run('Ban Luar 80/90-14', 195000, 6, 2, 'Ban');
  insert.run('Ban Dalam 90/80-14', 65000, 8, 3, 'Ban');
  insert.run('Ban Luar 90/80-14', 215000, 5, 2, 'Ban');
  insert.run('Pentil Ban Tubeless', 5000, 30, 10, 'Ban');
  
  // Aki
  insert.run('Aki 3Ah GTZ5S', 145000, 6, 2, 'Aki');
  insert.run('Aki 5Ah GTZ6V', 175000, 5, 2, 'Aki');
  insert.run('Aki 7Ah GTZ7V', 195000, 4, 2, 'Aki');
  insert.run('Aki 9Ah GTZ9V', 225000, 3, 2, 'Aki');
  insert.run('Air Aki/Accu Zuur 1L', 15000, 10, 3, 'Aki');
  
  // Aksesoris
  insert.run('Lampu LED H4', 85000, 15, 5, 'Aksesoris');
  insert.run('Lampu LED H6', 75000, 12, 5, 'Aksesoris');
  insert.run('Spion Kanan', 35000, 10, 3, 'Aksesoris');
  insert.run('Spion Kiri', 35000, 10, 3, 'Aksesoris');
  insert.run('Kaca Spion', 15000, 20, 5, 'Aksesoris');
  insert.run('Grip/Handgrip', 25000, 15, 5, 'Aksesoris');
  insert.run('Sarung Jok', 45000, 8, 3, 'Aksesoris');
  insert.run('Cover Motor', 75000, 6, 2, 'Aksesoris');
  insert.run('Helm Half Face', 125000, 5, 2, 'Aksesoris');
  insert.run('Jas Hujan', 55000, 10, 3, 'Aksesoris');
  
  // Lainnya
  insert.run('Kunci L Set', 35000, 8, 3, 'Lainnya');
  insert.run('Obeng Set', 45000, 6, 2, 'Lainnya');
  insert.run('Tang Kombinasi', 55000, 5, 2, 'Lainnya');
  insert.run('Kunci Pas Ring Set', 125000, 3, 2, 'Lainnya');
  insert.run('Pompa Ban Manual', 45000, 4, 2, 'Lainnya');
  
  console.log('Sample data bengkel seeded - 50+ produk');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
