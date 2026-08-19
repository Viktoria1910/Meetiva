import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  ArrowLeft,
  Camera,
  Music,
  Building2,
  Utensils,
  Flower2,
  Mic2,
  Car,
  Cake,
  ChevronRight
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { categoryData } from '../utils/categoryData';

const CATEGORIES = [
  { slug: 'fotografi',  label: 'Fotografi i snimatelji', Icon: Camera },
  { slug: 'bendovi',    label: 'Bendovi & DJ-i',         Icon: Music },
  { slug: 'sale',       label: 'Sale i prostori',        Icon: Building2 },
  { slug: 'catering',   label: 'Catering i hrana',       Icon: Utensils },
  { slug: 'dekoracije', label: 'Dekoracije i cvijeće',   Icon: Flower2 },
  { slug: 'voditelji',  label: 'Voditelji',              Icon: Mic2 },
  { slug: 'prijevoz',   label: 'Prijevoz',               Icon: Car },
  { slug: 'torte',      label: 'Torte i slatkiši',       Icon: Cake },
];

const cleanText = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/-/g, ' ').replace(/\s+/g, ' ');
};

const isCategoryMatch = (dbCategory, slug) => {
  const c1 = cleanText(dbCategory);
  const c2 = cleanText(slug);

  if (!c1 || !c2) return false;
  if (c1 === c2) return true;

  const saleAliases = ['sale', 'prostori i sale za proslave', 'sale za vjencanja', 'sale za vjenčanja', 'sale i prostori', 'prostor'];
  if (saleAliases.some(a => c1.includes(a)) && saleAliases.some(a => c2.includes(a))) return true;

  const photoAliases = ['fotografi', 'fotografi i snimatelji', 'fotografija', 'fotograf', 'snimatelji'];
  if (photoAliases.some(a => c1.includes(a)) && photoAliases.some(a => c2.includes(a))) return true;

  const musicAliases = ['bendovi', 'bendovi & dj-i', 'glazba', 'dj', 'bend'];
  if (musicAliases.some(a => c1.includes(a)) && musicAliases.some(a => c2.includes(a))) return true;

  return c1.includes(c2) || c2.includes(c1);
};

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || '';
  const whereParam = searchParams.get('where') || '';
  const whenParam = searchParams.get('when') || '';

  const [category, setCategory] = useState(categoryParam);
  const [where, setWhere] = useState(whereParam);
  const [when, setWhen] = useState(whenParam);

  const [dbProviders, setDbProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategory(categoryParam);
    setWhere(whereParam);
    setWhen(whenParam);
  }, [categoryParam, whereParam, whenParam]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'providers'));
        const list = [];

        querySnapshot.forEach((docSnap) => {
          const p = docSnap.data();
          const cat = p.category || p.categoryName || p.kategorija || p.type || '';

          list.push({
            id: docSnap.id,
            name: p.businessName || p.providerName || p.name || 'Pružatelj usluga',
            category: cat,
            location: p.location || p.city || 'Hrvatska',
            price: p.basePrice ? `Od ${p.basePrice} €` : (p.price ? `Od ${p.price} €` : 'Na upit'),
            rating: p.rating || 5.0,
            desc: p.desc || p.description || 'Profesionalne usluge.',
            img: p.image || p.img || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'
          });
        });

        setDbProviders(list);
      } catch (err) {
        console.error("Greška pri dohvaćanju 'providers':", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const allProviders = useMemo(() => {
    const staticList = Object.entries(categoryData).flatMap(([catKey, catVal]) =>
      (catVal.providers || []).map(p => ({
        ...p,
        categoryKey: catKey,
        categoryLabel: catVal.label,
        img: p.img || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'
      }))
    );

    const firebaseList = dbProviders.map(p => {
      const matchedCat = CATEGORIES.find(c => isCategoryMatch(p.category, c.slug));
      return {
        ...p,
        categoryKey: matchedCat ? matchedCat.slug : p.category,
        categoryLabel: matchedCat ? matchedCat.label : p.category
      };
    });

    return [...staticList, ...firebaseList];
  }, [dbProviders]);

  const getCategoryCount = (slug) => {
    return allProviders.filter(p => isCategoryMatch(p.categoryKey, slug) || isCategoryMatch(p.category, slug)).length;
  };

  const isSearching = Boolean(categoryParam || whereParam || whenParam);

  const filteredProviders = useMemo(() => {
    return allProviders.filter(provider => {
      const matchesCategory = categoryParam 
        ? (isCategoryMatch(provider.categoryKey, categoryParam) || isCategoryMatch(provider.category, categoryParam))
        : true;

      const matchesWhere = whereParam 
        ? provider.location.toLowerCase().includes(whereParam.toLowerCase()) 
        : true;

      return matchesCategory && matchesWhere;
    });
  }, [allProviders, categoryParam, whereParam]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (category) params.category = category;
    if (where) params.where = where;
    if (when) params.when = when;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7]">

      {/* Header sa Search Barom */}
      <div className="bg-[#537362] py-10 px-4 sm:px-8 border-b border-[#435E4F]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            {isSearching ? 'Rezultati pretraživanja' : 'Sve kategorije usluga'}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mb-6">
            {isSearching 
              ? `Pronađeno ${filteredProviders.length} pružatelja usluga` 
              : 'Pronađi savršenog pružatelja usluge za tvoj događaj'}
          </p>

          <form onSubmit={handleFilterSubmit} className="w-full">
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg flex flex-col md:flex-row items-stretch gap-2 border border-[#E5E9E6]">

              <div className="flex items-center gap-2.5 flex-1 px-3 py-2 md:border-r border-gray-100">
                <Search size={18} className="text-[#6B8E7B] shrink-0" />
                <div className="w-full">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gray-400">Kategorija</p>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border-none outline-none text-xs font-semibold bg-transparent text-gray-800 cursor-pointer"
                  >
                    <option value="">Sve kategorije</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-1 px-3 py-2 md:border-r border-gray-100">
                <MapPin size={18} className="text-[#6B8E7B] shrink-0" />
                <div className="w-full">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gray-400">Lokacija</p>
                  <input 
                    type="text" 
                    value={where} 
                    onChange={e => setWhere(e.target.value)}
                    placeholder="Grad ili regija"
                    className="w-full border-none outline-none text-xs font-semibold text-gray-800 placeholder-gray-400 bg-transparent" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                <Calendar size={18} className="text-[#6B8E7B] shrink-0" />
                <div className="w-full">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gray-400">Datum</p>
                  <input 
                    type="text" 
                    value={when} 
                    onChange={e => setWhen(e.target.value)}
                    placeholder="Datum događaja"
                    className="w-full border-none outline-none text-xs font-semibold text-gray-800 placeholder-gray-400 bg-transparent" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="px-6 py-3 bg-[#6B8E7B] hover:bg-[#537362] text-white font-semibold text-xs rounded-xl transition-colors shadow-sm shrink-0"
              >
                Pretraži
              </button>

            </div>
          </form>
        </div>
      </div>

      {/* Sadržaj stranice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E9E6]">
            <p className="text-sm font-semibold text-gray-500">Učitavanje kategorija...</p>
          </div>
        ) : isSearching ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setSearchParams({})} 
                className="flex items-center gap-2 text-xs font-semibold text-[#8880B6] hover:text-[#6E669E] transition-colors"
              >
                <ArrowLeft size={15} /> Prikaži sve kategorije
              </button>
            </div>

            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProviders.map(provider => (
                  <div 
                    key={provider.id}
                    className="bg-white rounded-2xl border border-[#E5E9E6] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 mb-4">
                        <img 
                          src={provider.img} 
                          alt={provider.name} 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-[#8px] left-[#8px] bg-[#537362]/90 backdrop-blur-md text-white text-[0.65rem] font-semibold px-2.5 py-1 rounded-md tracking-wide">
                          {provider.categoryLabel}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h2 className="text-lg font-bold text-gray-800 leading-snug">
                            {provider.name}
                          </h2>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={13} className="text-[#6B8E7B]" /> {provider.location}
                          </p>
                        </div>

                        <div className="bg-[#F3F2F9] text-[#8880B6] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                          <Star size={12} className="fill-[#8880B6] text-[#8880B6]" />
                          <span>{provider.rating || 5.0}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {provider.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {provider.price}
                      </span>

                      <Link 
                        to={`/services/${provider.categoryKey}/${provider.id}`}
                        className="px-4 py-2 bg-[#9F98C7] hover:bg-[#8880B6] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        Pogledaj detalje <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E9E6]">
                <p className="text-base font-semibold text-gray-700">Nema pronađenih rezultata</p>
                <p className="text-xs text-gray-400 mt-1">Pokušajte promijeniti parametre pretrage</p>
                <button 
                  onClick={() => setSearchParams({})} 
                  className="mt-4 px-5 py-2 bg-[#9F98C7] hover:bg-[#8880B6] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Poništi pretragu
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(({ slug, label, Icon }) => {
              const count = getCategoryCount(slug);
              return (
                <Link 
                  key={slug} 
                  to={'/services/' + slug}
                  className="group bg-white rounded-2xl p-5 border border-[#E5E9E6] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
                  style={{ textDecoration: 'none' }}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#F0F4F1] flex items-center justify-center text-[#537362] mb-4 group-hover:bg-[#6B8E7B] group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </div>

                    <h2 className="font-bold text-base text-gray-800 group-hover:text-[#537362] transition-colors">
                      {label}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {count === 0 ? 'Nema pružatelja' : `${count} ${count === 1 ? 'pružatelj' : 'pružatelja'}`}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#8880B6]">
                    <span>Istraži</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}