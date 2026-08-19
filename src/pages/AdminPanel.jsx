import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, RotateCcw } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { categoryData } from '../utils/categoryData';

export default function AdminPanel() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState('pending');

  // Funkcija za dohvaćanje pružatelja iz Firestore baze
  const fetchProviders = async () => {
    setLoadingData(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'provider'));
      const querySnapshot = await getDocs(q);
      
      const list = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          providerName: data.name || '',
          email: data.email || '',
          businessName: data.businessName || data.name || '(bez naziva)',
          category: data.category || '',
          city: data.city || '',
          address: data.address || '',
          oib: data.oib || '',
          location: data.city || data.location || 'Nije uneseno',
          basePrice: data.price || data.basePrice || '0',
          desc: data.desc || data.description || '',
          phone: data.phone || '',
          packages: data.packages || [],
          status: (data.status || data.providerStatus || 'pending').toLowerCase().trim()
        };
      });

      setProviders(list);
    } catch (err) {
      console.error("Greška pri dohvaćanju pružatelja:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    if (userProfile?.role !== 'admin') { 
      console.log("Nemate admin prava. Trenutna uloga:", userProfile?.role);
      navigate('/'); 
      return; 
    }

    fetchProviders();
  }, [currentUser, userProfile, navigate]);

  // Ažuriranje statusa u Firebase Firestore-u
  const handleStatusChange = async (uid, newStatus) => {
    try {
      const providerRef = doc(db, 'users', uid);
      
      // Ažuriramo oba polja u Firestore bazi za maksimalnu kompatibilnost
      await updateDoc(providerRef, {
        status: newStatus,
        providerStatus: newStatus
      });

      // Ažuriramo lokalno stanje odjednom
      setProviders(prev => 
        prev.map(p => p.uid === uid ? { ...p, status: newStatus } : p)
      );

      console.log(`Status uspješno promijenjen u: ${newStatus}`);
    } catch (err) {
      console.error("Greška pri promjeni statusa u Firebaseu:", err);
      alert("Neuspješna promjena statusa u bazi. Provjerite sigurnosna pravila (Rules).");
    }
  };

  const filtered = filter === 'all' 
    ? providers 
    : providers.filter(p => {
        if (filter === 'approved') return p.status === 'approved' || p.status === 'active';
        return p.status === filter;
      });
  
  const counts = {
    pending:  providers.filter(p => p.status === 'pending').length,
    approved: providers.filter(p => p.status === 'approved' || p.status === 'active').length,
    rejected: providers.filter(p => p.status === 'rejected').length,
  };

  const statusBadge = (s) => {
    const styles = {
      pending:  { bg: '#FFF3CD', color: '#856404', label: 'Čeka' },
      approved: { bg: '#E8F0EA', color: '#4A8060', label: 'Odobren' },
      active:   { bg: '#E8F0EA', color: '#4A8060', label: 'Odobren' },
      rejected: { bg: '#FEE8E8', color: '#B03030', label: 'Odbijen' },
      draft:    { bg: '#F4F5F2', color: '#8A9192', label: 'Nacrt' },
    };
    const st = styles[s] || styles.draft;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>

      {/* Header */}
      <div style={{ background: '#505A5B', padding: '28px 24px' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin panel</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
              Upravljanje zahtjevima pružatelja usluga
            </p>
          </div>
          <button 
            onClick={fetchProviders}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <RotateCcw size={14} /> Osvježi
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8 w-full">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[['pending','Čekaju odobrenje'], ['approved','Odobreni'], ['rejected','Odbijeni'], ['all','Svi']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ background: filter === val ? '#505A5B' : 'white', color: filter === val ? 'white' : '#505A5B', border: '1px solid #DDE3DE', cursor: 'pointer' }}>
              {lbl}
              {val !== 'all' && counts[val] !== undefined && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: filter === val ? 'rgba(255,255,255,0.2)' : '#F4F5F2', color: filter === val ? 'white' : '#8A9192' }}>
                  {counts[val]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loadingData ? (
          <div className="flex justify-center py-16">
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #DDE3DE', borderTopColor: '#7DA68D', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #DDE3DE' }}>
            <p className="text-lg font-semibold mb-1" style={{ color: '#2B3132' }}>Nema zahtjeva</p>
            <p className="text-sm" style={{ color: '#8A9192' }}>U ovom filteru nema pružatelja usluga</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(p => {
              const cat = categoryData ? categoryData[p.category] : null;
              return (
                <div key={p.uid} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {cat?.icon && <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>}
                        <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>{p.businessName}</h2>
                        {statusBadge(p.status)}
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#8A9192' }}>
                        Kategorija: <b>{cat?.label || p.category}</b> • {p.location} • Od {p.basePrice} € • {p.providerName} ({p.email})
                      </p>
                      <p className="text-sm" style={{ color: '#505A5B' }}>{p.desc || 'Nema opisa.'}</p>
                      
                      {p.packages?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {p.packages.map((pkg, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs"
                              style={{ background: '#F4F5F2', color: '#505A5B', border: '1px solid #DDE3DE' }}>
                              {pkg.name} — {pkg.price} €
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Akcijski gumbi */}
                    <div className="flex gap-2 flex-shrink-0 self-start">
                      {p.status !== 'rejected' && (
                        <button onClick={() => handleStatusChange(p.uid, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                          style={{ background: '#FEE8E8', color: '#B03030', border: '1px solid #F5C6C6', cursor: 'pointer' }}>
                          <X size={14} /> Odbij
                        </button>
                      )}
                      
                      {p.status !== 'approved' && p.status !== 'active' && (
                        <button onClick={() => handleStatusChange(p.uid, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                          style={{ background: '#E8F0EA', color: '#4A8060', border: '1px solid #C8DAD0', cursor: 'pointer' }}>
                          <Check size={14} /> Odobri
                        </button>
                      )}
                    </div>

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