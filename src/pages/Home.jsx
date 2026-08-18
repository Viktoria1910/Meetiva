import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Heart } from 'lucide-react';
import { categoryData } from '../utils/categoryData';
import { Camera, Wine, Music, Sparkles, PartyPopper } from 'lucide-react';

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

const CARD_BG = [
  'linear-gradient(135deg,#C8DAD0,#E8F0EA)',
  'linear-gradient(135deg,#D4D2EC,#EEEDF9)',
  'linear-gradient(135deg,#BDD2C4,#E0EBE4)',
  'linear-gradient(135deg,#C5CEDE,#E4EAF4)',
];

const TOP_PROVIDERS = Object.entries(categoryData)
  .flatMap(([cat, d]) => d.providers.map(p => ({ ...p, category: cat, catLabel: d.label, catIcon: d.icon })))
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 4);

const FOOTER_LINKS = {
  Company: ['About', 'Blog', 'Careers'],
  Legal: ['Terms', 'Privacy', 'Cookies'],
  Support: ['Help Center', 'Contact Us', 'FAQ'],
};

export default function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState(''); // Popravljeno: zamijenjeno "what" sa "category"
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');
  const [liked, setLiked] = useState({});

  const handleSearch = (e) => {
  e.preventDefault();
  
  // Stvaramo URL parametre na temelju onoga što je korisnik unio/odabrao
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (where) params.append('where', where);
  if (when) params.append('when', when);

  // Preusmjeravamo na /services?category=...&where=...&when=...
  navigate(`/services?${params.toString()}`);
};

  const toggleLike = (id, e) => {
    e.preventDefault();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col">


      {/* ═══ HERO ═══ */}
<div className="w-full px-4 sm:px-8 py-4">
  <section className="w-full py-16 sm:py-20 px-6 rounded-3xl text-center relative overflow-hidden" style={{ background: '#7DA68D' }}>
    
    {/* Decorative background icons (suptilne ikonice u pozadini) */}
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
        Od intimnih okupljanja do velikih korporativnih gala večera – pronađite sve što vam treba na jednom mjestu.      </p>

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
                className="w-full border-none outline-none text-xs sm:text-sm bg-transparent" 
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

      {/* ═══ BROWSE BY CATEGORY (BENTO GRID) ═══ */}
      <section className="w-full px-4 sm:px-8 py-6">
        <h2 className="text-xl font-extrabold mb-5" style={{ color: '#1F2937' }}>Browse by category</h2>

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

      {/* ═══ POPULAR NEAR YOU ═══ */}
      <section className="w-full py-8 px-4 sm:px-8 my-4" style={{ background: '#F9FAFB' }}>
        <h2 className="text-xl font-extrabold mb-1" style={{ color: '#1F2937' }}>Popular near you</h2>
        <p className="text-xs sm:text-sm mb-6" style={{ color: '#6B7280' }}>
          Highly rated services available in your area
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOP_PROVIDERS.map((p, i) => (
            <Link key={p.category + '-' + p.id} to={'/services/' + p.category + '/' + p.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow"
              style={{ border: '1px solid #F0F0F0', textDecoration: 'none' }}>

              <div className="relative flex items-center justify-center h-36 w-full" style={{ background: CARD_BG[i] }}>
                <span className="text-4xl opacity-30">{p.catIcon}</span>
                <button onClick={e => toggleLike(p.id, e)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm"
                  style={{ border: 'none', cursor: 'pointer' }}>
                  <Heart size={14}
                    fill={liked[p.id] ? '#A7A5D0' : 'none'}
                    stroke={liked[p.id] ? '#A7A5D0' : '#9CA3AF'} />
                </button>
              </div>

              <div className="flex flex-col gap-1 flex-1 p-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: '#F59E0B' }}>★</span>
                  <span className="text-xs font-semibold" style={{ color: '#374151' }}>{p.rating} (12 reviews)</span>
                </div>
                <h3 className="text-sm font-bold leading-snug" style={{ color: '#1F2937' }}>{p.name}</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>📍 {p.location}</p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded" style={{ color: '#8886B8', background: '#EEEDF9' }}>
                    {p.catLabel}
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#2B3132' }}>{p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full py-10 px-8 mt-auto" style={{ background: '#4A4E47' }}>
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>Meetiva</span>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Platforma za organizaciju nezaboravnih svadbi, proslava i poslovnih događaja.
            </p>
            <p className="text-[0.7rem] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2026 Meetiva</p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {title}
              </h4>
              {items.map(item => (
                <p key={item} className="mb-1.5">
                  <Link to="/" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    {item}
                  </Link>
                </p>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}