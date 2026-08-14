import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // 'user' ili 'provider'
    category: ''  // Dodano ako odabere 'provider'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Pozivamo funkciju iz tvog AuthContext-a
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      category: formData.role === 'provider' ? formData.category : null
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      // Uspješno! Preusmjeri korisnika na početnu
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #e8eaf6 50%, #e0f7fa 100%)' }}>
      {/* Background profile silhouette */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        style={{ position: 'fixed', width: '850px', height: '850px', bottom: '-150px', right: '-120px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, filter: 'blur(4px)' }}
      >
        <circle cx="100" cy="72" r="40" fill="#7c5cbf" />
        <ellipse cx="100" cy="160" rx="65" ry="55" fill="#7c5cbf" />
      </svg>
      {/* Plus sign above silhouette */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'fixed', bottom: '560px', right: '30px', opacity: 0.1, pointerEvents: 'none', zIndex: 0, filter: 'blur(3px)' }} width="120" height="140" viewBox="0 0 60 60">
        <rect x="26" y="6" width="8" height="48" rx="4" fill="#7c5cbf" />
        <rect x="6" y="26" width="50" height="8" rx="4" fill="#7c5cbf" />
      </svg>

      {/* Navbar */}
      <nav className="flex items-center justify-center px-8 py-5 w-full" style={{ position: 'relative', zIndex: 1 }}>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Meetiva logo" className="h-20 w-auto" />
        </Link>
      </nav>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12" style={{ position: 'relative', zIndex: 1 }}>
        <div className="bg-white rounded-3xl shadow-sm p-10 w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-2 text-center" style={{ color: '#37306b' }}>Kreiraj račun</h2>
          <p className="text-center mb-6 text-sm" style={{ color: '#9ca3af' }}>Pridruži se Meetiva zajednici</p>

          {/* Prikaz greške ako postoji */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Ime</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#b39ddb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                placeholder="Tvoje ime"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#b39ddb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                placeholder="ime@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Lozinka</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#b39ddb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Uloga</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                onFocus={e => e.target.style.borderColor = '#b39ddb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="user">Korisnik</option>
                <option value="provider">Pružatelj usluga</option>
              </select>
            </div>

            {/* Dodatno polje ako je odabran Dobavljač */}
            {formData.role === 'provider' && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Kategorija usluge</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: '#e5e7eb' }}
                  onFocus={e => e.target.style.borderColor = '#b39ddb'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="npr. Fotograf, Soba/Sala, Muzika"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-semibold text-white mt-2 transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ce93d8, #90caf9)' }}
            >
              {loading ? 'Registracija...' : 'Registriraj se'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
            Već imaš račun?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#7c5cbf' }}>Prijavi se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;