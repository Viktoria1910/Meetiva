import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { categoryData } from '../utils/categoryData';

const ALL_PROVIDERS = Object.entries(categoryData).flatMap(([cat, d]) =>
  d.providers.map(p => ({ ...p, category: cat, catLabel: d.label, catIcon: d.icon }))
);

export default function Search() {
  const [query, setQuery] = useState('');

  const results = query.trim().length < 2 ? [] : ALL_PROVIDERS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.location.toLowerCase().includes(query.toLowerCase()) ||
    p.catLabel.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <div style={{ background: '#7DA68D', padding: '36px 24px' }}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
          <h1 className="text-2xl font-extrabold text-white mb-4">Pretraži usluge</h1>
          <div className="flex items-center bg-white rounded-xl overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <div className="px-4 py-3">
              <SearchIcon size={16} style={{ color: '#8A9192' }} />
            </div>
            <input type="text" placeholder="Ime, lokacija ili kategorija..."
              value={query} onChange={e => setQuery(e.target.value)} autoFocus
              className="flex-1 py-3 pr-4 outline-none text-sm"
              style={{ color: '#2B3132', background: 'transparent' }} />
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-6 w-full">
        {query.trim().length >= 2 ? (
          results.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: '#8A9192' }}>{results.length} rezultata za "{query}"</p>
              {results.map(p => (
                <Link key={p.category + '-' + p.id} to={'/services/' + p.category + '/' + p.id}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  style={{ border: '1px solid #DDE3DE', textDecoration: 'none' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: '#E8F0EA' }}>{p.catIcon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: '#2B3132' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: '#8A9192' }}>📍 {p.location} · {p.catLabel}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                      style={{ background: '#7DA68D' }}>⭐ {p.rating}</span>
                    <span className="text-xs font-semibold" style={{ color: '#A7A5D0' }}>{p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16" style={{ color: '#8A9192' }}>
              <p className="text-lg font-semibold mb-1">Nema rezultata</p>
              <p className="text-sm">Pokušaj s drugačijim pojmom</p>
            </div>
          )
        ) : (
          <div className="text-center py-12" style={{ color: '#8A9192' }}>
            <SearchIcon size={40} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
            <p className="text-sm">Unesi barem 2 znaka za pretragu</p>
          </div>
        )}
      </div>
    </div>
  );
}
