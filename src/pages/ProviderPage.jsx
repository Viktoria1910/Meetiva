import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Star, MapPin, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { categoryData } from '../utils/categoryData';
import { useAuth } from '../contexts/AuthContext';

const GALLERY_GRADIENTS = [
  'linear-gradient(135deg,#7DA68D,#BDD2C4)',
  'linear-gradient(135deg,#A7A5D0,#D4D2EC)',
  'linear-gradient(135deg,#505A5B,#7DA68D)',
  'linear-gradient(135deg,#C8DAD0,#E8F0EA)',
  'linear-gradient(135deg,#A7A5D0,#7DA68D)',
];

function ratingLabel(r) {
  if (r >= 4.9) return 'Izvrsno';
  if (r >= 4.7) return 'Odlično';
  if (r >= 4.5) return 'Vrlo dobro';
  return 'Dobro';
}

export default function ProviderPage() {
  const { category, id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const data = categoryData[category];
  const provider = data && data.providers.find(p => String(p.id) === String(id));

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [sent,    setSent]    = useState(false);

  if (!provider) return (
    <div className="min-h-screen" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#2B3132' }}>Pružatelj nije pronađen</h1>
        <Link to="/services" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A7A5D0' }}>
          ← Natrag na kategorije
        </Link>
      </div>
    </div>
  );

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const stars = Math.round(provider.rating);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-3 w-full">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: '#8A9192', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = '#A7A5D0'}
          onMouseLeave={e => e.currentTarget.style.color = '#8A9192'}>
          <ArrowLeft size={14} /> Natrag na {data.label}
        </button>
      </div>

      {/* Photo gallery */}
      <div className="max-w-6xl mx-auto px-6 w-full mb-6">
        <div className="grid grid-cols-4 gap-2" style={{ height: 280 }}>
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: GALLERY_GRADIENTS[0] }}>
            <span style={{ fontSize: '4rem', opacity: 0.3 }}>{data.icon}</span>
          </div>
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: GALLERY_GRADIENTS[i], height: 136 }}>
              <span style={{ fontSize: '1.8rem', opacity: 0.3 }}>{data.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content + sidebar */}
      <div className="max-w-6xl mx-auto px-6 w-full flex gap-6 items-start pb-12">

        {/* Left content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">

          {/* Title row */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold" style={{ color: '#2B3132' }}>{provider.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-sm" style={{ color: '#8A9192' }}>
                    <MapPin size={13} /> {provider.location}
                  </span>
                  <span className="text-sm" style={{ color: '#8A9192' }}>{data.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#7DA68D' }}>
                  <Star size={13} fill="white" /> {provider.rating} &nbsp; {ratingLabel(provider.rating)}
                </span>
                <span className="font-bold text-lg" style={{ color: '#A7A5D0' }}>{provider.price}</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-2" style={{ color: '#2B3132' }}>O pružatelju usluga</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#505A5B' }}>{provider.desc}</p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: '#505A5B' }}>
              S višegodišnjim iskustvom i strastvenošću prema radu, pružamo usluge najviše razine.
              Svaki detalj je pažljivo planiran kako bi vaš poseban dan bio nezaboravan.
            </p>
          </div>

          {/* Pricing packages */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-3" style={{ color: '#2B3132' }}>Paketi i cijene</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Basic', price: 'Od 150 ', features: ['3 sata rada', 'Osnovna oprema', 'Digitalna isporuka'] },
                { name: 'Standard', price: 'Od 300 ', features: ['6 sati rada', 'Napredna oprema', '+ Retuš/Montaža'], highlight: true },
                { name: 'Premium', price: 'Od 600 ', features: ['Cijeli dan', 'Premium oprema', 'Sve uključeno'] },
              ].map(pkg => (
                <div key={pkg.name} className="rounded-xl p-4 flex flex-col gap-2"
                  style={{
                    border: '2px solid ' + (pkg.highlight ? '#A7A5D0' : '#DDE3DE'),
                    background: pkg.highlight ? '#EEEDF9' : 'white',
                  }}>
                  <h3 className="font-bold text-sm" style={{ color: pkg.highlight ? '#8886B8' : '#2B3132' }}>{pkg.name}</h3>
                  <p className="font-extrabold text-base" style={{ color: '#A7A5D0' }}>{pkg.price}</p>
                  <ul className="flex flex-col gap-1 mt-1">
                    {pkg.features.map(f => (
                      <li key={f} className="text-xs flex items-center gap-1.5" style={{ color: '#505A5B' }}>
                        <span style={{ color: '#7DA68D', fontWeight: 700 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-3" style={{ color: '#2B3132' }}>Recenzije gostiju</h2>
            {/* First review always visible */}
            <div className="pb-3 mb-3" style={{ borderBottom: '1px solid #DDE3DE' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#7DA68D' }}>M</div>
                <span className="font-semibold text-sm" style={{ color: '#2B3132' }}>Maja Horvat</span>
                <span className="text-xs" style={{ color: '#8A9192' }}>Listopada 2024</span>
              </div>
              <p className="text-sm" style={{ color: '#505A5B' }}>Savršena usluga! Sve je bilo točno onako kako smo zamislili. Toplo preporučujem.</p>
            </div>
            {/* Remaining blurred unless logged in */}
            <div className="relative">
              <div style={{ filter: isLoggedIn ? 'none' : 'blur(5px)', pointerEvents: isLoggedIn ? 'auto' : 'none' }}>
                {[
                  { init: 'T', name: 'Tomislav Petrić', date: 'Rujna 2024',   text: 'Odlično! Brzi odgovor, profesionalan pristup. Definitivno bih surađivao opet.' },
                  { init: 'A', name: 'Ana Babić',       date: 'Srpnja 2024',  text: 'Nevjerojatna kvaliteta. Naša svadba je bila savršena zahvaljujući ovom timu.' },
                ].map(r => (
                  <div key={r.name} className="pb-3 mb-3" style={{ borderBottom: '1px solid #DDE3DE' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: '#A7A5D0' }}>{r.init}</div>
                      <span className="font-semibold text-sm" style={{ color: '#2B3132' }}>{r.name}</span>
                      <span className="text-xs" style={{ color: '#8A9192' }}>{r.date}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#505A5B' }}>{r.text}</p>
                  </div>
                ))}
              </div>
              {!isLoggedIn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white rounded-xl p-4" style={{ border: '1px solid #DDE3DE', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#2B3132' }}>Prijavi se da vidiš sve recenzije</p>
                    <Link to="/login"
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                      style={{ background: '#A7A5D0', textDecoration: 'none' }}>
                      Prijavi se
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex-shrink-0 flex flex-col gap-4"
          style={{ width: 300, position: 'sticky', top: 76 }}>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <div className="text-center mb-4">
              <div className="text-3xl font-extrabold" style={{ color: '#A7A5D0' }}>{provider.rating}</div>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} fill={i < stars ? '#7DA68D' : 'none'} stroke={i < stars ? '#7DA68D' : '#DDE3DE'} />
                ))}
              </div>
              <div className="text-xs font-semibold" style={{ color: '#7DA68D' }}>{ratingLabel(provider.rating)}</div>
            </div>
            <div className="text-center py-2 rounded-xl mb-3" style={{ background: '#E8F0EA' }}>
              <div className="text-xl font-extrabold" style={{ color: '#7DA68D' }}>{provider.price}</div>
              <div className="text-xs" style={{ color: '#8A9192' }}>početna cijena</div>
            </div>

            {isLoggedIn ? (
              <button onClick={() => navigate('/messages')}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mb-2 transition-colors"
                style={{ background: '#7DA68D' }}
                onMouseEnter={e => e.currentTarget.style.background = '#5D8C6D'}
                onMouseLeave={e => e.currentTarget.style.background = '#7DA68D'}>
                <MessageSquare size={15} /> Pošalji poruku
              </button>
            ) : (
              <Link to="/login"
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mb-2 transition-colors"
                style={{ background: '#A7A5D0', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}>
                Prijavi se za kontakt
              </Link>
            )}
          </div>

          {/* Inquiry form */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: '#2B3132' }}>Pošalji upit</h3>
            {sent ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-semibold" style={{ color: '#7DA68D' }}>Upit je poslan!</p>
                <p className="text-xs mt-1" style={{ color: '#8A9192' }}>Pružatelj će te kontaktirati uskoro.</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex flex-col gap-3">
                {!isLoggedIn && (
                  <>
                    <input type="text" placeholder="Vaše ime" required value={name} onChange={e => setName(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                      style={{ border: '1px solid #DDE3DE', color: '#2B3132' }} />
                    <input type="email" placeholder="Email adresa" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                      style={{ border: '1px solid #DDE3DE', color: '#2B3132' }} />
                  </>
                )}
                <textarea placeholder="Vaša poruka..." required value={message} onChange={e => setMessage(e.target.value)}
                  rows={4} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
                  style={{ border: '1px solid #DDE3DE', color: '#2B3132' }} />
                <button type="submit"
                  className="w-full py-2 rounded-xl font-semibold text-sm text-white transition-colors"
                  style={{ background: '#A7A5D0' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}>
                  Pošalji upit
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
