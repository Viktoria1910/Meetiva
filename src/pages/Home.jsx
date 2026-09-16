import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Heart, Camera, Wine, Music, Sparkles, PartyPopper } from 'lucide-react';
import { categoryData } from '../utils/categoryData';

const CATEGORY_CARDS = [
  { 
    slug: 'sale', 
    label: 'Wedding Halls', 
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    slug: 'bendovi', 
    label: 'Bands & DJs', 
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    slug: 'fotografi', 
    label: 'Photographers', 
    img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    slug: 'catering', 
    label: 'Catering', 
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800' 
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (where) params.append('where', where);
    if (when) params.append('when', when);

    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col">

      {/* ═══ HERO ═══ */}
      <div className="w-full px-4 sm:px-8 py-4">
        <section className="w-full py-16 sm:py-20 px-6 rounded-3xl text-center relative overflow-hidden" style={{ background: '#7DA68D' }}>
          
          {/* Decorative background icons */}
          <div className="absolute inset-0 pointer-events-none select-none text-white/15 overflow-hidden">
            <Camera className="absolute top-6 left-8 w-16 h-16 -rotate-12" />
            <Wine className="absolute top-10 right-12 w-14 h-14 rotate-12" />
            <Music className="absolute bottom-12 left-16 w-12 h-12 rotate-45" />
            <Calendar className="absolute bottom-8 right-20 w-16 h-16 -rotate-12" />
            <PartyPopper className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 -rotate-12 hidden sm:block" />
            <Sparkles className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 rotate-12 hidden sm:block" />
            <Heart className="absolute top-4 left-1/3 w-8 h-8 rotate-12 opacity-60" />
          </div>

          <div className="max-w-3xl mx-auto relative z-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Isplaniraj svoj događaj uz Meetivu
            </h1>
            <p className="text-white/85 text-sm sm:text-base max-w-lg mx-auto mb-10">
              Od intimnih okupljanja do velikih korporativnih gala večera – pronađite sve što vam treba na jednom mjestu.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl flex flex-col md:flex-row items-stretch w-full overflow-hidden p-2 md:p-0 gap-2 md:gap-0 shadow-lg">

                {/* KATEGORIJA */}
                <div className="flex items-center gap-3 flex-1 px-4 py-3 md:border-r border-gray-100">
                  <Search size={18} className="text-gray-400 shrink-0" />
                  <div className="min-w-0 text-left w-full">
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Što tražiš?</p>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="w-full border-none outline-none text-xs sm:text-sm bg-transparent cursor-pointer" 
                      style={{ color: '#788284' }}
                    >
                      <option value="">Odaberi kategoriju...</option>
                      <option value="sale">Sale i prostori</option>
                      <option value="fotografi">Fotografi i snimatelji</option>
                      <option value="bendovi">Bendovi & DJ-i</option>
                      <option value="catering">Catering i hrana</option>
                      <option value="dekoracije">Dekoracije i cvijeće</option>
                    </select>
                  </div>
                </div>

                {/* GDJE? */}
                <div className="flex items-center gap-3 flex-1 px-4 py-3 md:border-r border-gray-100">
                  <MapPin size={18} className="text-gray-400 shrink-0" />
                  <div className="min-w-0 text-left w-full">
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Gdje?</p>
                    <input 
                      type="text" 
                      value={where} 
                      onChange={e => setWhere(e.target.value)}
                      placeholder="Grad"
                      className="w-full border-none outline-none text-xs sm:text-sm bg-transparent" 
                      style={{ color: '#2B3132' }} 
                    />
                  </div>
                </div>

                {/* KADA? */}
                <div className="flex items-center gap-3 flex-1 px-4 py-3 md:border-r border-gray-100">
                  <Calendar size={18} className="text-gray-400 shrink-0" />
                  <div className="min-w-0 text-left w-full">
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Kada?</p>
                    <input 
                      type="text" 
                      value={when} 
                      onChange={e => setWhen(e.target.value)}
                      placeholder="Datum"
                      className="w-full border-none outline-none text-xs sm:text-sm bg-transparent" 
                      style={{ color: '#2B3132' }} 
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <button 
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 font-semibold text-white text-sm rounded-xl md:rounded-none shrink-0 transition-all hover:opacity-90 cursor-pointer"
                  style={{ background: '#A7A5D0', border: 'none' }}
                >
                  Search
                </button>

              </div>
            </form>
          </div>
        </section>
      </div>

      {/* ═══ KRAĆI UVODNI TEKST IZA HERO SEKCIJE ═══ */}
<section className="w-full px-4 sm:px-8 pt-8 pb-2 text-center max-w-2xl mx-auto flex flex-col items-center">
  {/* Elegantna neutralna ikonica */}
  <Sparkles size={28} style={{ color: '#7DA68D' }} className="mb-2" />

</section>

      {/* ═══ BROWSE BY CATEGORY (BENTO GRID) ═══ */}
      <section className="w-full px-4 sm:px-8 py-6">
        <h3 className="text-lg font-extrabold mb-4" style={{ color: '#4e5053' }}>Izaberi kategoriju</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[380px]">
          {/* 1. Wedding Halls */}
          <Link 
            to={'/services/' + CATEGORY_CARDS[0].slug}
            className="relative md:row-span-2 rounded-2xl overflow-hidden group shadow-sm flex flex-col justify-end p-6 min-h-[240px] md:min-h-full"
            style={{ textDecoration: 'none' }}>
            <img src={CATEGORY_CARDS[0].img} alt={CATEGORY_CARDS[0].label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 text-white">
              <h3 className="font-bold text-lg">{CATEGORY_CARDS[0].label}</h3>
            </div>
          </Link>

          {/* 2. Bands & DJs */}
          <Link 
            to={'/services/' + CATEGORY_CARDS[1].slug}
            className="relative rounded-2xl overflow-hidden group shadow-sm flex flex-col justify-end p-5 h-[180px] md:h-auto"
            style={{ textDecoration: 'none' }}>
            <img src={CATEGORY_CARDS[1].img} alt={CATEGORY_CARDS[1].label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 text-white">
              <h3 className="font-bold text-base">{CATEGORY_CARDS[1].label}</h3>
            </div>
          </Link>

          {/* 3. Photographers */}
          <Link 
            to={'/services/' + CATEGORY_CARDS[2].slug}
            className="relative rounded-2xl overflow-hidden group shadow-sm flex flex-col justify-end p-5 h-[180px] md:h-auto"
            style={{ textDecoration: 'none' }}>
            <img src={CATEGORY_CARDS[2].img} alt={CATEGORY_CARDS[2].label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 text-white">
              <h3 className="font-bold text-base">{CATEGORY_CARDS[2].label}</h3>
            </div>
          </Link>

          {/* 4. Catering */}
          <Link 
            to={'/services/' + CATEGORY_CARDS[3].slug}
            className="relative md:col-span-2 rounded-2xl overflow-hidden group shadow-sm flex flex-col justify-end p-5 h-[180px] md:h-auto"
            style={{ textDecoration: 'none' }}>
            <img src={CATEGORY_CARDS[3].img} alt={CATEGORY_CARDS[3].label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 text-white">
              <h3 className="font-bold text-base">{CATEGORY_CARDS[3].label}</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══ KORACI ORGANIZACIJE ═══ */}
      <section className="w-full px-4 sm:px-8 py-8 text-center max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block" style={{ background: '#EEEDF9', color: '#8886B8' }}>
          Jednostavno i brzo
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="p-4 rounded-2xl" style={{ background: '#F9FAFB' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 text-white" style={{ background: '#7DA68D' }}>1</div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#2B3132' }}>Pretražite</h3>
            <p className="text-xs" style={{ color: '#6B7280' }}>Pregledajte provjerene pružatelje usluga u vašoj blizini.</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: '#F9FAFB' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 text-white" style={{ background: '#7DA68D' }}>2</div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#2B3132' }}>Usporedite</h3>
            <p className="text-xs" style={{ color: '#6B7280' }}>Pogledajte ocjene, recenzije i ponude te odaberite najbolje.</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: '#F9FAFB' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 text-white" style={{ background: '#7DA68D' }}>3</div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#2B3132' }}>Rezervirajte</h3>
            <p className="text-xs" style={{ color: '#6B7280' }}>Stupite u direktan kontakt i osigurajte svoj termin.</p>
          </div>
        </div>
      </section>
      {/* ═══ CTA BANNER ZA PRUŽATELJE USLUGA ═══ */}
<section className="w-full px-4 sm:px-8 py-10">
  <div 
    className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm"
    style={{ background: '#F4F7F5', border: '1px solid #E5E7EB' }}
  >
    <div className="max-w-xl relative z-10">
      <span 
        className="text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block"
        style={{ background: '#E2EBE5', color: '#527560' }}
      >
        Za partnere
      </span>
      <h3 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: '#2B3132' }}>
        Nudite usluge za događaje?
      </h3>
      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#6B7280' }}>
        Pridružite se Meetivi, istaknite svoju ponudu i povežite se s klijentima koji traže baš vaše usluge.
      </p>
    </div>

    <div className="relative z-10 shrink-0 w-full sm:w-auto">
      <Link
        to="/register"
        className="inline-block w-full sm:w-auto text-center px-6 py-3.5 font-semibold text-white text-sm rounded-xl transition-all hover:opacity-90 shadow-sm"
        style={{ background: '#7DA68D', textDecoration: 'none' }}
      >
        Postani partner
      </Link>
    </div>
  </div>
</section>

    </div>
  );
}