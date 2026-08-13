import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('user');
  const [error,    setError]    = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Unesite ime'); return; }
    const newUser = { uid: 'u' + Date.now(), name: name.trim(), email, role };
    login(newUser);
    navigate('/');
  };

  const inputStyle = { border: '1.5px solid #DDE3DE', color: '#2B3132' };
  const focusOn  = e => e.target.style.borderColor = '#A7A5D0';
  const focusOff = e => e.target.style.borderColor = '#DDE3DE';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8" style={{ border: '1px solid #DDE3DE', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#2B3132' }}>Stvori račun</h1>
          <p className="text-sm mb-6" style={{ color: '#8A9192' }}>Pridruži se Meetivi besplatno</p>
          {error && <div className="rounded-lg px-4 py-2 mb-4 text-sm" style={{ background: '#FEE8E8', color: '#B03030' }}>{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#505A5B' }}>Puno ime</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Vaše ime i prezime"
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#505A5B' }}>Email adresa</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vas@email.com"
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#505A5B' }}>Lozinka</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 znakova"
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#505A5B' }}>Tip računa</label>
              <div className="flex gap-3">
                {[['user','Korisnik'],['provider','Pružatelj usluga']].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => setRole(val)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: role === val ? '#EEEDF9' : 'white',
                      border: '1.5px solid ' + (role === val ? '#A7A5D0' : '#DDE3DE'),
                      color: role === val ? '#8886B8' : '#505A5B',
                    }}>{lbl}</button>
                ))}
              </div>
            </div>
            <button type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white mt-1 transition-colors"
              style={{ background: '#A7A5D0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#8886B8'}
              onMouseLeave={e => e.currentTarget.style.background = '#A7A5D0'}>
              Registriraj se
            </button>
          </form>
          <p className="text-xs text-center mt-5" style={{ color: '#8A9192' }}>
            Već imaš račun?{' '}
            <Link to="/login" style={{ color: '#A7A5D0', fontWeight: 600, textDecoration: 'none' }}>Prijavi se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
