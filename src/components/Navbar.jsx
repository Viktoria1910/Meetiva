import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/services', label: 'Kategorije' },
];

const LOGGED_IN_LINKS = [
  { to: '/services',   label: 'Kategorije' },
  { to: '/messages',   label: 'Poruke' },
  { to: '/dashboard',  label: 'Moje rezervacije' },
  { to: '/profile',    label: 'Moj profil' },
];

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = isLoggedIn ? LOGGED_IN_LINKS : NAV_LINKS;

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav style={{ background: '#FFFFFF', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 0 #DDE3DE' }}>
      <div className="max-w-screen-xl mx-auto px-6 flex items-center gap-2" style={{ height: 60 }}>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-3" style={{ textDecoration: 'none' }}>
          <img src={logo} alt="Meetiva" style={{ height: 36, width: 'auto' }} />
        </Link>

        {/* Nav links — left-aligned next to logo */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex-shrink-0"
              style={{
                color:      isActive(to) ? '#A7A5D0' : '#505A5B',
                background: isActive(to) ? 'rgba(167,165,208,0.15)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg transition-all"
                style={{ color: '#8A9192' }}
                title="Pretraži"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => navigate('/messages')}
                className="p-2 rounded-lg transition-all"
                style={{ color: '#8A9192' }}
                title="Poruke"
              >
                <MessageSquare size={18} />
              </button>
              {/* Avatar */}
              <Link to="/profile" className="flex items-center gap-2 ml-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: '#A7A5D0' }}
                >
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden sm:block" style={{ color: '#2B3132' }}>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg ml-1 transition-all"
                style={{ color: '#BDC5C6' }}
                title="Odjavi se"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200"
                style={{ borderColor: '#A7A5D0', color: '#A7A5D0' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,165,208,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Prijava
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-white transition-all duration-200"
                style={{ background: '#A7A5D0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}
              >
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
