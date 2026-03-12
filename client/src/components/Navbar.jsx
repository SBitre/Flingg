import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2c0 0-5.5 5.5-5.5 10.5a5.5 5.5 0 0011 0C17.5 7.5 12 2 12 2zm0 14a3.5 3.5 0 01-3.5-3.5c0-2 1.5-4 3.5-6.5 2 2.5 3.5 4.5 3.5 6.5A3.5 3.5 0 0112 16z"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
      {/* Desktop top nav */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 bg-dark-2/90 backdrop-blur-md border-b border-white/5">
        <Link to="/swipe" className="flex items-center gap-2 group">
          <span className="text-primary text-2xl font-display font-bold tracking-wider">Flingg</span>
        </Link>

        <div className="flex items-center gap-6">
          <NavLink to="/swipe" active={isActive('/swipe')} label="Discover" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          } />
          <NavLink to="/matches" active={isActive('/matches')} label="Matches" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          } />
          <NavLink to="/profile-setup" active={isActive('/profile-setup')} label="Profile" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          } />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-4 flex items-center justify-center border border-white/10">
              {user.photos?.[0] ? (
                <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-primary">{user.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <span className="text-sm text-white/70">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-primary text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex items-center justify-around px-4 py-2 bg-dark-2/95 backdrop-blur-md border-t border-white/5 pb-safe">
        <MobileNavLink to="/swipe" active={isActive('/swipe')} label="Discover" icon={
          <svg viewBox="0 0 24 24" fill={isActive('/swipe') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        } />
        <MobileNavLink to="/matches" active={isActive('/matches')} label="Matches" icon={
          <svg viewBox="0 0 24 24" fill={isActive('/matches') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        } />
        <MobileNavLink to="/profile-setup" active={isActive('/profile-setup')} label="Profile" icon={
          <svg viewBox="0 0 24 24" fill={isActive('/profile-setup') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        } />
      </div>
    </nav>
  );
}

function NavLink({ to, active, label, icon }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
        active ? 'bg-primary/10 text-primary' : 'text-white/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, active, label, icon }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200 ${
        active ? 'text-primary' : 'text-white/40'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
