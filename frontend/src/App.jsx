import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Kasir from './pages/Kasir';
import Produk from './pages/Produk';
import Laporan from './pages/Laporan';
import Notifikasi from './pages/Notifikasi';
import { api } from './api';

export default function App() {
  const [lowStockCount, setLowStockCount] = useState(0);

  const refreshLowStock = useCallback(() => {
    api.getLowStock().then(data => setLowStockCount(data.length));
  }, []);

  useEffect(() => {
    refreshLowStock();
    const interval = setInterval(refreshLowStock, 30000);
    return () => clearInterval(interval);
  }, [refreshLowStock]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="flex">
        <Navbar lowStockCount={lowStockCount} />
        <main className="flex-1 ml-14 min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Kasir />} />
            <Route path="/produk" element={<Produk onStockChange={refreshLowStock} />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/notifikasi" element={<Notifikasi />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
