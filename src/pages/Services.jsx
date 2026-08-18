import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { categoryData } from '../utils/categoryData';

const CATEGORIES = [
  { slug: 'fotografi',  label: 'Fotografi i snimatelji', icon: '📷', count: 24, bg: 'from-emerald-50 to-teal-100/50' },
  { slug: 'glazba',      label: 'Bendovi & DJ-i',           icon: '🎸', count: 18, bg: 'from-purple-50 to-indigo-100/50' },
  { slug: 'susedne-sale',label: 'Sale i prostori',        icon: '🏛️', count: 32, bg: 'from-blue-50 to-slate-100/50' },
  { slug: 'catering',   label: 'Catering i hrana',       icon: '🍽️', count: 21, bg: 'from-amber-50 to-orange-100/50' },
  { slug: 'dekoracije', label: 'Dekoracije i cvijeće',   icon: '🌸', count: 19, bg: 'from-rose-50 to-pink-100/50' },
  { slug: 'voditelji',  label: 'Voditelji',               icon: '🎤', count: 11, bg: 'from-sky-50 to-cyan-100/50' },
  { slug: 'prijevoz',   label: 'Prijevoz',               icon: '🚗', count: 9,  bg: 'from-gray-50 to-slate-200/50' },
  { slug: 'torte',      label: 'Torte i slatkiši',       icon: '🎂', count: 14, bg: 'from-orange-50 to-amber-100/50' },
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
    catVal.providers.map(p => ({
      ...p,
      categoryKey: catKey,
      categoryLabel: catVal.label,
      img: p.img || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      tags: p.tags || ['Top Rated', 'Verified']
    }))
  );

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
    <div className="min-h-screen flex flex-col bg-[#F8F9F6]">

      {/* Header sa Search Barom */}
      <div className="bg-[#2D4A3E] py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isSearching ? 'Rezultati pretraživanja' : 'Sve kategorije usluga'}
          </h1>
          <p className="text-gray-300 text-sm mb-8">
            {isSearching 
              ? `Pronađeno ${filteredProviders.length} pružatelja usluga` 
              : 'Pronađi savršenog pružatelja usluge za tvoj događaj'}
          </p>

          {/* Tražilica (Search Bar) */}
          <form onSubmit={handleFilterSubmit} className="w-full">
            <div className="bg-white rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-xl flex flex-col md:flex-row items-stretch gap-2">

              {/* KATEGORIJA */}
              <div className="flex items-center gap-3 flex-1 px-4 py-2.5 md:border-r border-gray-100">
                <Search size={18} className="text-gray-400 shrink-0" />
                <div className="w-full">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Što tražiš?</p>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border-none outline-none text-sm font-semibold bg-transparent text-gray-800 cursor-pointer"
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
              <div className="flex items-center gap-3 flex-1 px-4 py-2.5 md:border-r border-gray-100">
                <MapPin size={18} className="text-gray-400 shrink-0" />
                <div className="w-full">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Gdje?</p>
                  <input 
                    type="text" 
                    value={where} 
                    onChange={e => setWhere(e.target.value)}
                    placeholder="Grad ili regija"
                    className="w-full border-none outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 bg-transparent" 
                  />
                </div>
              </div>

              {/* KADA */}
              <div className="flex items-center gap-3 flex-1 px-4 py-2.5">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <div className="w-full">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Kada?</p>
                  <input 
                    type="text" 
                    value={when} 
                    onChange={e => setWhen(e.target.value)}
                    placeholder="Datum događaja"
                    className="w-full border-none outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 bg-transparent" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="px-8 py-3.5 bg-[#2D4A3E] hover:bg-[#233A31] text-white font-bold text-sm rounded-xl md:rounded-2xl transition-all shadow-md shrink-0"
              >
                Pretraži
              </button>

            </div>
          </form>
        </div>
      </div>

      {/* Sadržaj stranice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full flex-1">
        {isSearching ? (
          <div>
            {/* Poništi filtere gumb */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setSearchParams({})} 
                className="flex items-center gap-2 text-sm font-bold text-[#2D4A3E] hover:underline"
              >
                <ArrowLeft size={16} /> Prikaži sve kategorije
              </button>
            </div>

            {/* Lista filtriranih pružatelja (Novi kartični stil) */}
            {filteredProviders.length > 0 ? (
              <div className="space-y-6">
                {filteredProviders.map(provider => (
                  <div 
                    key={provider.categoryKey + '-' + provider.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
                  >
                    {/* Lijevo: Slika */}
                    <div className="relative w-full md:w-64 h-48 md:h-52 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                      <img 
                        src={provider.img} 
                        alt={provider.name} 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {provider.categoryLabel}
                      </span>
                    </div>

                    {/* Desno: Detalji */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
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
                            <span className="text-gray-400 font-normal text-[0.7rem]">(12)</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-3 leading-relaxed">
                          {provider.desc || 'Profesionalne usluge prilagođene vašim željama i potrebama.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-50">
                        <div className="flex flex-wrap gap-2">
                          {provider.tags.map(tag => (
                            <span key={tag} className="text-[0.7rem] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <Link 
                          to={`/services/${provider.categoryKey}/${provider.id}`}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#2D4A3E] hover:bg-[#233A31] text-white text-xs font-bold rounded-xl text-center transition-colors shadow-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          Pogledaj detalje
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-lg font-bold text-gray-700">Nema pronađenih rezultata</p>
                <p className="text-sm text-gray-400 mt-1">Pokušajte promijeniti parametre pretrage ili lokaciju</p>
                <button 
                  onClick={() => setSearchParams({})} 
                  className="mt-5 px-6 py-2.5 bg-[#2D4A3E] text-white text-xs font-bold rounded-xl"
                >
                  Poništi pretragu
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Mreža svih kategorija (Grid) kad nema pretrage */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map(c => (
              <Link 
                key={c.slug} 
                to={'/services/' + c.slug}
                className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                style={{ textDecoration: 'none' }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.bg} flex items-center justify-center text-3xl mb-6 shadow-inner`}>
                  {c.icon}
                </div>

                <div>
                  <h2 className="font-bold text-lg text-gray-900 group-hover:text-[#2D4A3E] transition-colors">
                    {c.label}
                  </h2>
                  <p className="text-xs font-medium text-gray-400 mt-1">
                    {c.count} pružatelja usluga
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#2D4A3E]">
                  <span>Istraži kategoriju</span>
                  <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}