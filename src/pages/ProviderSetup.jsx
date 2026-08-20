import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { categoryData } from '../utils/categoryData';
import { upsertProvider, getProviderByUserId } from '../utils/providerStorage';

export default function ProviderSetup() {
  const { user, isLoggedIn, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    businessName: '',
    oib: '',
    city: '',
    address: '',
    desc: '',
    location: '',
    basePrice: '',
    phone: '',
    packages: [{ id: Date.now(), name: '', price: '', desc: '' }],
  });

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'provider') {
      navigate('/');
      return;
    }

    if (user?.uid) {
      getProviderByUserId(user.uid)
        .then((saved) => {
          if (saved) {
            setForm({
              businessName: saved.businessName || '',
              oib: saved.oib || '',
              city: saved.city || '',
              address: saved.address || '',
              desc: saved.desc || '',
              location: saved.location || '',
              basePrice: saved.basePrice || '',
              phone: saved.phone || '',
              packages: saved.packages?.length
                ? saved.packages.map((p, idx) => ({ ...p, id: p.id || Date.now() + idx }))
                : [{ id: Date.now(), name: '', price: '', desc: '' }],
            });
          }
        })
        .catch((err) => console.error('Greška pri dohvaćanju pružatelja:', err))
        .finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [isLoggedIn, user?.uid, user?.role, navigate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const setPkg = (id, field, val) => {
    setForm((f) => ({
      ...f,
      packages: f.packages.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    }));
  };

  const addPkg = () => {
    setForm((f) => ({
      ...f,
      packages: [...f.packages, { id: Date.now(), name: '', price: '', desc: '' }],
    }));
  };

  const removePkg = (id) => {
    setForm((f) => ({
      ...f,
      packages: f.packages.filter((p) => p.id !== id),
    }));
  };

  // Provjera valjanosti
  const validateForm = () => {
    if (!form.businessName.trim() || form.businessName.trim().length < 3) {
      alert('Naziv obrta/tvrtke mora imati najmanje 3 znaka.');
      return false;
    }
    if (form.oib.trim().length !== 11) {
      alert('OIB mora sadržavati točno 11 znamenki!');
      return false;
    }
    if (!form.city.trim()) {
      alert('Molimo unesite Grad / Mjesto.');
      return false;
    }
    if (!form.desc.trim() || form.desc.trim().length < 30) {
      alert(`Opis usluge mora imati barem 30 znakova! Trenutno ima: ${form.desc.trim().length}`);
      return false;
    }
    if (!form.location.trim()) {
      alert('Molimo unesite Regiju / Lokaciju djelovanja.');
      return false;
    }
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      alert('Početna cijena mora biti broj veći od 0.');
      return false;
    }
    if (!form.phone.trim()) {
      alert('Molimo unesite kontakt telefon.');
      return false;
    }
    if (!form.packages.length) {
      alert('Morate dodati barem jedan paket.');
      return false;
    }
    for (let i = 0; i < form.packages.length; i++) {
      const p = form.packages[i];
      if (!p.name.trim() || !p.price || Number(p.price) <= 0) {
        alert(`Paket ${i + 1} mora imati naziv i cijenu veću od 0.`);
        return false;
      }
    }
    return true;
  };

  const buildProvider = (status) => ({
    uid: user?.uid || '',
    category: user?.category || 'ostalo',
    businessName: form.businessName || '',
    oib: form.oib || '',
    city: form.city || '',
    address: form.address || '',
    desc: form.desc || '',
    location: form.location || '',
    basePrice: Number(form.basePrice) || 0,
    phone: form.phone || '',
    packages: form.packages.map((p) => ({
      ...p,
      price: Number(p.price) || 0,
    })),
    status: status,
    providerName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Korisnik',
    email: user?.email || '',
    submittedAt: status === 'pending' ? Date.now() : null,
  });

  const saveDraft = async () => {
    setSaving(true);
    try {
      await upsertProvider(buildProvider('draft'));
      showToast('Nacrt je uspješno spremljen!');
    } catch (err) {
      console.error('Greška pri spremanju nacrta:', err);
      alert('Greška pri spremanju nacrta: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 1. Provjera polja s točnim porukama ako nešto nedostaje
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (!user || !user.uid) {
        throw new Error('Korisnik nije prijavljen ili nedostaje UID.');
      }

      const providerData = buildProvider('pending');

      await upsertProvider(providerData);

      if (typeof updateUserData === 'function') {
        await updateUserData({ providerStatus: 'pending' });
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Detalji greške pri slanju:', err);
      alert(`Došlo je do greške pri spremanju u bazu: ${err.message || 'Nepoznata greška'}`);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm';
  const inputStyle = { borderColor: '#DDE3DE', background: 'white', color: '#2B3132' };
  const catData = user ? categoryData[user.category] : null;

  if (!user) return null;

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <div className="flex-1 flex items-center justify-center">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid #DDE3DE',
              borderTopColor: '#A7A5D0',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (submitted || user.providerStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="bg-white rounded-3xl p-10 max-w-md w-full text-center"
            style={{ border: '1px solid #DDE3DE' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#EEEDF9', color: '#8886B8' }}
            >
              <Clock size={32} />
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#2B3132' }}>
              Zahtjev poslan!
            </h2>
            <p className="text-sm mb-6" style={{ color: '#8A9192' }}>
              Tvoj profil je poslan na pregled. Admin će ga odobriti u kratkom roku, a ti ćeš se moći
              pojaviti u kategoriji <strong style={{ color: '#2B3132' }}>{catData?.label}</strong>.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-full font-semibold text-white"
              style={{ background: '#7DA68D', border: 'none', cursor: 'pointer' }}
            >
              Na početnu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toastMessage}
        </div>
      )}

      <div style={{ background: '#7DA68D', padding: '28px 24px' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}
          >
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
            <h2 className="font-bold text-base mb-4" style={{ color: '#2B3132' }}>
              Osnovni podaci i registracija
            </h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                    Naziv obrta / tvrtke *
                  </label>
                  <input
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="npr. Foto Studio Sunce d.o.o."
                  />
                  {form.businessName.length > 0 && form.businessName.trim().length < 3 && (
                    <p className="text-xs mt-1" style={{ color: '#B03030' }}>
                      Minimalno 3 znaka
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                    OIB *
                  </label>
                  <input
                    value={form.oib}
                    onChange={(e) => set('oib', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="12345678901"
                  />
                  {form.oib.length > 0 && form.oib.length !== 11 && (
                    <p className="text-xs mt-1" style={{ color: '#B03030' }}>
                      OIB mora imati točno 11 znamenki
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                    Grad / Mjesto *
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="npr. Zagreb"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                    Ulica i kućni broj
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="npr. Ilica 10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                  Opis usluge *{' '}
                  <span style={{ color: form.desc.trim().length >= 30 ? '#7DA68D' : '#B03030', fontWeight: 600 }}>
                    ({form.desc.trim().length}/30 min)
                  </span>
                </label>
                <textarea
                  value={form.desc}
                  onChange={(e) => set('desc', e.target.value)}
                  rows={4}
                  className={inputCls}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Opiši što nudiš, svoju specijalizaciju, iskustvo..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                    Regija / Lokacija djelovanja *
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="npr. Grad Zagreb i Zagrebačka županija"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                    Početna cijena (€) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.basePrice}
                    onChange={(e) => set('basePrice', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>
                  Kontakt telefon *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="+385 91 234 5678"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>
                Paketi / ponude *
              </h2>
              <button
                type="button"
                onClick={addPkg}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{
                  background: '#EEEDF9',
                  color: '#8886B8',
                  border: '1px solid #D4D2EC',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Dodaj paket
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {form.packages.map((pkg, i) => (
                <div
                  key={pkg.id || i}
                  className="p-4 rounded-xl"
                  style={{ background: '#F4F5F2', border: '1px solid #DDE3DE' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{ color: '#505A5B' }}>
                      Paket {i + 1}
                    </span>
                    {form.packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePkg(pkg.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#8A9192',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>
                        Naziv paketa *
                      </label>
                      <input
                        value={pkg.name}
                        onChange={(e) => setPkg(pkg.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ ...inputStyle, background: 'white' }}
                        placeholder="npr. Basic, Premium..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>
                        Cijena (€) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.price}
                        onChange={(e) => setPkg(pkg.id, 'price', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ ...inputStyle, background: 'white' }}
                        placeholder="300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>
                      Opis paketa
                    </label>
                    <input
                      value={pkg.desc}
                      onChange={(e) => setPkg(pkg.id, 'desc', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ ...inputStyle, background: 'white' }}
                      placeholder="Što je uključeno..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="flex-1 py-3 rounded-full font-semibold text-sm"
              style={{
                background: 'white',
                color: '#8A9192',
                border: '1px solid #DDE3DE',
                cursor: 'pointer',
              }}
            >
              {saving ? 'Spremanje...' : 'Spremi nacrt'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{
                background: !saving ? '#7DA68D' : '#C8DAD0',
                border: 'none',
                cursor: !saving ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={15} /> {saving ? 'Slanje...' : 'Pošalji zahtjev adminu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}