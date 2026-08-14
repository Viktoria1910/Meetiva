import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getProviders, updateProviderStatus } from '../utils/providerStorage';
import { categoryData } from '../utils/categoryData';

export default function AdminPanel() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!isLoggedIn || user.role !== 'admin') { navigate('/'); return; }
    getProviders().then(list => { setProviders(list); setLoadingData(false); });
  }, [isLoggedIn]);

  const handle = async (uid, status) => {
    await updateProviderStatus(uid, status);
    getProviders().then(setProviders);
  };

  const filtered = filter === 'all' ? providers : providers.filter(p => p.status === filter);
  const counts = {
    pending:  providers.filter(p => p.status === 'pending').length,
    approved: providers.filter(p => p.status === 'approved').length,
    rejected: providers.filter(p => p.status === 'rejected').length,
  };

  const statusBadge = (s) => {
    const styles = {
      pending:  { bg: '#FFF3CD', color: '#856404', label: 'Čeka' },
      approved: { bg: '#E8F0EA', color: '#4A8060', label: 'Odobren' },
      rejected: { bg: '#FEE8E8', color: '#B03030', label: 'Odbijen' },
      draft:    { bg: '#F4F5F2', color: '#8A9192', label: 'Nacrt' },
    };
    const st = styles[s] || styles.draft;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div style={{ background: '#505A5B', padding: '28px 24px' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
          <h1 className="text-2xl font-extrabold text-white">Admin panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            Upravljanje zahtjevima pružatelja usluga
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8 w-full">
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
              const cat = categoryData[p.category];
              return (
                <div key={p.uid} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span style={{ fontSize: '1.2rem' }}>{cat?.icon}</span>
                        <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>{p.businessName || '(bez naziva)'}</h2>
                        {statusBadge(p.status)}
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#8A9192' }}>
                        {cat?.label} • {p.location} • Od {p.basePrice} € • {p.providerName} ({p.email})
                      </p>
                      <p className="text-sm" style={{ color: '#505A5B' }}>{p.desc}</p>
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
                    {p.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handle(p.uid, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
                          style={{ background: '#FEE8E8', color: '#B03030', border: '1px solid #F5C6C6', cursor: 'pointer' }}>
                          <X size={14} /> Odbij
                        </button>
                        <button onClick={() => handle(p.uid, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
                          style={{ background: '#E8F0EA', color: '#4A8060', border: '1px solid #C8DAD0', cursor: 'pointer' }}>
                          <Check size={14} /> Odobri
                        </button>
                      </div>
                    )}
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
