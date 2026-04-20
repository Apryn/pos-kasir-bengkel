import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, BarChart2, Bell, Store } from 'lucide-react';

export default function Navbar({ lowStockCount }) {
  const { pathname } = useLocation();
  const links = [
    { to: '/', icon: ShoppingCart, label: 'Kasir' },
    { to: '/produk', icon: Package, label: 'Produk' },
    { to: '/laporan', icon: BarChart2, label: 'Laporan' },
  ];

  return (
    <aside className="w-14 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-2 shadow-sm fixed left-0 top-0 h-full z-10">
      {/* Logo */}
      <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center mb-4" title="Bengkel POS">
        <Store size={18} className="text-white" />
      </div>

      {links.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          title={label}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            pathname === to
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <Icon size={20} />
        </Link>
      ))}

      {/* Notif Bell */}
      <Link
        to="/notifikasi"
        title="Notifikasi"
        className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all ${
          pathname === '/notifikasi'
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
      >
        <Bell size={20} />
        {lowStockCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {lowStockCount}
          </span>
        )}
      </Link>
    </aside>
  );
}
