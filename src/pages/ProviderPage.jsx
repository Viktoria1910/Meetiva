import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Star, MapPin, ArrowLeft, Sparkles } from 'lucide-react';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
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
  if (r >= 4.0) return 'Dobro';
  return 'Novo / Bez ocjena';
}

export default function ProviderPage() {
  const { category, id } = useParams();
  const { currentUser, userProfile, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const userIsAuthenticated = Boolean(currentUser || isLoggedIn);

  const data = categoryData[category] || { label: 'Usluge' };

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  // Stanja za recenzije
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Stanja za neprijavljenu upit-formu
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // 1. Učitavanje pružatelja i njegovih paketa
  useEffect(() => {
    const loadProvider = async () => {
      setLoading(true);

      try {
        let providerDoc = await getDoc(doc(db, 'providers', id));
        let isUserDoc = false;

        if (!providerDoc.exists()) {
          providerDoc = await getDoc(doc(db, 'users', id));
          isUserDoc = true;
        }

        if (providerDoc.exists()) {
          const p = providerDoc.data();

          const loadedImages = (p.images && p.images.length > 0) 
            ? p.images 
            : ((p.gallery && p.gallery.length > 0) ? p.gallery : []);

          let loadedPackages = p.packages || p.services || p.pricing || [];

          // Provjera potkolekcije 'packages' ako nema paketa u glavnom dokumentu
          if (!Array.isArray(loadedPackages) || loadedPackages.length === 0) {
            const baseRef = isUserDoc ? doc(db, 'users', id) : doc(db, 'providers', id);
            try {
              const subSnap = await getDocs(collection(baseRef, 'packages'));
              if (!subSnap.empty) {
                loadedPackages = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
              }
            } catch (err) {
              // Zanemari ako ne postoji potkolekcija
            }
          }

          setProvider({
            id: providerDoc.id,
            isUserDoc,
            name: p.businessName || p.providerName || p.name || 'Pružatelj usluga',
            location: p.location || p.city || 'Hrvatska',
            price: p.basePrice
              ? `Od ${p.basePrice} €`
              : (p.price ? (typeof p.price === 'number' ? `Od ${p.price} €` : p.price) : 'Na upit'),
            rating: p.rating || p.averageRating || 5.0,
            desc: p.desc || p.description || 'Profesionalne usluge za tvoj događaj.',
            images: loadedImages,
            packages: Array.isArray(loadedPackages) ? loadedPackages : []
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju pružatelja iz baze:", err);
      }

      // Fallback na lokalne podatke
      const localData = categoryData[category];
      const localProvider = localData && localData.providers?.find(p => String(p.id) === String(id));

      if (localProvider) {
        setProvider({
          ...localProvider,
          id: String(localProvider.id),
          packages: localProvider.packages || []
        });
      } else {
        setProvider(null);
      }

      setLoading(false);
    };

    loadProvider();
  }, [category, id]);

  // 2. Slušanje recenzija
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, 'reviews'),
      where('providerId', '==', String(id))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedReviews = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setReviews(fetchedReviews);

      if (fetchedReviews.length > 0) {
        const avg = fetchedReviews.reduce((acc, r) => acc + r.rating, 0) / fetchedReviews.length;
        const formattedAvg = Number(avg.toFixed(1));
        
        setProvider(prev => prev ? { ...prev, rating: formattedAvg } : null);

        const collectionName = provider?.isUserDoc ? 'users' : 'providers';
        updateDoc(doc(db, collectionName, String(id)), {
          rating: formattedAvg,
          averageRating: formattedAvg,
          reviewCount: fetchedReviews.length
        }).catch(() => {});
      }
    }, (error) => {
      console.error("Greška pri učitavanju recenzija:", error);
    });

    return () => unsubscribe();
  }, [id, provider?.isUserDoc]);

  // 3. Pokretanje ili otvaranje razgovora
  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setStartingChat(true);

    try {
      const currentUidStr = String(currentUser.uid);
      const targetProviderIdStr = String(provider.id);

      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUidStr));
      const querySnapshot = await getDocs(q);
      let existingChatId = null;

      querySnapshot.forEach((docSnap) => {
        const chatData = docSnap.data();
        const parts = (chatData.participants || []).map(p => String(p));
        if (parts.includes(targetProviderIdStr)) {
          existingChatId = docSnap.id;
        }
      });

      if (existingChatId) {
        navigate('/messages', { state: { activeChatId: existingChatId } });
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [currentUidStr, targetProviderIdStr],
          participantNames: {
            [currentUidStr]: currentUser.displayName || userProfile?.name || currentUser.email || 'Korisnik',
            [targetProviderIdStr]: provider.name
          },
          lastMessage: '',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        navigate('/messages', { state: { activeChatId: newChatRef.id } });
      }
    } catch (error) {
      console.error("Greška pri pokretanju razgovora:", error);
      navigate('/messages', { state: { providerId: provider.id, providerName: provider.name } });
    } finally {
      setStartingChat(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');
    if (!newComment.trim()) return alert("Molimo unesite komentar.");

    setSubmittingReview(true);

    try {
      await addDoc(collection(db, 'reviews'), {
        providerId: String(id),
        userId: String(currentUser.uid),
        userName: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Korisnik',
        rating: Number(newRating),
        comment: newComment.trim(),
        createdAt: serverTimestamp()
      });

      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error("Greška pri spremanju recenzije:", err);
      alert("Došlo je do pogreške pri objavi recenzije.");
    } finally {
      setSubmittingReview(false);
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
  const isOwnProfile = currentUser && String(currentUser.uid) === String(provider.id);

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

      {/* Galerija */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 w-full mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" style={{ height: 280 }}>
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: GALLERY_GRADIENTS[0], minHeight: 130 }}>
            {provider.images?.[0] ? (
              <img src={provider.images[0]} alt={provider.name} className="w-full h-full object-cover" />
            ) : (
              <Sparkles size={32} style={{ color: '#2B3132', opacity: 0.25 }} />
            )}
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ height: 136 }}>
              {provider.images?.[i] ? (
                <img src={provider.images[i]} alt={`${provider.name} ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: GALLERY_GRADIENTS[i] }}>
                  <Sparkles size={32} style={{ color: '#2B3132', opacity: 0.25 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Glavni sadržaj */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 w-full pb-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-6 items-start">

        <div className="flex flex-col gap-5">

          {/* Naslov */}
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

          {/* O nama */}
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-2" style={{ color: '#2B3132' }}>O nama</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#505A5B' }}>{provider.desc}</p>
          </div>

          {/* Paketi i cijene */}
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-3" style={{ color: '#2B3132' }}>Paketi i cijene</h2>
            
            {provider.packages && provider.packages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {provider.packages.map((pkg, idx) => {
                  const isHighlight = pkg.highlight || pkg.isPopular;
                  const pkgName = pkg.title || pkg.name || pkg.naziv || pkg.packageName || `Paket ${idx + 1}`;
                  
                  let pkgPrice = 'Na upit';
                  if (pkg.price !== undefined && pkg.price !== null && pkg.price !== '') {
                    pkgPrice = typeof pkg.price === 'number' ? `${pkg.price} €` : (String(pkg.price).includes('€') ? pkg.price : `${pkg.price} €`);
                  } else if (pkg.cijena) {
                    pkgPrice = typeof pkg.cijena === 'number' ? `${pkg.cijena} €` : (String(pkg.cijena).includes('€') ? pkg.cijena : `${pkg.cijena} €`);
                  } else {
                    pkgPrice = provider.price;
                  }

                  let pkgFeatures = [];
                  if (Array.isArray(pkg.features)) {
                    pkgFeatures = pkg.features;
                  } else if (typeof pkg.features === 'string' && pkg.features.trim() !== '') {
                    pkgFeatures = pkg.features.split('\n').filter(f => f.trim() !== '');
                  } else if (Array.isArray(pkg.details)) {
                    pkgFeatures = pkg.details;
                  } else if (pkg.description) {
                    pkgFeatures = [pkg.description];
                  }

                  return (
                    <div key={pkg.id || idx} className="rounded-xl p-4 flex flex-col justify-between gap-3"
                      style={{
                        border: '2px solid ' + (isHighlight ? '#A7A5D0' : '#DDE3DE'),
                        background: isHighlight ? '#EEEDF9' : 'white',
                      }}>
                      <div>
                        <h3 className="font-bold text-sm mb-1" style={{ color: isHighlight ? '#8886B8' : '#2B3132' }}>
                          {pkgName}
                        </h3>
                        <p className="font-extrabold text-lg mb-2" style={{ color: '#A7A5D0' }}>
                          {pkgPrice}
                        </p>
                        {pkgFeatures.length > 0 && (
                          <ul className="flex flex-col gap-1.5 mt-2">
                            {pkgFeatures.map((f, fIdx) => (
                              <li key={fIdx} className="text-xs flex items-start gap-1.5" style={{ color: '#505A5B' }}>
                                <span style={{ color: '#7DA68D', fontWeight: 700 }}>✓</span> 
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl text-center" style={{ background: '#FAFBF9', border: '1px solid #DDE3DE' }}>
                <p className="text-sm font-semibold" style={{ color: '#2B3132' }}>
                  Početna cijena: <span style={{ color: '#A7A5D0' }}>{provider.price}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#8A9192' }}>
                  Pružatelj nije definirao pojedinačne pakete. Pošaljite poruku ili upit za prilagođenu ponudu.
                </p>
              </div>
            )}
          </div>

          {/* Recenzije - VIDLJIVO SAMO PRIJAVLJENIM KORISNICIMA */}
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #DDE3DE' }}>
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid #DDE3DE' }}>
              <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>
                Recenzije {userIsAuthenticated && `(${reviews.length})`}
              </h2>
              {userIsAuthenticated && reviews.length > 0 && (
                <span className="text-sm font-bold flex items-center gap-1" style={{ color: '#7DA68D' }}>
                  <Star size={15} fill="#7DA68D" stroke="none" /> {provider.rating}
                </span>
              )}
            </div>

            {userIsAuthenticated ? (
              <>
                {/* Forma za dodavanje recenzije (samo ako nije vlastiti profil) */}
                {!isOwnProfile && (
                  <form onSubmit={handleAddReview} className="mb-6 p-4 rounded-xl" style={{ background: '#FAFBF9', border: '1px solid #DDE3DE' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#505A5B' }}>Napišite svoju recenziju</h3>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="bg-transparent border-none cursor-pointer p-0.5 focus:outline-none"
                        >
                          <Star
                            size={20}
                            fill={(hoverRating || newRating) >= star ? '#7DA68D' : 'none'}
                            stroke={(hoverRating || newRating) >= star ? '#7DA68D' : '#DDE3DE'}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold ml-2" style={{ color: '#505A5B' }}>{newRating} / 5</span>
                    </div>

                    <textarea
                      rows="3"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Napišite vaše iskustvo..."
                      className="w-full p-2.5 rounded-lg text-xs outline-none resize-none mb-2"
                      style={{ border: '1px solid #DDE3DE', color: '#2B3132', background: 'white' }}
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-1.5 rounded-lg text-white text-xs font-bold border-none cursor-pointer transition-colors"
                        style={{ background: '#7DA68D', opacity: submittingReview ? 0.7 : 1 }}
                      >
                        {submittingReview ? 'Slanje...' : 'Objavi recenziju'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista recenzija za prijavljene korisnike */}
                <div className="flex flex-col gap-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: '#8A9192' }}>
                      Još nema recenzija za ovog pružatelja.
                    </p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="pb-3 mb-1" style={{ borderBottom: '1px solid #F4F5F2' }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: '#A7A5D0' }}>
                              {(r.userName || 'K')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: '#2B3132' }}>{r.userName}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                fill={s <= r.rating ? '#7DA68D' : 'none'}
                                stroke={s <= r.rating ? '#7DA68D' : '#DDE3DE'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm pl-9" style={{ color: '#505A5B' }}>{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Obavijest za neprijavljene korisnike */
              <div className="p-6 text-center rounded-xl" style={{ background: '#FAFBF9', border: '1px solid #DDE3DE' }}>
                <p className="text-sm font-medium" style={{ color: '#505A5B' }}>
                  Recenzije su vidljive samo prijavljenim korisnicima.
                </p>
                <p className="text-xs mt-2" style={{ color: '#8A9192' }}>
                  <Link to="/login" className="font-bold underline" style={{ color: '#A7A5D0' }}>
                    Prijavite se
                  </Link> kako biste vidjeli doživljaje drugih korisnika i ostavili svoju recenziju.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">

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
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-colors text-center block"
                style={{ background: '#A7A5D0', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}>
                Prijavi se za kontakt
              </Link>
            )}
          </div>

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