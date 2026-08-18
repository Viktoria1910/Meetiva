import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const INITIAL_CONVS = [
  {
    id: 'c1',
    provider: 'Studio Lux Fotografi',
    category: 'Fotografi',
    avatar: '📷',
    lastMessage: 'Šaljem vam ponudu za fotografiranje vjenčanja.',
    time: '10:32',
    messages: [
      { id: 1, from: 'provider', text: 'Pozdrav! Hvala na interesu za naše usluge.', time: '10:20' },
      { id: 2, from: 'user',     text: 'Dobar dan! Zanima me fotografiranje vjenčanja za 15. kolovoza.', time: '10:25' },
      { id: 3, from: 'provider', text: 'Odlično! Taj datum nam je slobodan. Koji paket Vas zanima?', time: '10:28' },
      { id: 4, from: 'user',     text: 'Zanima nas Standard paket, 6 sati.', time: '10:30' },
      {
        id: 5,
        from: 'provider',
        text: 'Šaljem vam ponudu za fotografiranje vjenčanja.',
        time: '10:32',
        offer: {
          id: 'offer-1', // Jedinstveni ID ponude
          title: 'Standard paket — Fotografiranje vjenčanja',
          price: '350 €',
          desc: '6 sati rada · Retuš 50 fotografija · Digitalna isporuka',
        },
      },
    ],
  },
  {
    id: 'c2',
    provider: 'Bend Harmony',
    category: 'Bendovi',
    avatar: '🎸',
    lastMessage: 'Možemo li dogovoriti termin za probu?',
    time: 'Jučer',
    messages: [
      { id: 1, from: 'provider', text: 'Pozdrav! Dostupni smo za vaš datum.', time: 'Jučer 14:10' },
      { id: 2, from: 'user',     text: 'Super! Koji su vaši termini za razgovor?', time: 'Jučer 14:45' },
      { id: 3, from: 'provider', text: 'Možemo li dogovoriti termin za probu?', time: 'Jučer 15:00' },
    ],
  },
];

export default function Messages() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const [activeId, setActive] = useState('c1');
  const [input, setInput] = useState('');

  // Dohvaćanje već prihvaćenih ponuda iz localStorage-a
  const [acceptedOfferIds, setAcceptedOfferIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('meetiva_accepted_offers')) || [];
    } catch {
      return [];
    }
  });

  const [reservations, setReservations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('meetiva_reservations')) || [];
    } catch {
      return [];
    }
  });

  // Učitavanje razgovora s ažuriranim statusom prihvaćenih ponuda
  const [convs, setConvs] = useState(() => {
    const savedAccepted = JSON.parse(localStorage.getItem('meetiva_accepted_offers')) || [];
    return INITIAL_CONVS.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => {
        if (msg.offer && savedAccepted.includes(msg.id)) {
          return { ...msg, offerAccepted: true };
        }
        return msg;
      }),
    }));
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
    
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-medium text-sm">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
   
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-10" style={{ border: '1px solid #DDE3DE' }}>
            <p className="text-lg font-bold mb-2" style={{ color: '#2B3132' }}>Niste prijavljeni</p>
            <p className="text-sm mb-4" style={{ color: '#8A9192' }}>Prijavite se da biste pristupili porukama.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full font-semibold text-white text-sm"
              style={{ background: '#A7A5D0' }}
            >
              Prijava
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeConv = convs.find(c => c.id === activeId);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), from: 'user', text: input.trim(), time: now };
    setConvs(prev =>
      prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), time: now }
          : c
      )
    );
    setInput('');
  };

  const acceptOffer = (msg) => {
    // 1. Spriječi višestruko prihvaćanje iste ponude
    if (msg.offerAccepted || acceptedOfferIds.includes(msg.id)) return;

    // 2. Dodaj u rezervacije samo ako već ne postoji jednaka rezervacija
    const exists = reservations.some(
      r => r.provider === activeConv.provider && r.title === msg.offer.title
    );

    let updatedReservations = reservations;
    if (!exists) {
      const res = {
        id: Date.now(),
        provider: activeConv.provider,
        category: activeConv.category,
        title: msg.offer.title,
        price: msg.offer.price,
        status: 'confirmed',
        date: new Date().toLocaleDateString('hr'),
      };
      updatedReservations = [...reservations, res];
      setReservations(updatedReservations);
      try {
        localStorage.setItem('meetiva_reservations', JSON.stringify(updatedReservations));
      } catch {}
    }

    // 3. Spremi ID prihvaćene ponude u localStorage da se zapamti trajno
    const newAcceptedIds = [...acceptedOfferIds, msg.id];
    setAcceptedOfferIds(newAcceptedIds);
    try {
      localStorage.setItem('meetiva_accepted_offers', JSON.stringify(newAcceptedIds));
    } catch {}

    // 4. Ažuriraj lokalni UI state
    setConvs(prev =>
      prev.map(c =>
        c.id === activeId
          ? {
              ...c,
              messages: c.messages.map(m => (m.id === msg.id ? { ...m, offerAccepted: true } : m)),
            }
          : c
      )
    );
  };

  const declineOffer = (msgId) => {
    setConvs(prev =>
      prev.map(c =>
        c.id === activeId
          ? {
              ...c,
              messages: c.messages.map(m => (m.id === msgId ? { ...m, offerDeclined: true } : m)),
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>

      <div
        className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6 w-full flex gap-4"
        style={{ height: 'calc(100vh - 116px)', minHeight: 500 }}
      >
        {/* Lista razgovora */}
        <div
          className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
          style={{ width: 280, background: 'white', border: '1px solid #DDE3DE' }}
        >
          <div className="px-4 py-3 font-bold text-sm" style={{ background: '#505A5B', color: 'white' }}>
            Poruke
          </div>
          <div className="flex-1 overflow-y-auto">
            {convs.map(c => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: c.id === activeId ? '#EEEDF9' : 'white',
                  borderBottom: '1px solid #F4F5F2',
                  borderLeft: '3px solid ' + (c.id === activeId ? '#A7A5D0' : 'transparent'),
                  cursor: 'pointer',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: '#E8F0EA' }}
                >
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-xs truncate" style={{ color: '#2B3132' }}>
                      {c.provider}
                    </p>
                    <span className="text-xs flex-shrink-0" style={{ color: '#8A9192' }}>
                      {c.time}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#8A9192' }}>
                    {c.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prozor za razgovor */}
        {activeConv && (
          <div
            className="flex-1 flex flex-col rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #DDE3DE' }}
          >
            {/* Zaglavlje */}
            <div className="flex items-center gap-3 px-5 py-3" style={{ background: '#505A5B' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ background: '#E8F0EA' }}
              >
                {activeConv.avatar}
              </div>
              <div>
                <p className="font-bold text-sm text-white">{activeConv.provider}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {activeConv.category}
                </p>
              </div>
            </div>

            {/* Poruke */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {activeConv.messages.map(msg => (
                <div key={msg.id}>
                  {msg.offer ? (
                    /* Kartica ponude */
                    <div className="flex justify-start">
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          maxWidth: 300,
                          border:
                            '2px solid ' +
                            (msg.offerAccepted ? '#7DA68D' : msg.offerDeclined ? '#DDE3DE' : '#A7A5D0'),
                          background: 'white',
                        }}
                      >
                        <div
                          className="px-4 py-2 text-xs font-bold"
                          style={{
                            background: msg.offerAccepted
                              ? '#7DA68D'
                              : msg.offerDeclined
                              ? '#8A9192'
                              : '#A7A5D0',
                            color: 'white',
                          }}
                        >
                          {msg.offerAccepted
                            ? '✅ Ponuda prihvaćena'
                            : msg.offerDeclined
                            ? '❌ Ponuda odbijena'
                            : '💼 Posebna ponuda'}
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-sm mb-0.5" style={{ color: '#2B3132' }}>
                            {msg.offer.title}
                          </p>
                          <p className="text-xs mb-1" style={{ color: '#505A5B' }}>
                            {msg.offer.desc}
                          </p>
                          <p className="text-base font-extrabold mb-2" style={{ color: '#A7A5D0' }}>
                            {msg.offer.price}
                          </p>
                          {!msg.offerAccepted && !msg.offerDeclined && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptOffer(msg)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white"
                                style={{ background: '#7DA68D', border: 'none', cursor: 'pointer' }}
                              >
                                Prihvati
                              </button>
                              <button
                                onClick={() => declineOffer(msg.id)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                                style={{
                                  background: '#F4F5F2',
                                  color: '#505A5B',
                                  border: '1px solid #DDE3DE',
                                  cursor: 'pointer',
                                }}
                              >
                                Odbij
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Obična poruka */
                    <div className={'flex ' + (msg.from === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className="max-w-xs">
                        <div
                          className="px-4 py-2 rounded-2xl text-sm"
                          style={{
                            background: msg.from === 'user' ? '#A7A5D0' : '#F4F5F2',
                            color: msg.from === 'user' ? 'white' : '#2B3132',
                            borderBottomRightRadius: msg.from === 'user' ? 4 : 16,
                            borderBottomLeftRadius: msg.from === 'user' ? 16 : 4,
                          }}
                        >
                          {msg.text}
                        </div>
                        <p
                          className={
                            'text-xs mt-0.5 ' + (msg.from === 'user' ? 'text-right' : 'text-left')
                          }
                          style={{ color: '#8A9192' }}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Polje za unos */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: '1px solid #DDE3DE' }}
            >
              <input
                type="text"
                placeholder="Napiši poruku..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 text-sm rounded-full px-4 py-2 outline-none"
                style={{ background: '#F4F5F2', border: '1px solid #DDE3DE', color: '#2B3132' }}
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#8886B8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#A7A5D0')}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}