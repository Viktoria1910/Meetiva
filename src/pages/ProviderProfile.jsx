import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Clock, CheckCircle2, Link as LinkIcon, Trash2, Image as ImageIcon, Plus } from 'lucide-react';

export default function ProviderProfile() {
  const { currentUser, userProfile, updateUser } = useAuth();

  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');

  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [packages, setPackages] = useState([
    { name: 'Basic', price: '', features: [''] },
    { name: 'Standard', price: '', features: [''] },
    { name: 'Premium', price: '', features: [''] }
  ]);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Izravno učitavanje svježih podataka iz Firestore-a
  useEffect(() => {
    async function loadFreshUserData() {
      const userId = currentUser?.uid || userProfile?.id || userProfile?.uid;
      if (!userId) {
        setFetching(false);
        return;
      }

      try {
        // Čitamo iz 'users' ili 'providers'
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        let data = null;
        if (userSnap.exists()) {
          data = userSnap.data();
        } else {
          const providerSnap = await getDoc(doc(db, 'providers', userId));
          if (providerSnap.exists()) data = providerSnap.data();
        }

        if (data) {
          setCity(data.city || '');
          setPrice(data.price || data.basePrice || '');
          setDescription(data.description || data.desc || '');
          setPhone(data.phone || data.phoneNumber || '');
          
          // Podrška za različite nazive polja slika (images / gallery / portfolio)
          const rawImages = data.images || data.gallery || data.portfolio || [];
          if (Array.isArray(rawImages)) {
            // Normalizacija: pretvaramo i objekte i stringove u čiste URL-ove
            const extractedUrls = rawImages.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
            setImages(extractedUrls);
          }

          if (Array.isArray(data.packages) && data.packages.length > 0) {
            setPackages(data.packages);
          }
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju profila:", err);
      } finally {
        setFetching(false);
      }
    }

    loadFreshUserData();
  }, [currentUser, userProfile]);

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) return;

    if (images.length >= 30) {
      alert("Možete dodati maksimalno 30 slika.");
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert("Unesite valjani URL koji počinje s http:// ili https://");
      return;
    }

    setImages((prev) => [...prev, url]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePackageChange = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const handleFeatureChange = (pkgIdx, featIdx, value) => {
    const updated = [...packages];
    updated[pkgIdx].features[featIdx] = value;
    setPackages(updated);
  };

  const addFeature = (pkgIdx) => {
    const updated = [...packages];
    updated[pkgIdx].features.push('');
    setPackages(updated);
  };

  const removeFeature = (pkgIdx, featIdx) => {
    const updated = [...packages];
    updated[pkgIdx].features = updated[pkgIdx].features.filter((_, i) => i !== featIdx);
    setPackages(updated);
  };

  const handleSaveData = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSaved(false);

    try {
      const userId = currentUser?.uid || userProfile?.id || userProfile?.uid;

      if (!userId) {
        alert("Korisnički ID nije pronađen! Jeste li prijavljeni?");
        throw new Error("Korisnički ID nije pronađen. Molimo prijavite se ponovno.");
      }

      const numericPrice = Number(price) || 0;
      const formattedPackages = packages.map((pkg) => ({
        ...pkg,
        price: Number(pkg.price) || 0,
      }));

      // Priprema slika u obliku objekata s URL-om za komponente koje traže object format { url: "..." }
      const imageObjects = images.map((url, i) => ({ id: i, url }));

      const profileData = {
        city,
        price: numericPrice,
        basePrice: numericPrice,
        description,
        desc: description,
        phone,
        phoneNumber: phone,
        
        // Spremanje u svim mogućim formatima kako bi profil na frontend-u sigurno prikazao slike
        images: images,             // Niz stringova ["http...", "http..."]
        gallery: images,            // Alternativni naziv (stringovi)
        portfolio: imageObjects,    // Niz objekata [{ id: 0, url: "http..." }]

        packages: formattedPackages,
        updatedAt: Date.now()
      };

      // Spremanje u Firestore
      await setDoc(doc(db, 'users', userId), profileData, { merge: true });
      await setDoc(doc(db, 'providers', userId), profileData, { merge: true });

      // Osvježavanje AuthContext-a ako funkcija postoji
      if (typeof updateUser === 'function') {
        try {
          await updateUser(profileData);
        } catch (uErr) {
          console.warn("updateUser greška (zanemareno):", uErr);
        }
      }

      // Prikazujemo poruku o uspjehu
      setSaved(true);

      // Automatski skrij poruku nakon 5 sekundi
      setTimeout(() => {
        setSaved(false);
      }, 5000);

    } catch (error) {
      console.error("Greška pri spremanju profila:", error);
      setErrorMessage("Došlo je do greške pri spremanju: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const activeStatus = userProfile?.status || userProfile?.providerStatus || 'pending';
  const activeCategory = userProfile?.category || 'Nije definirana';

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm font-semibold text-gray-500">
        Učitavanje podataka profila...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {activeStatus === 'pending' ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <Clock className="shrink-0 mt-0.5 text-amber-600" size={20} />
          <div className="text-xs">
            <p className="font-bold text-sm">Profil čeka odobrenje administratora!</p>
            <p className="mt-1">Popunite podatke o svojoj usluzi niže. Vaše ponude neće biti vidljive ostalim korisnicima dok ih Admin ne prihvati.</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
          <p className="text-xs font-semibold">Vaš profil je prihvaćen i vidljiv je na platformi!</p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h1 className="text-xl font-extrabold text-gray-800 mb-1">Moj Profil Pružatelja</h1>
        <p className="text-xs text-gray-400 mb-6 uppercase font-bold tracking-wider">Kategorija: {activeCategory}</p>

        {/* Obavijesti o spremanju */}
        {saved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 transition-all">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Sve promjene su uspješno spremljene u bazu!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSaveData} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Grad / Lokacija</label>
                <input
                  type="text"
                  placeholder="Npr. Zagreb, Split..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
                />
              </div>

              <div>
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Kontakt Telefon</label>
                <input
                  type="text"
                  placeholder="Npr. +385 91 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Početna cijena (€)</label>
              <input
                type="number"
                placeholder="Npr. 350"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
              />
            </div>

            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Opis usluge / ponude</label>
              <textarea
                rows={4}
                placeholder="Napišite što sve uključuje vaša usluga..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block">Galerija slika (URL linkovi)</label>
              <span className="text-xs font-bold text-gray-400">{images.length} / 30</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Dodajte URL-ove slika vaše usluge (maksimalno 30).</p>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#7DA68D]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 rounded-xl bg-[#A7A5D0] text-white font-bold text-xs hover:opacity-90 cursor-pointer"
              >
                Dodaj
              </button>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-96 overflow-y-auto p-1">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                    <img src={url} alt={`Slika ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white cursor-pointer border-none opacity-90 hover:opacity-100"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
                <ImageIcon size={20} className="text-gray-300" />
                <span>Trenutno nemate dodanih slika u galeriji.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-3">Paketi usluga</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((pkg, pkgIdx) => (
                <div key={pkgIdx} className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => handlePackageChange(pkgIdx, 'name', e.target.value)}
                    placeholder="Naziv paketa"
                    className="font-bold text-xs bg-transparent border-b border-gray-200 w-full pb-1 outline-none text-gray-700"
                  />
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase text-gray-400 block">Cijena (€)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(pkgIdx, 'price', e.target.value)}
                      placeholder="npr. 150"
                      className="w-full text-xs font-bold text-[#A7A5D0] bg-white p-1.5 rounded-lg border border-gray-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[0.6rem] font-bold uppercase text-gray-400 block">Stavke</label>
                    {pkg.features.map((feat, featIdx) => (
                      <div key={featIdx} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => handleFeatureChange(pkgIdx, featIdx, e.target.value)}
                          placeholder="Stavka..."
                          className="w-full text-[0.7rem] p-1 rounded border border-gray-200 bg-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(pkgIdx, featIdx)}
                          className="text-red-500 bg-transparent border-none cursor-pointer p-0.5"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addFeature(pkgIdx)}
                      className="flex items-center gap-1 text-[0.65rem] font-bold text-[#7DA68D] bg-transparent border-none cursor-pointer pt-1"
                    >
                      <Plus size={10} /> Dodaj stavku
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-[#7DA68D] hover:opacity-90 cursor-pointer shadow-md transition-opacity disabled:opacity-50"
          >
            {loading ? 'Spremanje u tijeku...' : 'Spremi podatke profila'}
          </button>
        </form>
      </div>
    </div>
  );
}