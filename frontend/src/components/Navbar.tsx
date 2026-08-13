import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Mic, BarChart2, History, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/practice', label: 'Practice', icon: Mic },
    { path: '/progress', label: 'Progress', icon: BarChart2 },
    { path: '/history', label: 'History', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link to="/" className="text-xl font-bold text-primary-600 tracking-tight">SHUVRO AI</Link>
        <div className="flex gap-6">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>
        <button onClick={logout} className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 text-xs py-1 px-2 ${location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'}`}
            >
              <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-40">
        <span className="font-bold text-primary-600 text-lg">SHUVRO AI</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-30 pt-20 px-6">
          <div className="space-y-4">
            <Link to="/settings" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-gray-800 py-2 border-b">Settings</Link>
            <button onClick={() => { logout(); setMenuOpen(false); }} className="text-lg font-medium text-red-600 py-2">Logout</button>
          </div>
        </div>
      )}
    </>
  );
}
