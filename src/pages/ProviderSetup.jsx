import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { categoryData } from '../utils/categoryData';
import { upsertProvider, getProviderByUserId } from '../utils/providerStorage';

export default function ProviderSetup() {
  const { user, isLoggedIn, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '', desc: '', location: '', basePrice: '', phone: '',
    packages: [{ name: '', price: '', desc: '' }],
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || user.role !== 'provider') { navigate('/'); return; }
    getProviderByUserId(user.uid).then(saved => {
      if (saved) {
        setForm({
          businessName: saved.businessName || '',
          desc: saved.desc || '',
          location: saved.location || '',
          basePrice: saved.basePrice || '',
          phone: saved.phone || '',
          packages: saved.packages?.length ? saved.packages : [{ name: '', price: '', desc: '' }],
        });
      }
      setLoadingData(false);
    });
  }, [isLoggedIn]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setPkg = (i, field, val) => setForm(f => {
    const pkgs = [...f.packages];
    pkgs[i] = { ...pkgs[i], [field]: val };
    return { ...f, packages: pkgs };
  });
  const addPkg = () => setForm(f => ({ ...f, packages: [...f.packages, { name: '', price: '', desc: '' }] }));
  const removePkg = (i) => setForm(f => ({ ...f, packages: f.packages.filter((_, idx) => idx !== i) }));

  const isValid = () =>
    form.businessName.trim().length >= 3 &&
    form.desc.trim().length >= 30 &&
    form.location.trim().length > 0 &&
    Number(form.basePrice) > 0 &&
    form.phone.trim().length > 0 &&
    form.packages.length > 0 &&
    form.packages.every(p => p.name.trim() && Number(p.price) > 0);

  const buildProvider = (status) => ({
    uid: user.uid,
    category: user.category,
    businessName: form.businessName,
    desc: form.desc,
    location: form.location,
    basePrice: form.basePrice,
    phone: form.phone,
    packages: form.packages,
    status,
    providerName: user.name,
    email: user.email,
    submittedAt: status === 'pending' ? Date.now() : null,
  });

  const saveDraft = async () => {
    setSaving(true);
    await upsertProvider(buildProvider('draft'));
    setSaving(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    setSaving(true);
    await upsertProvider(buildProvider('pending'));
    await updateUser({ providerStatus: 'pending' });
    setSaving(false);
    setSubmitted(true);
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm';
  const inputStyle = { borderColor: '#DDE3DE', background: 'white', color: '#2B3132' };
  const catData = user ? categoryData[user.category] : null;

  if (!user) return null;

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #DDE3DE', borderTopColor: '#A7A5D0', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (submitted || user.providerStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center" style={{ border: '1px solid #DDE3DE' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EEEDF9' }}>
              <span style={{ fontSize: '2rem' }}>⏳</span>
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#2B3132' }}>Zahtjev poslan!</h2>
            <p className="text-sm mb-6" style={{ color: '#8A9192' }}>
              Tvoj profil je poslan na pregled. Admin će ga odobriti u kratkom roku, a ti ćeš se moći pojaviti u kategoriji{' '}
              <strong style={{ color: '#2B3132' }}>{catData?.label}</strong>.
            </p>
            <button onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-full font-semibold text-white"
              style={{ background: '#7DA68D', border: 'none', cursor: 'pointer' }}>
              Na početnu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div style={{ background: '#7DA68D', padding: '28px 24px' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
          <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {catData?.icon} {catData?.label}
          </p>
          <h1 className="text-2xl font-extrabold text-white">Postavi svoj profil</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
            Ispuni sve podatke i pošalji zahtjev adminu za odobrenje
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-4" style={{ color: '#2B3132' }}>Osnovni podaci</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>Naziv usluge / brend *</label>
                <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                  className={inputCls} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                  onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                  placeholder="npr. Foto Studio Sunce" />
                {form.businessName.length > 0 && form.businessName.trim().length < 3 && (
                  <p className="text-xs mt-1" style={{ color: '#B03030' }}>Minimalno 3 znaka</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                  Opis usluge *{' '}
                  <span style={{ color: '#8A9192', fontWeight: 400 }}>({form.desc.trim().length}/30 min)</span>
                </label>
                <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={4}
                  className={inputCls} style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                  onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                  placeholder="Opiši što nudiš, svoju specijalizaciju, iskustvo..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>Lokacija *</label>
                  <input value={form.location} onChange={e => set('location', e.target.value)}
                    className={inputCls} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                    onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                    placeholder="npr. Zagreb" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>Početna cijena (€) *</label>
                  <input type="number" min="1" value={form.basePrice} onChange={e => set('basePrice', e.target.value)}
                    className={inputCls} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                    onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                    placeholder="150" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>Kontakt (telefon) *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  className={inputCls} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                  onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                  placeholder="+385 91 234 5678" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>Paketi / ponude *</h2>
              <button type="button" onClick={addPkg}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ background: '#EEEDF9', color: '#8886B8', border: '1px solid #D4D2EC', cursor: 'pointer' }}>
                <Plus size={14} /> Dodaj paket
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {form.packages.map((pkg, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: '#F4F5F2', border: '1px solid #DDE3DE' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{ color: '#505A5B' }}>Paket {i + 1}</span>
                    {form.packages.length > 1 && (
                      <button type="button" onClick={() => removePkg(i)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8A9192' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#B03030'}
                        onMouseLeave={e => e.currentTarget.style.color = '#8A9192'}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Naziv paketa *</label>
                      <input value={pkg.name} onChange={e => setPkg(i, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ ...inputStyle, background: 'white' }}
                        onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                        onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                        placeholder="npr. Basic, Premium..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Cijena (€) *</label>
                      <input type="number" min="1" value={pkg.price} onChange={e => setPkg(i, 'price', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ ...inputStyle, background: 'white' }}
                        onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                        onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                        placeholder="300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Opis paketa</label>
                    <input value={pkg.desc} onChange={e => setPkg(i, 'desc', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ ...inputStyle, background: 'white' }}
                      onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                      onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                      placeholder="Što je uključeno..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={saveDraft} disabled={saving}
              className="flex-1 py-3 rounded-full font-semibold text-sm"
              style={{ background: 'white', color: '#8A9192', border: '1px solid #DDE3DE', cursor: 'pointer' }}>
              {saving ? 'Spremanje...' : 'Spremi nacrt'}
            </button>
            <button type="submit" disabled={!isValid() || saving}
              className="flex-1 py-3 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: isValid() && !saving ? '#7DA68D' : '#C8DAD0', border: 'none', cursor: isValid() && !saving ? 'pointer' : 'not-allowed' }}>
              <Send size={15} /> {saving ? 'Slanje...' : 'Pošalji zahtjev adminu'}
            </button>
          </div>
          {!isValid() && (
            <p className="text-xs text-center" style={{ color: '#8A9192' }}>
              Ispuni sva obavezna polja (*) da bi mogao/la poslati zahtjev
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
