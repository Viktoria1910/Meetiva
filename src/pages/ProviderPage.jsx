import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Star, MapPin, ArrowLeft, Sparkles } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { categoryData } from '../utils/categoryData';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

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
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const userIsAuthenticated = Boolean(currentUser || isLoggedIn);

  const data = categoryData[category] || { label: 'Usluge' };

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      setLoading(true);

      // 1. Lokalni podaci
      const localData = categoryData[category];
      const localProvider = localData && localData.providers?.find(p => String(p.id) === String(id));

      if (localProvider) {
        setProvider(localProvider);
        setLoading(false);
        return;
      }

      // 2. Firestore baza
      try {
        const docRef = doc(db, 'providers', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const p = docSnap.data();
          setProvider({
            id: docSnap.id,
            name: p.businessName || p.providerName || p.name || 'Pružatelj usluga',
            location: p.location || p.city || 'Hrvatska',
            price: p.basePrice ? `Od ${p.basePrice} €` : (p.price ? `Od ${p.price} €` : 'Na upit'),
            rating: p.rating || 5.0,
            desc: p.desc || p.description || 'Profesionalne usluge za tvoj događaj.',
          });
        } else {
          setProvider(null);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju pružatelja iz baze:", err);
        setProvider(null);
      } finally {
        setLoading(false);
      }
    };

    loadProvider();
  }, [category, id]);

  // Funkcija za pokretanje/otvaranje chata
  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setStartingChat(true);

    try {
      const chatsRef = collection(db, 'chats');
      
      // Provjera postoji li već chat između ova dva korisnika
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingChatId = null;

      querySnapshot.forEach((docSnap) => {
        const chatData = docSnap.data();
        if (chatData.participants.includes(provider.id)) {
          existingChatId = docSnap.id;
        }
      });

      if (existingChatId) {
        // Chat postoji, idi na njega
        navigate('/messages', { state: { activeChatId: existingChatId } });
      } else {
        // Stvori novi chat u Firestore bazi
        const newChatRef = await addDoc(chatsRef, {
          participants: [currentUser.uid, provider.id],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || currentUser.email || 'Korisnik',
            [provider.id]: provider.name
          },
          lastMessage: '',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        navigate('/messages', { state: { activeChatId: newChatRef.id } });
      }
    } catch (error) {
      console.error("Greška pri pokretanju razgovora:", error);
      // Fallback ako ne uspije Firestore upis
      navigate('/messages', { state: { providerId: provider.id, providerName: provider.name } });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F2' }}>
        <p className="text-sm font-semibold" style={{ color: '#8A9192' }}>Učitavanje podataka...</p>
      </div>
    );
  }

  if (!provider) return (
    <div className="min-h-screen" style={{ background: '#F4F5F2' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#2B3132' }}>Pružatelj nije pronađen</h1>
        <Link to="/services" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A7A5D0' }}>
          ← Natrag na kategorije
        </Link>
      </div>
    </div>
  );

  const handleSend = (e) => { e.preventDefault(); setSent(true); };
  const stars = Math.round(provider.rating || 5);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>

      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-3 w-full">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: '#8A9192', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = '#A7A5D0'}
          onMouseLeave={e => e.currentTarget.style.color = '#8A9192'}>
          <ArrowLeft size={14} /> Natrag na {data.label}
        </button>
      </div>

      {/* Photo gallery */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 w-full mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" style={{ height: 280 }}>
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: GALLERY_GRADIENTS[0], minHeight: 130 }}>
            <Sparkles size={64} style={{ color: '#2B3132', opacity: 0.25 }} />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: GALLERY_GRADIENTS[i], height: 136 }}>
              <Sparkles size={32} style={{ color: '#2B3132', opacity: 0.25 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 w-full pb-12
        grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Left content */}
        <div className="flex flex-col gap-5">

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#2B3132' }}>{provider.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-sm" style={{ color: '#8A9192' }}>
                    <MapPin size={13} /> {provider.location}
                  </span>
                  <span className="text-sm" style={{ color: '#8A9192' }}>{data.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#7DA68D' }}>
                  <Star size={13} fill="white" /> {provider.rating} &nbsp; {ratingLabel(provider.rating)}
                </span>
                <span className="font-bold text-lg" style={{ color: '#A7A5D0' }}>{provider.price}</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-2" style={{ color: '#2B3132' }}>O pružatelju usluga</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#505A5B' }}>{provider.desc}</p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: '#505A5B' }}>
              S višegodišnjim iskustvom i strastvenošću prema radu, pružamo usluge najviše razine.
              Svaki detalj je pažljivo planiran kako bi vaš poseban dan bio nezaboravan.
            </p>
          </div>

          {/* Packages */}
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-3" style={{ color: '#2B3132' }}>Paketi i cijene</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Basic',    price: 'Od 150 €', features: ['3 sata rada', 'Osnovna oprema', 'Digitalna isporuka'] },
                { name: 'Standard', price: 'Od 300 €', features: ['6 sati rada', 'Napredna oprema', '+ Retuš/Montaža'], highlight: true },
                { name: 'Premium',  price: 'Od 600 €', features: ['Cijeli dan', 'Premium oprema', 'Sve uključeno'] },
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
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-3" style={{ color: '#2B3132' }}>Recenzije</h2>
            <div className="pb-3 mb-3" style={{ borderBottom: '1px solid #DDE3DE' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: '#7DA68D' }}>M</div>
                <span className="font-semibold text-sm" style={{ color: '#2B3132' }}>Maja Horvat</span>
                <span className="text-xs" style={{ color: '#8A9192' }}>Listopada 2024</span>
              </div>
              <p className="text-sm" style={{ color: '#505A5B' }}>Savršena usluga! Sve je bilo točno onako kako smo zamislili. Toplo preporučujem.</p>
            </div>
            
            <div className="relative">
              <div style={{ 
                filter: userIsAuthenticated ? 'none' : 'blur(5px)', 
                pointerEvents: userIsAuthenticated ? 'auto' : 'none' 
              }}>
                {[
                  { init: 'T', name: 'Tomislav Petrić', date: 'Rujna 2024',  text: 'Odlično! Brzi odgovor, profesionalan pristup.' },
                  { init: 'A', name: 'Ana Babić',       date: 'Srpnja 2024', text: 'Nevjerojatna kvaliteta. Naša svadba je bila savršena.' },
                ].map(r => (
                  <div key={r.name} className="pb-3 mb-3" style={{ borderBottom: '1px solid #DDE3DE' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: '#A7A5D0' }}>{r.init}</div>
                      <span className="font-semibold text-sm" style={{ color: '#2B3132' }}>{r.name}</span>
                      <span className="text-xs" style={{ color: '#8A9192' }}>{r.date}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#505A5B' }}>{r.text}</p>
                  </div>
                ))}
              </div>

              {!userIsAuthenticated && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white rounded-xl p-4" style={{ border: '1px solid #DDE3DE', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#2B3132' }}>Prijavi se da vidiš sve recenzije</p>
                    <Link to="/login" className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white"
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
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">

          {/* Quick stats & Poruka button */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #DDE3DE' }}>
            <div className="text-center mb-4">
              <div className="text-3xl font-extrabold" style={{ color: '#A7A5D0' }}>{provider.rating}</div>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14}
                    fill={i < stars ? '#7DA68D' : 'none'}
                    stroke={i < stars ? '#7DA68D' : '#DDE3DE'} />
                ))}
              </div>
              <div className="text-xs font-semibold" style={{ color: '#7DA68D' }}>{ratingLabel(provider.rating)}</div>
            </div>
            <div className="text-center py-2 rounded-xl mb-4" style={{ background: '#E8F0EA' }}>
              <div className="text-xl font-extrabold" style={{ color: '#7DA68D' }}>{provider.price}</div>
              <div className="text-xs" style={{ color: '#8A9192' }}>početna cijena</div>
            </div>

            {userIsAuthenticated ? (
              <button 
                onClick={handleStartChat}
                disabled={startingChat}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                style={{ background: '#7DA68D', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#5D8C6D'}
                onMouseLeave={e => e.currentTarget.style.background = '#7DA68D'}>
                <MessageSquare size={15} /> {startingChat ? 'Otvaranje...' : 'Pošalji poruku'}
              </button>
            ) : (
              <Link to="/login"
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: '#A7A5D0', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}>
                Prijavi se za kontakt
              </Link>
            )}
          </div>

          {/* Inquiry form - Neprijavljeni */}
          {!userIsAuthenticated && (
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
                  <input type="text" placeholder="Vaše ime" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                    style={{ border: '1px solid #DDE3DE', color: '#2B3132' }} />
                  <input type="email" placeholder="Email adresa" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                    style={{ border: '1px solid #DDE3DE', color: '#2B3132' }} />
                  <textarea placeholder="Vaša poruka..." required value={message} onChange={e => setMessage(e.target.value)}
                    rows={4} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
                    style={{ border: '1px solid #DDE3DE', color: '#2B3132' }} />
                  <button type="submit"
                    className="w-full py-2 rounded-xl font-semibold text-sm text-white transition-colors"
                    style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}>
                    Pošalji upit
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}