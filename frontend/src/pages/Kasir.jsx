import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Plus, Minus, Trash2, CheckCircle, Search, ScanLine, ShoppingBag, Banknote, CreditCard, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Semua', 'Oli & Pelumas', 'Sparepart', 'Ban', 'Aki', 'Aksesoris', 'Lainnya'];
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tunai', icon: Banknote },
  { id: 'debit', label: 'Debit', icon: CreditCard },
  { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
];

export default function Kasir() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [receipt, setReceipt] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef();

  useEffect(() => {
    api.getProducts().then(setProducts);
    barcodeRef.current?.focus();
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Semua' || p.category === category;
    return matchSearch && matchCat && p.stock > 0;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) { toast.error(`Stok ${product.name} hanya ${product.stock}`); return prev; }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const product = await api.getByBarcode(barcodeInput.trim());
    if (product.error) toast.error('Produk tidak ditemukan');
    else { addToCart(product); toast.success(`${product.name} ditambahkan`); }
    setBarcodeInput('');
    barcodeRef.current?.focus();
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const change = (parseFloat(payment) || 0) - subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Keranjang kosong');
    if (paymentMethod === 'cash' && (!payment || parseFloat(payment) < subtotal)) return toast.error('Pembayaran kurang');
    const result = await api.createTransaction({
      items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      payment: paymentMethod === 'cash' ? parseFloat(payment) : subtotal,
    });
    if (result.error) return toast.error(result.error);
    toast.success('Transaksi berhasil!');
    setReceipt({ ...result, items: cart, payment: paymentMethod === 'cash' ? parseFloat(payment) : subtotal, method: paymentMethod });
    setCart([]); setPayment('');
    api.getProducts().then(setProducts);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (receipt) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-green-500" size={36} />
            </div>
            <h2 className="text-xl font-bold">Transaksi Berhasil!</h2>
            <p className="text-gray-400 text-sm mt-1">#{receipt.id} · {dateStr}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
            {receipt.items.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{i.name} <span className="text-gray-400">x{i.qty}</span></span>
                <span className="font-medium">Rp {(i.price * i.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t pt-3">
            <div className="flex justify-between font-bold text-base">
              <span>Total</span><span className="text-green-600">Rp {receipt.total.toLocaleString()}</span>
            </div>
            {receipt.method === 'cash' && <>
              <div className="flex justify-between text-gray-500"><span>Bayar</span><span>Rp {receipt.payment.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600 font-semibold"><span>Kembalian</span><span>Rp {receipt.change.toLocaleString()}</span></div>
            </>}
          </div>
          <button onClick={() => setReceipt(null)} className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold">
            Transaksi Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-gray-400">{dateStr}</p>
            <h1 className="text-2xl font-bold text-gray-800">Bengkel Kasir</h1>
          </div>
          <div className="flex gap-2 flex-1 max-w-lg mx-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              />
            </div>
            <form onSubmit={handleBarcodeScan} className="relative">
              <ScanLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={barcodeRef}
                type="text"
                placeholder="Scan barcode..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-44 bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              />
            </form>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-green-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
                <div className="w-full h-28 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center mb-3 text-4xl">
                  {p.category === 'Oli & Pelumas' ? '🛢️' : 
                   p.category === 'Sparepart' ? '⚙️' : 
                   p.category === 'Ban' ? '🛞' : 
                   p.category === 'Aki' ? '🔋' : 
                   p.category === 'Aksesoris' ? '🔧' : '📦'}
                </div>
                <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{p.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold">Rp {p.price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium"
                  >
                    + Tambah
                  </button>
                </div>
                <p className={`text-xs mt-1 ${p.stock <= p.low_stock_threshold ? 'text-red-400' : 'text-gray-300'}`}>
                  Stok: {p.stock}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-300">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                <p>Tidak ada produk</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Panel */}
      <div className="w-80 bg-white border-l border-gray-100 flex flex-col shadow-lg">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg text-gray-800">Transaksi</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && (
            <div className="text-center py-12 text-gray-300">
              <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Keranjang kosong</p>
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                {item.category === 'Oli & Pelumas' ? '🛢️' : item.category === 'Sparepart' ? '⚙️' : item.category === 'Ban' ? '🛞' : item.category === 'Aki' ? '🔋' : '🔧'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-green-600 text-sm font-semibold">Rp {(item.price * item.qty).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500">
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-200 hover:text-green-500">
                  <Plus size={12} />
                </button>
                <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))} className="ml-1 text-gray-200 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 border-t space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>Rp {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-base text-gray-800">
            <span>Total</span><span className="text-green-600">Rp {subtotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">METODE PEMBAYARAN</p>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                  paymentMethod === m.id
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cash Input */}
        {paymentMethod === 'cash' && (
          <div className="px-4 pb-3">
            <input
              type="number"
              placeholder="Jumlah bayar..."
              value={payment}
              onChange={e => setPayment(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {payment && (
              <p className={`text-xs mt-1.5 text-right font-medium ${change >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                Kembalian: Rp {change.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Checkout Button */}
        <div className="p-4 pt-0">
          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 font-semibold text-sm transition-all shadow-sm"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
