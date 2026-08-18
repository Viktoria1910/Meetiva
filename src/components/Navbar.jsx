import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Slušatelj uživo (real-time) koji broji nove registracije samo ako je korisnik admin
  useEffect(() => {
    if (currentUser && userProfile?.role === 'admin') {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'provider'),
        where('approved', '==', false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingCount(snapshot.docs.length);
      });

      return () => unsubscribe();
    }
  }, [currentUser, userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Greška pri odjavi:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: isActive(path) ? '#2B3132' : '#8A9192',
    fontWeight: isActive(path) ? 600 : 500,
    textDecoration: 'none',
    transition: 'color 0.2s',
  });

  return (
    <nav className="bg-white border-b sticky top-0 z-50 px-6 py-3 flex items-center justify-between" style={{ borderColor: '#DDE3DE' }}>
      
      {/* 1. Logo i glavne kartice */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight" style={{ color: '#2B3132', textDecoration: 'none' }}>
          Meetiva
        </Link>

        {/* Glavne kartice */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/services" style={navLinkStyle('/services')}>
            Kategorije
          </Link>
          <Link to="/messages" style={navLinkStyle('/messages')}>
            Poruke
          </Link>
          <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
            Rezervacije
          </Link>

          {/* Uloga: Pružatelj usluga */}
          {userProfile?.role === 'provider' && (
            <Link to="/provider-setup" style={navLinkStyle('/provider-setup')}>
              Moj obrt
            </Link>
          )}

          {/* Uloga: Admin */}
          {userProfile?.role === 'admin' && (
            <Link 
              to="/admin/pending-providers" 
              style={navLinkStyle('/admin/pending-providers')}
              className="flex items-center gap-2"
            >
              <span>Nove registracije</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* 2. Desni dio - Profil ili Prijava/Registracija */}
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-4">
            {/* Poveznica na stranicu profila */}
            <Link to="/profile" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ background: '#A7A5D0' }}
              >
                {(userProfile?.name || currentUser.displayName || currentUser.email || 'K')[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-medium" style={{ color: '#2B3132' }}>
                {userProfile?.name || currentUser.displayName || 'Moj Profil'}
              </span>
            </Link>


          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-full transition-all"
              style={{ color: '#505A5B', textDecoration: 'none' }}
            >
              Prijava
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all shadow-sm"
              style={{ background: '#A7A5D0', textDecoration: 'none' }}
            >
              Registracija
            </Link>
          </div>
        )}
      </div>

    </nav>
  );
}