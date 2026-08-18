import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = {
  confirmed: { bg: '#E8F0EA', color: '#4A8060', label: 'Potvrđeno' },
  pending:   { bg: '#EEEDF9', color: '#7A78B8', label: 'U obradi'  },
  completed: { bg: '#F4F5F2', color: '#505A5B', label: 'Završeno'  },
};

export default function Dashboard() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);

  // Učitavanje stvarnih rezervacija iz localStorage-a
  useEffect(() => {
    try {
      const savedReservations = JSON.parse(localStorage.getItem('meetiva_reservations')) || [];
      setReservations(savedReservations);
    } catch (e) {
      console.error('Greška pri učitavanju rezervacija:', e);
      setReservations([]);
    }
  }, []);

  // Funkcija za uklanjanje/otkazivanje rezervacije
  const removeReservation = (id) => {
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    try {
      localStorage.setItem('meetiva_reservations', JSON.stringify(updated));
    } catch (e) {
      console.error('Greška pri spremanju rezervacija:', e);
    }
  };

  // 1. Prikaži učitavanje dok Firebase ne dohvati stanje
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium text-sm">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // 2. Ako provjera završi, a korisnik nije prijavljen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-10" style={{ border: '1px solid #DDE3DE' }}>
            <p className="text-lg font-bold mb-2" style={{ color: '#2B3132' }}>Niste prijavljeni</p>
            <p className="text-sm mb-4" style={{ color: '#8A9192' }}>Prijavite se da biste pristupili nadzornoj ploči.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full font-semibold text-white text-sm"
              style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}
            >
              Prijava
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <div style={{ background: '#505A5B', padding: '32px 24px' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
          <h1 className="text-2xl font-extrabold text-white">Moje rezervacije</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 }}>
            Dobrodošao/la, {currentUser.displayName || currentUser.email}
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-8 w-full">
        {reservations.length === 0 ? (
          /* Prazno stanje kada korisnik nema aktivnih rezervacija */
          <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #DDE3DE' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EEEDF9', color: '#A7A5D0' }}>
              <Calendar size={32} />
            </div>
            <p className="font-bold text-base" style={{ color: '#2B3132' }}>Nemate aktivnih rezervacija</p>
            <p className="text-sm mt-1 mb-5" style={{ color: '#8A9192' }}>
              Prihvatite ponudu u Porukama da biste stvorili rezervaciju.
            </p>
            <button
              onClick={() => navigate('/messages')}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}
            >
              Idi na poruke
            </button>
          </div>
        ) : (
          /* Prikaz stvarnih rezervacija */
          <div className="flex flex-col gap-4">
            {reservations.map(r => {
              const s = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4"
                  style={{ border: '1px solid #DDE3DE' }}
                >
                  <div>
                    <h3 className="font-bold text-base" style={{ color: '#2B3132' }}>{r.provider}</h3>
                    <p className="text-sm mt-0.5" style={{ color: '#505A5B' }}>{r.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#8A9192' }}>
                      📅 {r.date} · {r.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-sm" style={{ color: '#A7A5D0' }}>{r.price}</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                    <button
                      onClick={() => removeReservation(r.id)}
                      title="Ukloni rezervaciju"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
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