import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Star, MapPin, SlidersHorizontal, Search, RotateCcw, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { categoryData } from '../utils/categoryData';

const ITEMS_PER_PAGE = 6;

// Konsolidirana paleta boja za dosljednost u aplikaciji
const COLORS = {
  bg: '#F4F5F2',
  cardBg: '#FFFFFF',
  subtleBg: '#FAFBF9',
  accentBg: '#E8F0EA',
  highlightBg: '#F2F1FA',
  primary: '#7DA68D',
  primaryHover: '#628971',
  secondary: '#A7A5D0',
  secondaryHover: '#8B89B8',
  textDark: '#2B3132',
  textMuted: '#505A5B',
  textLight: '#8A9192',
  border: '#DDE3DE',
};

// Pomoćna funkcija za normiranje teksta
const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
};

// Provjera podudara li se kategorija iz baze s onom u URL-u
const isCategoryMatch = (dbCategory, urlCategory) => {
  const c1 = cleanText(dbCategory);
  const c2 = cleanText(urlCategory);

  if (c1 === c2) return true;

  const saleAliases = ['sale', 'prostori i sale za proslave', 'sale za vjencanja', 'sale za vjenčanja'];
  const isC1Sale = saleAliases.some(alias => c1.includes(alias));
  const isC2Sale = saleAliases.some(alias => c2.includes(alias));

  return isC1Sale && isC2Sale;
};

const parsePrice = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = String(val).replace(/\s/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const PRICE_RANGES = [
  { value: 'all',       label: 'Sve cijene' },
  { value: '0-500',     label: 'Do 500 €' },
  { value: '500-1000', label: '500 – 1000 €' },
  { value: '1000-2000', label: '1000 – 2000 €' },
  { value: '2000+',     label: 'Više od 2000 €' },
];

function matchesPrice(provider, range) {
  if (range === 'all') return true;
  const p = parsePrice(provider.priceNumeric ?? provider.price);
  if (range === '0-500')    return p < 500;
  if (range === '500-1000')  return p >= 500 && p < 1000;
  if (range === '1000-2000') return p >= 1000 && p < 2000;
  if (range === '2000+')    return p >= 2000;
  return true;
}

export default function CategoryPage() {
  const { category: rawCategory } = useParams();
  const [searchParams] = useSearchParams();

  const dataKey = useMemo(() => {
    if (!categoryData) return null;
    const directKey = Object.keys(categoryData).find(key => isCategoryMatch(key, rawCategory));
    return directKey || rawCategory;
  }, [rawCategory]);

  const data = categoryData[dataKey] || categoryData[rawCategory] || {
    label: rawCategory ? rawCategory.replace(/-/g, ' ') : 'Kategorija',
    providers: []
  };

  const initialWhere = searchParams.get('where') || '';

  const [minRating, setMinRating]       = useState('all');
  const [priceRange, setPriceRange]     = useState('all');
  const [sortBy, setSortBy]             = useState('recommended');
  const [searchLoc, setSearchLoc]       = useState(initialWhere);
  const [page, setPage]                 = useState(1);
  const [registeredProviders, setRegisteredProviders] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProvidersFromFirestore = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'providers'));
        const list = [];

        querySnapshot.forEach((docSnap) => {
          const p = docSnap.data();
          const docId = docSnap.id;

          const pCategory = p.category || p.categoryName || '';
          const status = String(p.status || p.providerStatus || '').toLowerCase().trim();

          const isMatch = isCategoryMatch(pCategory, rawCategory);
          const isApproved = status === 'approved' || status === 'active' || status === '';

          if (isMatch && isApproved) {
            const rawPrice = p.basePrice || p.price || 0;
            
            const countFromField = p.reviewsCount ?? p.ratingCount ?? p.reviewCount;
            const countFromArray = Array.isArray(p.reviews) ? p.reviews.length : 0;
            const finalReviewsCount = countFromField !== undefined ? Number(countFromField) : countFromArray;

            list.push({
              id: docId,
              name: p.businessName || p.providerName || p.name || 'Pružatelj usluga',
              location: p.location || p.city || 'Hrvatska',
              priceNumeric: parsePrice(rawPrice),
              price: rawPrice ? `Od ${rawPrice} €` : 'Na upit',
              rating: p.rating || 4.8,
              reviewsCount: finalReviewsCount,
              desc: p.desc || p.description || 'Profesionalne usluge za vaš događaj.',
              img: p.image || p.img || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
              tags: p.tags || ['Provjereno', 'Novo']
            });
          }
        });

        setRegisteredProviders(list);
      } catch (err) {
        console.error("Greška pri dohvaćanju pružatelja iz kolekcije 'providers':", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvidersFromFirestore();
  }, [rawCategory]);

  const allProviders = useMemo(() => [
    ...(data.providers || []).map(p => ({
      ...p,
      priceNumeric: parsePrice(p.price),
      reviewsCount: p.reviewsCount ?? (Array.isArray(p.reviews) ? p.reviews.length : 0),
      img: p.img || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      tags: p.tags || ['Preporučeno', 'Popularno']
    })), 
    ...registeredProviders
  ], [data, registeredProviders]);

  const filtered = useMemo(() => {
    let list = [...allProviders];

    if (minRating !== 'all') {
      list = list.filter(p => (p.rating || 0) >= parseFloat(minRating));
    }

    if (searchLoc.trim()) {
      const query = cleanText(searchLoc);
      list = list.filter(p => cleanText(p.location).includes(query));
    }

    list = list.filter(p => matchesPrice(p, priceRange));

    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'hr'));
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.priceNumeric || 0) - (b.priceNumeric || 0));
    }

    return list;
  }, [allProviders, minRating, priceRange, sortBy, searchLoc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setMinRating('all');
    setPriceRange('all');
    setSearchLoc('');
    setSortBy('recommended');
    setPage(1);
  };

  const hasActiveFilters = minRating !== 'all' || priceRange !== 'all' || searchLoc !== '';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLORS.bg }}>
      {/* GLAVNI OMOTAČ ŠIROM CIJELOG EKRANA */}
      <div className="w-full px-4 sm:px-8 xl:px-12 py-8 flex-1">
        
        {/* MOBILNA TIPKA ZA FILTARE */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold shadow-sm"
            style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, color: COLORS.textDark }}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} style={{ color: COLORS.primary }} />
              <span>Filtriraj rezultate</span>
              {hasActiveFilters && (
                <span className="text-white text-xs px-2 py-0.5 rounded-full" style={{ background: COLORS.primary }}>
                  Aktivno
                </span>
              )}
            </div>
            <span>{mobileFilterOpen ? 'Zatvori ▲' : 'Otvori ▼'}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative">

          {/* SIDEBAR FILTERS */}
          <aside className={`
            w-full lg:w-80 shrink-0 p-6 rounded-2xl shadow-sm
            ${mobileFilterOpen ? 'block' : 'hidden lg:block'}
            lg:sticky lg:top-24 z-10 max-h-[calc(100vh-7rem)] overflow-y-auto
          `} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-lg" style={{ color: COLORS.textDark }}>
                <SlidersHorizontal size={18} style={{ color: COLORS.primary }} />
                <span>Filteri</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs hover:underline flex items-center gap-1 font-medium bg-transparent border-none cursor-pointer"
                  style={{ color: COLORS.secondary }}
                >
                  <RotateCcw size={12} /> Poništi
                </button>
              )}
            </div>

            {/* Unos Lokacije */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.textLight }}>
                Lokacija / Grad
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Npr. Zagreb, Split..."
                  value={searchLoc}
                  onChange={(e) => { setSearchLoc(e.target.value); setPage(1); }}
                  className="w-full text-sm rounded-xl pl-9 pr-8 py-2.5 outline-none transition-all"
                  style={{ 
                    background: COLORS.subtleBg, 
                    border: `1px solid ${COLORS.border}`, 
                    color: COLORS.textDark 
                  }}
                />
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.primary }} />
                {searchLoc && (
                  <button 
                    onClick={() => { setSearchLoc(''); setPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                    style={{ color: COLORS.textLight }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <hr className="my-5" style={{ borderColor: COLORS.border }} />

            {/* Cjenovni Rang */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.textLight }}>
                Raspon cijena
              </h3>
              <div className="space-y-2">
                {PRICE_RANGES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2.5 text-sm cursor-pointer transition-colors" style={{ color: COLORS.textMuted }}>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value={value}
                      checked={priceRange === value}
                      onChange={() => { setPriceRange(value); setPage(1); }}
                      className="w-4 h-4"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-5" style={{ borderColor: COLORS.border }} />

            {/* Ocjena */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.textLight }}>
                Minimalna ocjena
              </h3>
              <div className="space-y-2">
                {[
                  ['all', 'Sve ocjene'],
                  ['4.8', '⭐ 4.8 i više'],
                  ['4.5', '⭐ 4.5 i više'],
                  ['4.0', '⭐ 4.0 i više']
                ].map(([val, lbl]) => (
                  <label key={val} className="flex items-center gap-2.5 text-sm cursor-pointer transition-colors" style={{ color: COLORS.textMuted }}>
                    <input 
                      type="radio" 
                      name="minRating" 
                      value={val}
                      checked={minRating === val}
                      onChange={() => { setMinRating(val); setPage(1); }}
                      className="w-4 h-4"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <span>{lbl}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={resetFilters}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border-none cursor-pointer"
              style={{ background: COLORS.highlightBg, color: COLORS.secondaryHover }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.accentBg}
              onMouseLeave={e => e.currentTarget.style.background = COLORS.highlightBg}
            >
              <RotateCcw size={14} /> Poništi sve filtere
            </button>
          </aside>

          {/* GLAVNI SADRŽAJ ŠIROM EKRANA */}
          <main className="flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight capitalize" style={{ color: COLORS.textDark }}>
                  {data.label || rawCategory}
                </h1>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Pronađeno <strong style={{ color: COLORS.primary }}>{filtered.length}</strong> pružatelja usluga u ovoj kategoriji
                </p>
              </div>

              {/* Razvrstavanje */}
              <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl shadow-sm" style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <span className="text-xs font-semibold uppercase shrink-0" style={{ color: COLORS.textLight }}>Poredaj:</span>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm font-semibold bg-transparent border-none outline-none cursor-pointer pr-2"
                  style={{ color: COLORS.textDark }}
                >
                  <option value="recommended">Preporučeno</option>
                  <option value="rating">Najbolje ocjenjeno</option>
                  <option value="price">Cijena: od najniže</option>
                  <option value="name">Naziv (A-Ž)</option>
                </select>
              </div>
            </div>

            {/* POPIS PRUŽATELJA */}
            {loading ? (
              <div className="text-center py-20 rounded-3xl shadow-sm" style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-r-transparent align-[-0.125em] mb-4" style={{ borderColor: COLORS.primary, borderRightColor: 'transparent' }}></div>
                <p className="text-sm font-semibold" style={{ color: COLORS.textMuted }}>Učitavanje pružatelja usluga...</p>
              </div>
            ) : paged.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl shadow-sm" style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <Search className="mx-auto mb-3" size={48} style={{ color: COLORS.textLight }} />
                <p className="text-lg font-bold" style={{ color: COLORS.textDark }}>Niti jedan pružatelj ne odgovara filterima</p>
                <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: COLORS.textMuted }}>
                  Pokušajte promijeniti ili poništiti unesene filtere za lokaciju, cijenu ili ocjenu.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 text-white font-semibold text-xs rounded-xl transition-colors border-none cursor-pointer"
                  style={{ background: COLORS.primary }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.primaryHover}
                  onMouseLeave={e => e.currentTarget.style.background = COLORS.primary}
                >
                  Prikaži sve pružatelje
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {paged.map((provider) => (
                  <div 
                    key={provider.id}
                    className="rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 w-full"
                    style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
                  >
                    {/* Slika */}
                    <div className="relative w-full md:w-72 h-52 sm:h-56 shrink-0 rounded-2xl overflow-hidden" style={{ background: COLORS.subtleBg }}>
                      <img 
                        src={provider.img} 
                        alt={provider.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 text-white text-[0.65rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md" style={{ background: 'rgba(167, 165, 208, 0.9)' }}>
                        Preporučeno
                      </span>
                    </div>

                    {/* Informacije */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Naslov i Ocjena */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold leading-snug" style={{ color: COLORS.textDark }}>
                              {provider.name}
                            </h2>
                            <p className="text-xs sm:text-sm flex items-center gap-2 mt-1.5" style={{ color: COLORS.textMuted }}>
                              <span className="flex items-center gap-1 font-medium" style={{ color: COLORS.textMuted }}>
                                <MapPin size={15} style={{ color: COLORS.primary }} /> {provider.location}
                              </span> 
                              • 
                              <span className="font-semibold px-2.5 py-0.5 rounded-md" style={{ color: COLORS.secondaryHover, background: COLORS.highlightBg }}>
                                {provider.price}
                              </span>
                            </p>
                          </div>

                          {/* Ocjena */}
                          <div className="font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0" style={{ background: COLORS.accentBg, color: COLORS.textDark, border: `1px solid ${COLORS.border}` }}>
                            <Star size={14} fill={COLORS.primary} style={{ color: COLORS.primary }} />
                            <span>{provider.rating || 4.8}</span>
                            <span className="font-normal text-[0.7rem]" style={{ color: COLORS.textLight }}>
                              ({provider.reviewsCount ?? 0})
                            </span>
                          </div>
                        </div>

                        {/* Potpuni opis */}
                        <p className="text-[12px] sm:text-[13px] mt-3 leading-relaxed" style={{ color: COLORS.textMuted }}>
                          {provider.desc}
                        </p>
                      </div>

                      {/* Tagovi i Gumb */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4" style={{ borderTop: `1px solid ${COLORS.subtleBg}` }}>
                        <div className="flex flex-wrap gap-1.5">
                          {provider.tags.map(tag => (
                            <span key={tag} className="text-[0.7rem] font-semibold px-3 py-1 rounded-lg" style={{ background: COLORS.highlightBg, color: COLORS.secondaryHover }}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        <Link 
                          to={`/services/${rawCategory}/${provider.id}`}
                          className="w-full sm:w-auto px-6 py-2.5 text-white text-xs font-bold rounded-xl text-center transition-colors shadow-sm"
                          style={{ background: COLORS.primary, textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = COLORS.primaryHover}
                          onMouseLeave={e => e.currentTarget.style.background = COLORS.primary}
                        >
                          Pogledaj dostupnost
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginacija */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-9 h-9 rounded-full text-xs font-bold transition-all border-none cursor-pointer"
                    style={{
                      background: n === safePage ? COLORS.primary : COLORS.cardBg,
                      color: n === safePage ? '#FFFFFF' : COLORS.textMuted,
                      border: n === safePage ? 'none' : `1px solid ${COLORS.border}`
                    }}
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