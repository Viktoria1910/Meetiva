import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login logic with Firebase
    console.log('Login:', email, password);
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
      {/* Navbar */}
      <nav className="flex items-center justify-center px-8 py-5 w-full" style={{ position: 'relative', zIndex: 1 }}>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Meetiva logo" className="h-20 w-auto" />
        </Link>
      </nav>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12" style={{ position: 'relative', zIndex: 1 }}>
        <div className="bg-white rounded-3xl shadow-sm p-10 w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-2 text-center" style={{ color: '#37306b' }}>Dobrodošli natrag</h2>
          <p className="text-center mb-8 text-sm" style={{ color: '#9ca3af' }}>Prijavi se u svoj Meetiva račun</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#b39ddb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full font-semibold text-white mt-2 transition-transform duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #ce93d8, #90caf9)' }}
            >
              Prijavi se
            </button>
          </form>
          <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
            Nemaš račun?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#7c5cbf' }}>Registriraj se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;