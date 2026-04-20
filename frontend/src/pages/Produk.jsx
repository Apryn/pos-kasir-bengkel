import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Pencil, Trash2, X, Check, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';
import BarcodeDisplay from '../components/BarcodeDisplay';

const empty = { name: '', price: '', stock: '', low_stock_threshold: 5, category: 'Oli & Pelumas', barcode: '' };
const KATEGORI = ['Oli & Pelumas', 'Sparepart', 'Ban', 'Aki', 'Aksesoris', 'Lainnya'];

function generateBarcode(id) {
  // Format: POS + id padded to 9 digits
  return 'POS' + String(id).padStart(9, '0');
}

export default function Produk({ onStockChange }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);

  const load = () => api.getProducts().then(data => { setProducts(data); onStockChange?.(); });

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      low_stock_threshold: parseInt(form.low_stock_threshold),
      barcode: form.barcode || null,
    };
    if (editId) {
      await api.updateProduct(editId, data);
      toast.success('Produk diupdate');
    } else {
      const result = await api.addProduct(data);
      // Auto-generate barcode kalau kosong
      if (!data.barcode && result.id) {
        const autoBarcode = generateBarcode(result.id);
        await api.updateProduct(result.id, { ...data, barcode: autoBarcode });
      }
      toast.success('Produk ditambahkan');
    }
    setForm(empty); setEditId(null); setShowForm(false);
    load();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, price: p.price, stock: p.stock, low_stock_threshold: p.low_stock_threshold, category: p.category, barcode: p.barcode || '' });
    setEditId(p.id);
    setShowForm(true);
    setSelectedBarcode(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    await api.deleteProduct(id);
    toast.success('Produk dihapus');
    load();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manajemen Produk</h1>
        <button
          onClick={() => { setForm(empty); setEditId(null); setShowForm(true); setSelectedBarcode(null); }}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h2 className="font-semibold mb-3">{editId ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Nama Produk</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Harga (Rp)</label>
              <input required type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Kategori</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                {KATEGORI.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Stok</label>
              <input required type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Batas Stok Rendah</label>
              <input required type="number" value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Barcode <span className="text-gray-400">(kosongkan untuk auto-generate)</span></label>
              <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                placeholder="Scan atau ketik barcode..."
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                <X size={14} /> Batal
              </button>
              <button type="submit" className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
                <Check size={14} /> Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedBarcode && (
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col items-center">
          <div className="flex justify-between w-full mb-2">
            <h2 className="font-semibold">Barcode - {selectedBarcode.name}</h2>
            <button onClick={() => setSelectedBarcode(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <BarcodeDisplay product={selectedBarcode} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">Kategori</th>
              <th className="text-left px-4 py-3">Barcode</th>
              <th className="text-right px-4 py-3">Harga</th>
              <th className="text-right px-4 py-3">Stok</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.barcode || '-'}</td>
                <td className="px-4 py-3 text-right">Rp {p.price.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-semibold ${p.stock <= p.low_stock_threshold ? 'text-red-500' : 'text-green-600'}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                  {p.barcode && (
                    <button onClick={() => setSelectedBarcode(p)} className="text-gray-400 hover:text-gray-700" title="Lihat Barcode">
                      <Barcode size={15} />
                    </button>
                  )}
                  <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
