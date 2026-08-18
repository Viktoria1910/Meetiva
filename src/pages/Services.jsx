import React, { useState, useEffect } from 'react';
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
import { categoryData } from '../utils/categoryData';

const CATEGORIES = [
  { slug: 'fotografi',   label: 'Fotografi i snimatelji', Icon: Camera },
  { slug: 'glazba',      label: 'Bendovi & DJ-i',         Icon: Music },
  { slug: 'susedne-sale',label: 'Sale i prostori',        Icon: Building2 },
  { slug: 'catering',    label: 'Catering i hrana',       Icon: Utensils },
  { slug: 'dekoracije',  label: 'Dekoracije i cvijeće',   Icon: Flower2 },
  { slug: 'voditelji',   label: 'Voditelji',              Icon: Mic2 },
  { slug: 'prijevoz',    label: 'Prijevoz',               Icon: Car },
  { slug: 'torte',       label: 'Torte i slatkiši',       Icon: Cake },
];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Očitavanje parametara iz URL-a
  const categoryParam = searchParams.get('category') || '';
  const whereParam = searchParams.get('where') || '';
  const whenParam = searchParams.get('when') || '';

  // Lokalno stanje
  const [category, setCategory] = useState(categoryParam);
  const [where, setWhere] = useState(whereParam);
  const [when, setWhen] = useState(whenParam);

  useEffect(() => {
    setCategory(categoryParam);
    setWhere(whereParam);
    setWhen(whenParam);
  }, [categoryParam, whereParam, whenParam]);

  // Prikupljanje SVIH pružatelja iz categoryData
  const allProviders = Object.entries(categoryData).flatMap(([catKey, catVal]) =>
    (catVal.providers || []).map(p => ({
      ...p,
      categoryKey: catKey,
      categoryLabel: catVal.label,
      img: p.img || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      tags: p.tags || []
    }))
  );

  // Funkcija za dinamičko dohvaćanje broja pružatelja po kategoriji
  const getCategoryCount = (slug) => {
    return categoryData[slug]?.providers?.length || 0;
  };

  const isSearching = categoryParam || whereParam || whenParam;

  const filteredProviders = allProviders.filter(provider => {
    const matchesCategory = categoryParam 
      ? provider.categoryKey.toLowerCase() === categoryParam.toLowerCase() 
      : true;

    const matchesWhere = whereParam 
      ? provider.location.toLowerCase().includes(whereParam.toLowerCase()) 
      : true;

    return matchesCategory && matchesWhere;
  });

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

          {/* Tražilica */}
          <form onSubmit={handleFilterSubmit} className="w-full">
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg flex flex-col md:flex-row items-stretch gap-2 border border-[#E5E9E6]">

              {/* KATEGORIJA */}
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
                    <option value="sale">Sale i prostori</option>
                    <option value="fotografi">Fotografi i snimatelji</option>
                    <option value="bendovi">Bendovi & DJ-i</option>
                    <option value="catering">Catering i hrana</option>
                    <option value="dekoracije">Dekoracije i cvijeće</option>
                  </select>
                </div>
              </div>

              {/* GDJE */}
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

              {/* KADA */}
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
        {isSearching ? (
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
                    key={provider.categoryKey + '-' + provider.id}
                    className="bg-white rounded-2xl border border-[#E5E9E6] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 mb-4">
                        <img 
                          src={provider.img} 
                          alt={provider.name} 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-[#537362]/90 backdrop-blur-md text-white text-[0.65rem] font-semibold px-2.5 py-1 rounded-md tracking-wide">
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
                        {provider.price || 'Na upit'}
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
          /* Mreža kategorija s dinamičkim brojem pružatelja */
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