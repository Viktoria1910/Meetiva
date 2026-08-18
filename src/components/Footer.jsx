// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Kategorije: [
    'Sale za vjenčanja',
    'Fotografi i snimatelji',
    'Glazba i DJ',
    'Catering i torte',
    'Dekoracije i cvijeće'
  ],
  Aplikacija: [
    'O nama',
    'Istraži ponudu',
    'Cjenik za pružatelje',
    'Česta pitanja'
  ],
  Pravno: [
    'Uvjeti korištenja',
    'Pravila privatnosti',
    'Kolačići',
    'Kontakt support'
  ]
};

export default function Footer() {
  return (
    <footer className="w-full py-10 px-8 mt-auto" style={{ background: '#5e635b' }}>
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <span className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
            Meetiva
          </span>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Platforma za organizaciju nezaboravnih svadbi, proslava i poslovnih događaja.
          </p>
          <p className="text-[0.7rem] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} Meetiva. Sva prava pridržana.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, items]) => (
          <div key={title}>
            <h4 className="text-[0.65rem] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {title}
            </h4>
            {items.map((item) => (
              <p key={item} className="mb-1.5">
                <Link to="/" className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  {item}
                </Link>
              </p>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}