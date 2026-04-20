import { useState, useEffect } from 'react';
import { api } from '../api';
import { AlertTriangle, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifikasi() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    api.getLowStock().then(data => { setItems(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSendNotif = async () => {
    setSending(true);
    const result = await api.sendLowStockNotif();
    setSending(false);
    if (result.count > 0) toast.success(`Notifikasi Telegram terkirim untuk ${result.count} produk`);
    else toast('Semua stok aman, tidak ada notifikasi dikirim');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" size={22} />
          Notifikasi Stok Rendah
        </h1>
        <div className="flex gap-2">
          <button onClick={handleSendNotif} disabled={sending}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Send size={14} /> {sending ? 'Mengirim...' : 'Kirim ke Telegram'}
          </button>
          <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat...</p>
      ) : items.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-600 font-medium">Semua stok aman ✓</p>
          <p className="text-green-500 text-sm mt-1">Tidak ada produk dengan stok rendah</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(p => {
            const pct = Math.round((p.stock / p.low_stock_threshold) * 100);
            const isOut = p.stock === 0;
            return (
              <div key={p.id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${isOut ? 'border-red-500' : 'border-yellow-400'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOut ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isOut ? 'HABIS' : 'STOK RENDAH'}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Sisa stok</span>
                    <span className={`font-bold ${isOut ? 'text-red-500' : 'text-yellow-600'}`}>
                      {p.stock} / {p.low_stock_threshold} (batas)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isOut ? 'bg-red-500' : 'bg-yellow-400'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
