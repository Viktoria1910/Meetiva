import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProviderProfile() {
  const { user, updateUser } = useAuth();
  const [city, setCity] = useState(user?.city || '');
  const [price, setPrice] = useState(user?.price || '');
  const [description, setDescription] = useState(user?.description || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser({ city, price, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* STATUS PROFILE BAZERAN NA ADMIN ODOBRENJU */}
      {user?.providerStatus === 'pending' ? (
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

      {/* FORMA ZA POPUNJAVANJE PROFILA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h1 className="text-xl font-extrabold text-gray-800 mb-1">Moj Profil Pružatelja</h1>
        <p className="text-xs text-gray-400 mb-6 uppercase font-bold tracking-wider">Kategorija: {user?.category}</p>

        {saved && <p className="mb-4 text-xs font-bold text-emerald-600">Sve promjene su uspješno spremljene!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Grad / Lokacija</label>
            <input 
              type="text" 
              required
              placeholder="Npr. Zagreb, Split..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
            />
          </div>

          <div>
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Početna cijena (€)</label>
            <input 
              type="number" 
              required
              placeholder="Npr. 350"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
            />
          </div>

          <div>
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 block mb-1">Opis usluge / ponude</label>
            <textarea 
              rows={5}
              required
              placeholder="Napišite što sve uključuje vaša usluga..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7DA68D]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-[#7DA68D] hover:opacity-90 cursor-pointer shadow-md"
          >
            Spremi podatke profila
          </button>
        </form>
      </div>
    </div>
  );
}