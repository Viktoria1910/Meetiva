import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Star, MapPin, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { categoryData } from '../utils/categoryData';
import { getApprovedProviders } from '../utils/providerStorage';

const ITEMS_PER_PAGE = 6;

const SLUG_ALIAS_MAP = {
  'glazba': 'bendovi',
  'susedne-sale': 'sale',
  'fotografi-i-snimatelji': 'fotografi',
  'catering-i-hrana': 'catering',
  'dekoracije-i-cvijece': 'dekoracije'
};

const parsePrice = (str) => {
  if (!str) return 0;
  const m = str.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

const PRICE_RANGES = [
  { value: 'all',      label: 'Sve cijene' },
  { value: '0-500',    label: 'Do 500 €' },
  { value: '500-1000', label: '500 – 1000 €' },
  { value: '1000-2000',label: '1000 – 2000 €' },
  { value: '2000+',    label: 'Više od 2000 €' },
];

function matchesPrice(provider, range) {
  if (range === 'all') return true;
  const p = parsePrice(provider.price);
  if (range === '0-500')    return p < 500;
  if (range === '500-1000')  return p >= 500 && p < 1000;
  if (range === '1000-2000') return p >= 1000 && p < 2000;
  if (range === '2000+')    return p >= 2000;
  return true;
}

export default function CategoryPage() {
  const { category: rawCategory } = useParams();
  const [searchParams] = useSearchParams();

  const categoryKey = SLUG_ALIAS_MAP[rawCategory] || rawCategory;
  const data = categoryData[categoryKey];

  const initialWhere = searchParams.get('where') || '';

  const [minRating,   setMinRating]   = useState('all');
  const [priceRange,  setPriceRange]  = useState('all');
  const [sortBy,      setSortBy]      = useState('recommended');
  const [selectedLoc, setSelectedLoc] = useState(initialWhere);
  const [page,        setPage]        = useState(1);
  const [registeredProviders, setRegisteredProviders] = useState([]);

  useEffect(() => {
    if (!categoryKey) return;
    getApprovedProviders(categoryKey).then(list => {
      setRegisteredProviders(list.map(p => ({ 
        id: p.uid, 
        name: p.businessName, 
        location: p.location, 
        price: `Od ${p.basePrice} €`, 
        rating: 4.8, 
        desc: p.desc || 'Profesionalne usluge za vaš događaj.',
        img: p.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        tags: ['Verified', 'Popular']
      })));
    });
  }, [categoryKey]);

  if (!data) return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF8]">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Kategorija nije pronađena</h1>
        <p className="text-sm text-gray-500 mt-2">Kategorija "{rawCategory}" trenutno ne postoji.</p>
        <Link to="/services" className="mt-6 inline-block text-sm font-semibold text-[#2D4A3E] underline">
          ← Natrag na sve kategorije
        </Link>
      </div>
    </div>
  );

  const allProviders = useMemo(() => [
    ...(data.providers || []).map(p => ({
      ...p,
      img: p.img || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      tags: p.tags || ['Top Rated', 'Indoor/Outdoor']
    })), 
    ...registeredProviders
  ], [data, registeredProviders]);

  const locations = [...new Set(allProviders.map(p => p.location))].filter(Boolean).sort();

  const filtered = useMemo(() => {
    let list = [...allProviders];
    if (minRating !== 'all') list = list.filter(p => p.rating >= parseFloat(minRating));
    if (selectedLoc) list = list.filter(p => p.location.toLowerCase().includes(selectedLoc.toLowerCase()));
    list = list.filter(p => matchesPrice(p, priceRange));

    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name')  list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price') list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

    return list;
  }, [allProviders, minRating, priceRange, sortBy, selectedLoc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F6]">


      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── SIDEBAR FILTERS ── */}
          <aside className="w-full lg:w-64 shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
              <SlidersHorizontal size={18} />
              <span>Filter Results</span>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value={value}
                      checked={priceRange === value}
                      onChange={() => { setPriceRange(value); setPage(1); }}
                      className="w-4 h-4 accent-[#2D4A3E]" 
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            {/* Minimum Rating */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Rating</h3>
              <div className="space-y-2">
                {[
                  ['all', 'Any rating'],
                  ['4.8', '⭐ 4.8 & above'],
                  ['4.5', '⭐ 4.5 & above'],
                  ['4.0', '⭐ 4.0 & above']
                ].map(([val, lbl]) => (
                  <label key={val} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                    <input 
                      type="radio" 
                      name="minRating" 
                      value={val}
                      checked={minRating === val}
                      onChange={() => { setMinRating(val); setPage(1); }}
                      className="w-4 h-4 accent-[#2D4A3E]" 
                    />
                    <span>{lbl}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            {/* Location */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Location</h3>
              <select 
                value={selectedLoc} 
                onChange={e => { setSelectedLoc(e.target.value); setPage(1); }}
                className="w-full text-sm rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-200 outline-none text-gray-700"
              >
                <option value="">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <button 
              onClick={() => { setMinRating('all'); setPriceRange('all'); setSelectedLoc(''); setPage(1); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Clear all filters
            </button>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 w-full">
            
            {/* Header / Title */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {data.label}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filtered.length} professionals found in your area
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-gray-400 font-semibold uppercase">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm font-semibold bg-transparent border-none outline-none text-gray-800 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Providers List */}
            {paged.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-lg font-bold text-gray-700">No professionals found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or location</p>
              </div>
            ) : (
              <div className="space-y-6">
                {paged.map((provider) => (
                  <div 
                    key={provider.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
                  >
                    {/* Left: Image */}
                    <div className="relative w-full md:w-64 h-48 md:h-52 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                      <img 
                        src={provider.img} 
                        alt={provider.name} 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Top Rated
                      </span>
                    </div>

                    {/* Right: Info Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title & Rating */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-snug">
                              {provider.name}
                            </h2>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin size={13} className="text-gray-400" /> {provider.location} • <span className="font-semibold text-gray-700">{provider.price}</span>
                            </p>
                          </div>

                          {/* Green Rating Badge */}
                          <div className="bg-[#EBF5EF] text-[#2D4A3E] font-extrabold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                            <Star size={13} className="fill-[#2D4A3E] text-[#2D4A3E]" />
                            <span>{provider.rating || 4.9}</span>
                            <span className="text-gray-400 font-normal text-[0.7rem]">(12 reviews)</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-3 leading-relaxed">
                          {provider.desc}
                        </p>
                      </div>

                      {/* Bottom Tags & Button */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-50">
                        <div className="flex flex-wrap gap-2">
                          {provider.tags.map(tag => (
                            <span key={tag} className="text-[0.7rem] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <Link 
                          to={`/services/${categoryKey}/${provider.id}`}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#2D4A3E] hover:bg-[#233A31] text-white text-xs font-bold rounded-xl text-center transition-colors shadow-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          View availability
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                      n === safePage 
                        ? 'bg-[#2D4A3E] text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}