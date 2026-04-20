import { useState, useEffect } from 'react';
import { api } from '../api';
import { BarChart2 } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

export default function Laporan() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [date, setDate] = useState(today);

  useEffect(() => {
    api.getTransactions(date).then(setTransactions);
    const from = date.slice(0, 7) + '-01';
    const to = date;
    api.getReport(from, to).then(setSummary);
  }, [date]);

  const totalHari = transactions.reduce((s, t) => s + t.total, 0);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BarChart2 size={22} /> Laporan Penjualan
      </h1>

      <div className="flex gap-3 mb-4 items-center">
        <label className="text-sm text-gray-600">Tanggal:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600">Transaksi Hari Ini</p>
          <p className="text-2xl font-bold text-blue-700">{transactions.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600">Pendapatan Hari Ini</p>
          <p className="text-2xl font-bold text-green-700">Rp {totalHari.toLocaleString()}</p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
        <div className="px-4 py-3 bg-gray-50 font-semibold text-sm text-gray-600">Daftar Transaksi</div>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">Tidak ada transaksi</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Waktu</th>
                <th className="text-left px-4 py-2">Item</th>
                <th className="text-right px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400">{t.id}</td>
                  <td className="px-4 py-2">{new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2 text-gray-500 truncate max-w-xs">{t.items_summary}</td>
                  <td className="px-4 py-2 text-right font-medium">Rp {t.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly summary */}
      {summary.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 font-semibold text-sm text-gray-600">Ringkasan Bulan Ini</div>
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left px-4 py-2">Tanggal</th>
                <th className="text-right px-4 py-2">Transaksi</th>
                <th className="text-right px-4 py-2">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(s => (
                <tr key={s.date} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.date}</td>
                  <td className="px-4 py-2 text-right">{s.total_transactions}</td>
                  <td className="px-4 py-2 text-right font-medium">Rp {s.total_revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
