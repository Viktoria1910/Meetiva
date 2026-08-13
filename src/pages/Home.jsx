import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { categoryData } from '../utils/categoryData';

const CATEGORY_CARDS = [
  { slug: 'sale',      label: 'Wedding Halls',  icon: '🏛️', bg: 'linear-gradient(160deg,#7DA68D 0%,#505A5B 100%)' },
  { slug: 'bendovi',   label: 'Bands & DJs',    icon: '🎸', bg: 'linear-gradient(160deg,#A7A5D0 0%,#505A5B 100%)' },
  { slug: 'fotografi', label: 'Photographers',  icon: 'đź“·', bg: 'linear-gradient(160deg,#505A5B 0%,#2B3132 100%)' },
  { slug: 'catering',  label: 'Catering',       icon: 'đźŤ˝ď¸Ź', bg: 'linear-gradient(160deg,#7DA68D 0%,#A7A5D0 100%)' },
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
  Legal:   ['Terms', 'Privacy', 'Cookies'],
  Support: ['Help Center', 'Contact Us', 'FAQ'],
};

export default function Home() {
  const navigate = useNavigate();
  const [what,  setWhat]  = useState('');
  const [where, setWhere] = useState('');
  const [when,  setWhen]  = useState('');
  const [liked, setLiked] = useState({});

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/services');
  };

  const toggleLike = (id, e) => {
    e.preventDefault();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* â”€â”€ shared input-group style â”€â”€ */
  const fieldWrap = (borderRight) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 10px',
    borderRight: borderRight ? '1px solid #F0F0F0' : 'none',
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />

      {/* â•â•â• HERO â•â•â• */}
      <section style={{ background: '#7DA68D', padding: '72px 24px 88px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.25rem', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
            Plan your perfect event
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', maxWidth: 520, margin: '0 auto 44px' }}>
            From intimate gatherings to massive corporate galas. Find everything you need in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div style={{ background: 'white', borderRadius: 16, display: 'flex', alignItems: 'stretch', maxWidth: 920, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

              {/* WHAT */}
              <div style={fieldWrap(true)}>
                <Search size={15} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                    What are you planning?
                  </p>
                  <input
                    type="text"
                    value={what}
                    onChange={e => setWhat(e.target.value)}
                    placeholder="Wedding, Corporate..."
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#2B3132', background: 'transparent' }}
                  />
                </div>
              </div>

              {/* WHERE */}
              <div style={fieldWrap(true)}>
                <MapPin size={15} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                    Where?
                  </p>
                  <input
                    type="text"
                    value={where}
                    onChange={e => setWhere(e.target.value)}
                    placeholder="City or region"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#2B3132', background: 'transparent' }}
                  />
                </div>
              </div>

              {/* WHEN */}
              <div style={fieldWrap(true)}>
                <Calendar size={15} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                    When?
                  </p>
                  <input
                    type="text"
                    value={when}
                    onChange={e => setWhen(e.target.value)}
                    placeholder="Dates"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#2B3132', background: 'transparent' }}
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                style={{ padding: '0 36px', background: '#A7A5D0', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
                onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* â•â•â• BROWSE BY CATEGORY â•â•â• */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2937', marginBottom: 24 }}>Browse by category</h2>

          {/* Asymmetric 3-col Ă— 2-row grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '210px 210px', gap: 12 }}>

            {/* Large card â€” col 1, spans both rows */}
            <Link to={'/services/' + CATEGORY_CARDS[0].slug}
              style={{ gridColumn: '1', gridRow: '1 / 3', background: CATEGORY_CARDS[0].bg, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 20, textDecoration: 'none', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '5rem', opacity: 0.15 }}>
                {CATEGORY_CARDS[0].icon}
              </span>
              <span style={{ background: 'white', color: '#1F2937', fontWeight: 700, fontSize: '1rem', padding: '7px 16px', borderRadius: 8, display: 'inline-block', alignSelf: 'flex-start' }}>
                {CATEGORY_CARDS[0].label}
              </span>
            </Link>

            {/* Top-right: Bands */}
            <Link to={'/services/' + CATEGORY_CARDS[1].slug}
              style={{ gridColumn: '2', gridRow: '1', background: CATEGORY_CARDS[1].bg, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, textDecoration: 'none', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '3rem', opacity: 0.15 }}>
                {CATEGORY_CARDS[1].icon}
              </span>
              <span style={{ background: 'white', color: '#1F2937', fontWeight: 700, fontSize: '0.875rem', padding: '5px 12px', borderRadius: 6, display: 'inline-block', alignSelf: 'flex-start' }}>
                {CATEGORY_CARDS[1].label}
              </span>
            </Link>

            {/* Top-far-right: Photographers */}
            <Link to={'/services/' + CATEGORY_CARDS[2].slug}
              style={{ gridColumn: '3', gridRow: '1', background: CATEGORY_CARDS[2].bg, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, textDecoration: 'none', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '3rem', opacity: 0.15 }}>
                {CATEGORY_CARDS[2].icon}
              </span>
              <span style={{ background: 'white', color: '#1F2937', fontWeight: 700, fontSize: '0.875rem', padding: '5px 12px', borderRadius: 6, display: 'inline-block', alignSelf: 'flex-start' }}>
                {CATEGORY_CARDS[2].label}
              </span>
            </Link>

            {/* Bottom-right spans 2 cols: Catering */}
            <Link to={'/services/' + CATEGORY_CARDS[3].slug}
              style={{ gridColumn: '2 / 4', gridRow: '2', background: CATEGORY_CARDS[3].bg, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, textDecoration: 'none', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '3rem', opacity: 0.15 }}>
                {CATEGORY_CARDS[3].icon}
              </span>
              <span style={{ background: 'white', color: '#1F2937', fontWeight: 700, fontSize: '0.875rem', padding: '5px 12px', borderRadius: 6, display: 'inline-block', alignSelf: 'flex-start' }}>
                {CATEGORY_CARDS[3].label}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* â•â•â• POPULAR NEAR YOU â•â•â• */}
      <section style={{ background: '#F8FAF8', padding: '48px 24px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>Popular near you</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginBottom: 28 }}>
            Highly rated services available in your area
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {TOP_PROVIDERS.map((p, i) => (
              <Link
                key={p.category + '-' + p.id}
                to={'/services/' + p.category + '/' + p.id}
                style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
              >
                {/* Thumbnail */}
                <div style={{ height: 180, background: CARD_BG[i], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '3rem', opacity: 0.28 }}>{p.catIcon}</span>
                  <button
                    onClick={e => toggleLike(p.id, e)}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }}
                  >
                    <Heart size={14}
                      fill={liked[p.id] ? '#A7A5D0' : 'none'}
                      stroke={liked[p.id] ? '#A7A5D0' : '#9CA3AF'} />
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>â…</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                      {p.rating} (12 reviews)
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1F2937', lineHeight: 1.3, margin: 0 }}>
                    {p.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>đź“Ť {p.location}</p>
                  <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8886B8', background: '#EEEDF9', padding: '2px 8px', borderRadius: 4 }}>
                      {p.catLabel}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2B3132' }}>{p.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â• FOOTER â•â•â• */}
      <footer style={{ background: '#4A4E47', padding: '48px 24px 36px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }}>
          {/* Brand */}
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7DA68D', letterSpacing: '-0.02em' }}>Meetiva</span>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: 10, lineHeight: 1.7, maxWidth: 220 }}>
              Platforma za organizaciju nezaboravnih svadbi, proslava i poslovnih dogaÄ‘aja.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>Â© 2026 Meetiva</p>
          </div>

          {/* Company / Legal / Support */}
          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>
                {title}
              </h4>
              {items.map(item => (
                <p key={item} style={{ margin: '0 0 8px' }}>
                  <Link to="/"
                    style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.875rem', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.68)'}>
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

