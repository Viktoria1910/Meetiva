import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-10" style={{ border: '1px solid #DDE3DE' }}>
            <p className="text-lg font-bold mb-2" style={{ color: '#2B3132' }}>Niste prijavljeni</p>
            <button onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full font-semibold text-white text-sm mt-2"
              style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}>Prijava</button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div style={{ background: '#505A5B', padding: '32px 24px' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold text-white"
            style={{ background: '#A7A5D0', flexShrink: 0 }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{user.email}</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 w-full flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
          <h2 className="font-bold text-base mb-4" style={{ color: '#2B3132' }}>Podaci o računu</h2>
          <div className="flex flex-col gap-3">
            {[['Ime i prezime', user.name], ['Email adresa', user.email], ['Tip računa', user.role === 'provider' ? 'Pružatelj usluga' : 'Korisnik']].map(([lbl, val]) => (
              <div key={lbl} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid #F4F5F2' }}>
                <span className="text-sm font-medium" style={{ color: '#505A5B' }}>{lbl}</span>
                <span className="text-sm" style={{ color: '#2B3132' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
            style={{ background: '#EEEDF9', color: '#8886B8', textDecoration: 'none', border: '1px solid #D4D2EC' }}>
            Moje rezervacije
          </Link>
          <Link to="/messages"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
            style={{ background: '#E8F0EA', color: '#4A8060', textDecoration: 'none', border: '1px solid #C8DAD0' }}>
            Poruke
          </Link>
        </div>
        <button onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: 'white', color: '#8A9192', border: '1px solid #DDE3DE', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEE8E8'; e.currentTarget.style.color = '#B03030'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#8A9192'; }}>
          <LogOut size={15} /> Odjavi se
        </button>
      </div>
    </div>
  );
}
