import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CATEGORIES = [
  { slug: 'fotografi',  label: 'Fotografi',       icon: '📷', count: 24, color: '#C8DAD0' },
  { slug: 'bendovi',    label: 'Bendovi',          icon: '🎸', count: 18, color: '#D4D2EC' },
  { slug: 'dj',         label: 'DJ-evi',           icon: '🎧', count: 15, color: '#BDD2C4' },
  { slug: 'sale',       label: 'Sale i prostori',  icon: '🏛️', count: 32, color: '#C5CEDE' },
  { slug: 'catering',   label: 'Catering',         icon: '🍽️', count: 21, color: '#D0C8D0' },
  { slug: 'dekoracije', label: 'Dekoracije',       icon: '🌸', count: 19, color: '#DAC8D0' },
  { slug: 'voditelji',  label: 'Voditelji',         icon: '🎤', count: 11, color: '#C8D2DA' },
  { slug: 'prijevoz',   label: 'Prijevoz',         icon: '🚗', count: 9,  color: '#D0DAC8' },
  { slug: 'torte',      label: 'Torte i slatkiši', icon: '🎂', count: 14, color: '#DACEC8' },
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div style={{ background: '#505A5B', padding: '36px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-1">Sve kategorije usluga</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
            Pronađi savršenog pružatelja usluge za tvoj događaj
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {CATEGORIES.map(c => (
            <Link key={c.slug} to={'/services/' + c.slug}
              className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              style={{ border: '1px solid #DDE3DE', textDecoration: 'none', background: 'white' }}>
              <div className="flex items-center justify-center" style={{ height: 110, background: c.color }}>
                <span style={{ fontSize: '3rem', opacity: 0.5 }}>{c.icon}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>{c.label}</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#8A9192' }}>{c.count} pružatelja usluga</p>
                </div>
                <span className="text-xl" style={{ color: '#A7A5D0' }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
