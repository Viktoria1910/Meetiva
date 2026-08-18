import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logoImg from '../assets/logo.png';

const CATEGORIES = [
  'Prostori i sale za proslave',
  'Rođendanske igraonice',
  'Catering i hrana',
  'Fotografija i video',
  'Glazba i DJ',
  'Dekoracije i baloni',
  'Animacija i zabava',
  'Ostale usluge za događaje',
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    category: CATEGORIES[0],
    terms: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      return setError('Molimo unesite puno ime.');
    }

    if (!formData.terms) {
      return setError('Morate prihvatiti uvjete korištenja.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Lozinke se ne podudaraju.');
    }

    if (formData.password.length < 6) {
      return setError('Lozinka mora imati najmanje 6 znakova.');
    }

    try {
      setLoading(true);
      const res = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        category: formData.role === 'provider' ? formData.category : null,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        navigate(formData.role === 'provider' ? '/provider-setup' : '/dashboard');
      }
    } catch (err) {
      console.error("DETALJNA GREŠKA:", err);
      setError('Došlo je do pogreške pri registraciji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">

      <div className="flex-1 flex min-h-[calc(100vh-70px)]">
        {/* LIJEVA STRANA */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#E8F0E6] via-[#C5D4C2] to-[#A8BDA5] items-center justify-center p-10">
          <div className="absolute -top-20 -left-16 w-80 h-80 rounded-full bg-[#9B82B3]/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-12 w-72 h-72 rounded-full bg-white/30 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-7 max-w-xs text-center">
            <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl shadow-sm">
              <img src="/favicon.svg" alt="Favicon" className="w-16 h-16 object-contain" />
            </div>

            <img
              src={logoImg}
              alt="Meetiva Logo"
              className="w-60 h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* DESNA STRANA */}
        <div className="flex-1 bg-white flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-[#2C352E] mb-1">Kreiraj račun</h2>
            <p className="text-sm text-[#606C61] mb-6">Pridružite se Meetiva platformi za organizaciju događaja.</p>

            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-medium">
                {error}
              </div>
            )}

            {/* Toggle uloge */}
            <div className="flex bg-[#F2F4F2] p-1 rounded-lg mb-5">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  formData.role === 'user'
                    ? 'bg-white text-[#2C352E] font-semibold shadow-sm'
                    : 'text-[#606C61] hover:text-[#2C352E]'
                }`}
                onClick={() => handleRoleSelect('user')}
              >
                Korisnik
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  formData.role === 'provider'
                    ? 'bg-white text-[#2C352E] font-semibold shadow-sm'
                    : 'text-[#606C61] hover:text-[#2C352E]'
                }`}
                onClick={() => handleRoleSelect('provider')}
              >
                Pružatelj usluga
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#2C352E]">Puno ime</label>
                <div className="relative flex items-center">
                  <svg className="absolute left-3 w-4 h-4 text-[#8A968B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ivan Horvat"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D8E0D7] text-sm text-[#2C352E] outline-none focus:border-[#9B82B3] focus:ring-1 focus:ring-[#9B82B3]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#2C352E]">Email adresa</label>
                <div className="relative flex items-center">
                  <svg className="absolute left-3 w-4 h-4 text-[#8A968B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    placeholder="ivan@primjer.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D8E0D7] text-sm text-[#2C352E] outline-none focus:border-[#9B82B3] focus:ring-1 focus:ring-[#9B82B3]"
                  />
                </div>
              </div>

              {formData.role === 'provider' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#2C352E]">Kategorija usluge</label>
                  <div className="relative flex items-center">
                    <svg className="absolute left-3 w-4 h-4 text-[#8A968B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D8E0D7] text-sm text-[#2C352E] outline-none bg-white cursor-pointer focus:border-[#9B82B3] focus:ring-1 focus:ring-[#9B82B3]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#2C352E]">Lozinka</label>
                <div className="relative flex items-center">
                  <svg className="absolute left-3 w-4 h-4 text-[#8A968B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D8E0D7] text-sm text-[#2C352E] outline-none focus:border-[#9B82B3] focus:ring-1 focus:ring-[#9B82B3]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#2C352E]">Potvrdi lozinku</label>
                <div className="relative flex items-center">
                  <svg className="absolute left-3 w-4 h-4 text-[#8A968B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D8E0D7] text-sm text-[#2C352E] outline-none focus:border-[#9B82B3] focus:ring-1 focus:ring-[#9B82B3]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#606C61] cursor-pointer mt-1">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#9B82B3] rounded border-[#D8E0D7]"
                />
                <span>
                  Prihvaćam <span className="font-semibold text-[#2C352E]">Uvjete korištenja</span> i <span className="font-semibold text-[#2C352E]">Pravila privatnosti</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 bg-[#9B82B3] hover:bg-[#8A71A2] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Kreiranje...' : 'Kreiraj račun →'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#606C61]">
              Već imate račun?{' '}
              <Link to="/login" className="text-[#9B82B3] font-semibold hover:underline">
                Prijavi se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}