import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { signOut } from '../services/supabase';

const NAV_LINKS = [
  { to: '/fridge', label: 'Buzdolabı' },
  { to: '/recipes', label: 'Tarifler' },
  { to: '/shopping', label: 'Alışveriş' },
  { to: '/report', label: 'Rapor' },
  { to: '/profile', label: 'Profil' },
];

export default function Layout() {
  const setUser = useAppStore((s) => s.setUser);
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    setUser(null);
    navigate('/login');
  }

  return (
    <div className="min-h-svh flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <NavLink to="/fridge" className="flex items-center gap-2 font-semibold text-lg text-gray-900">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white text-sm flex items-center justify-center">
              🍽
            </span>
            SmartPlate AI
          </NavLink>
          <nav className="flex items-center gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 rounded-lg font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Çıkış
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}