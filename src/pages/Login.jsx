import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await demoLogin(email, password);
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    const u = result.user;
    if (u.role === 'admin') navigate('/admin');
    else if (u.role === 'provider' && u.providerStatus === 'setup') navigate('/provider-setup');
    else navigate('/');
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm';
  const inputStyle = { borderColor: '#DDE3DE', background: 'white', color: '#2B3132' };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 w-full max-w-md" style={{ border: '1px solid #DDE3DE' }}>
          <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#2B3132' }}>Dobrodošli natrag</h2>
          <p className="text-sm mb-6" style={{ color: '#8A9192' }}>Prijavi se u svoj Meetiva račun</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className={inputCls} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                placeholder="ime@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#505A5B' }}>Lozinka</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className={inputCls} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#A7A5D0'}
                onBlur={e => e.target.style.borderColor = '#DDE3DE'}
                placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm" style={{ color: '#B03030' }}>{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-full font-semibold text-white mt-2"
              style={{ background: '#A7A5D0', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Prijava...' : 'Prijavi se'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm" style={{ color: '#8A9192' }}>
            Nemaš račun?{' '}
            <Link to="/register" style={{ color: '#A7A5D0', fontWeight: 600, textDecoration: 'none' }}>Registriraj se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
