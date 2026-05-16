import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { clearAuth, getCurrentUser } from '../lib/auth';

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <nav className="bg-[#026AA7] h-12 flex items-center px-4 gap-3 shadow-md flex-shrink-0">
      <div className="flex items-center gap-2 text-white font-bold text-lg">
        <LayoutDashboard className="w-5 h-5" />
        <span>TaskBoard</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-white text-sm hidden sm:block">{user.email}</span>
            {user.role === 'lead' && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                Lead
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 px-2 py-1 rounded text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Log out</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
