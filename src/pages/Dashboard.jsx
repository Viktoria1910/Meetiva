import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = {
  confirmed: { bg: '#E8F0EA', color: '#4A8060', label: 'Potvrđeno' },
  pending:   { bg: '#EEEDF9', color: '#7A78B8', label: 'U obradi'  },
  completed: { bg: '#F4F5F2', color: '#505A5B', label: 'Završeno'  },
};

export default function Dashboard() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [reservations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('meetiva_reservations')) || []; }
    catch { return []; }
  });

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div style={{ background: '#505A5B', padding: '32px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white">Moje rezervacije</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 }}>
            Dobrodošao/la, {user.name}
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #DDE3DE' }}>
            <p className="text-4xl mb-3">📋</p>
            <p className="font-bold text-base" style={{ color: '#2B3132' }}>Nemate aktivnih rezervacija</p>
            <p className="text-sm mt-1 mb-5" style={{ color: '#8A9192' }}>
              Prihvatite ponudu u Porukama da biste stvorili rezervaciju.
            </p>
            <button onClick={() => navigate('/messages')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}>
              Idi na poruke
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reservations.map(r => {
              const s = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
              return (
                <div key={r.id} className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4"
                  style={{ border: '1px solid #DDE3DE' }}>
                  <div>
                    <h3 className="font-bold text-base" style={{ color: '#2B3132' }}>{r.provider}</h3>
                    <p className="text-sm mt-0.5" style={{ color: '#505A5B' }}>{r.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#8A9192' }}>📅 {r.date} · {r.category}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-sm" style={{ color: '#A7A5D0' }}>{r.price}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
