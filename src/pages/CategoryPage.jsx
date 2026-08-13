import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { categoryData } from '../utils/categoryData';

const ITEMS_PER_PAGE = 8;

function ratingLabel(r) {
  if (r >= 4.9) return 'Izvrsno';
  if (r >= 4.7) return 'Odlično';
  if (r >= 4.5) return 'Vrlo dobro';
  return 'Dobro';
}

export default function CategoryPage() {
  const { category } = useParams();
  const data = categoryData[category];

  const [minRating, setMinRating] = useState('all');
  const [sortBy,    setSortBy]    = useState('rating');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [page, setPage] = useState(1);

  if (!data) return (
    <div className="min-h-screen" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#2B3132' }}>Kategorija nije pronađena</h1>
        <Link to="/services" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A7A5D0' }}>← Natrag na kategorije</Link>
      </div>
    </div>
  );

  const locations = [...new Set(data.providers.map(p => p.location))].sort();

  const filtered = useMemo(() => {
    let list = [...data.providers];
    if (minRating !== 'all') list = list.filter(p => p.rating >= parseFloat(minRating));
    if (selectedLoc) list = list.filter(p => p.location === selectedLoc);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [data, minRating, sortBy, selectedLoc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const resetFilters = () => { setMinRating('all'); setSortBy('rating'); setSelectedLoc(''); setPage(1); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#A7A5D0', padding: '32px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Početna</Link>
            {' '}&rsaquo;{' '}
            <Link to="/services" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Kategorije</Link>
            {' '}&rsaquo;{' '}{data.label}
          </p>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2rem' }}>{data.icon}</span>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{data.label}</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{filtered.length} pružatelja usluga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body: sidebar + results */}
      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="flex-shrink-0 rounded-2xl p-5 flex flex-col gap-5"
          style={{ width: 220, background: 'white', border: '1px solid #DDE3DE', position: 'sticky', top: 76 }}>
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: '#2B3132' }}>Minimalna ocjena</h3>
            {[['all','Sve ocjene'],['4','4.0 +'],['4.5','4.5 +'],['4.8','4.8 +']].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="radio" name="minRating" value={val}
                  checked={minRating === val} onChange={() => { setMinRating(val); setPage(1); }}
                  style={{ accentColor: '#A7A5D0' }} />
                <span className="text-sm" style={{ color: '#505A5B' }}>{lbl}</span>
              </label>
            ))}
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2" style={{ color: '#2B3132' }}>Lokacija</h3>
            <select value={selectedLoc} onChange={e => { setSelectedLoc(e.target.value); setPage(1); }}
              className="w-full text-sm rounded-lg px-3 py-2 outline-none"
              style={{ border: '1px solid #DDE3DE', color: '#505A5B', background: 'white' }}>
              <option value="">Sve lokacije</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2" style={{ color: '#2B3132' }}>Sortiraj po</h3>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="w-full text-sm rounded-lg px-3 py-2 outline-none"
              style={{ border: '1px solid #DDE3DE', color: '#505A5B', background: 'white' }}>
              <option value="rating">Ocjeni</option>
              <option value="name">Imenu</option>
            </select>
          </div>

          <button onClick={resetFilters}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
            style={{ background: '#EEEDF9', color: '#8886B8', border: '1px solid #D4D2EC' }}
            onMouseEnter={e => e.currentTarget.style.background = '#D4D2EC'}
            onMouseLeave={e => e.currentTarget.style.background = '#EEEDF9'}>
            Poništi filtere
          </button>
        </aside>

        {/* Results */}
        <div className="flex-1 flex flex-col gap-4">
          {paged.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#8A9192' }}>
              <p className="text-lg font-semibold">Nema rezultata</p>
              <p className="text-sm mt-1">Pokušaj s drugačijim filterima</p>
            </div>
          ) : paged.map(provider => (
            <Link key={provider.id} to={'/services/' + category + '/' + provider.id}
              className="flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              style={{ border: '1px solid #DDE3DE', textDecoration: 'none' }}>
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 140, background: 'linear-gradient(135deg,#C8DAD0,#E8F0EA)' }}>
                <span style={{ fontSize: '2.4rem', opacity: 0.35 }}>{data.icon}</span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>{provider.name}</h2>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
                    style={{ background: '#7DA68D' }}>
                    ⭐ {provider.rating} &nbsp;{ratingLabel(provider.rating)}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#505A5B' }}>{provider.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm" style={{ color: '#8A9192' }}>📍 {provider.location}</span>
                  <span className="text-sm font-bold" style={{ color: '#A7A5D0' }}>{provider.price}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-9 h-9 rounded-full text-sm font-semibold transition-all duration-150"
                  style={{
                    background: n === safePage ? '#A7A5D0' : 'white',
                    color:      n === safePage ? 'white' : '#505A5B',
                    border: '1px solid ' + (n === safePage ? '#A7A5D0' : '#DDE3DE'),
                  }}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
