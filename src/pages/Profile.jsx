import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserCheck, KeyRound, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProviderByUserId } from '../utils/providerStorage';
import { categoryData } from '../utils/categoryData';

export default function Profile() {
  const { user, currentUser, isLoggedIn, logout, updateUserData, updatePasswordUser } = useAuth();
  const navigate = useNavigate();

  // Stanja za uređivanje osobnih podataka
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Stanja za promjenu lozinke
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status poruke
  const [message, setMessage] = useState({ type: '', text: '' });

  const [providerProfile, setProviderProfile] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    if (user?.role === 'provider') {
      getProviderByUserId(user.uid).then(setProviderProfile);
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-10" style={{ border: '1px solid #DDE3DE' }}>
            <p className="text-lg font-bold mb-2" style={{ color: '#2B3132' }}>Niste prijavljeni</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full font-semibold text-white text-sm mt-2"
              style={{ background: '#A7A5D0', border: 'none', cursor: 'pointer' }}
            >
              Prijava
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Spremanje osobnih podataka
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      if (updateUserData) {
        await updateUserData({ name, email });
      }
      setMessage({ type: 'success', text: 'Osobni podaci su uspješno ažurirani!' });
      setIsEditingInfo(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri spremanju podataka: ' + err.message });
    }
  };

  // Promjena lozinke
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Nove lozinke se ne podudaraju!' });
      return;
    }

    try {
      if (updatePasswordUser) {
        await updatePasswordUser(newPassword);
      }
      setMessage({ type: 'success', text: 'Lozinka je uspješno promijenjena!' });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri promjeni lozinke: ' + err.message });
    }
  };

  const providerStatus = providerProfile?.status || user?.providerStatus;
  const catData = user?.category ? categoryData[user.category] : null;

  const statusInfo = {
    setup:    { bg: '#FFF3CD', color: '#856404', text: 'Profil nije postavljen', action: '/provider-setup', actionLabel: 'Postavi profil' },
    draft:    { bg: '#FFF3CD', color: '#856404', text: 'Nacrt — nije poslan', action: '/provider-setup', actionLabel: 'Nastavi postavljanje' },
    pending:  { bg: '#EEEDF9', color: '#8886B8', text: 'Čeka odobrenje admina', action: null, actionLabel: null },
    approved: { bg: '#E8F0EA', color: '#4A8060', text: 'Aktivan — vidljiv korisnicima', action: '/provider-setup', actionLabel: 'Uredi profil' },
    rejected: { bg: '#FEE8E8', color: '#B03030', text: 'Odbijen — uredi i pokušaj opet', action: '/provider-setup', actionLabel: 'Uredi i ponovi zahtjev' },
  }[providerStatus] || null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      {/* Zaglavlje */}
      <div style={{ background: '#505A5B', padding: '32px 24px' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold text-white"
            style={{ background: '#A7A5D0', flexShrink: 0 }}
          >
            {(user?.name || user?.email || 'K').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{user?.name || 'Korisnik'}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-8 w-full flex flex-col gap-4">
        
        {/* Obavijesti o uspjehu / grešci */}
        {message.text && (
          <div 
            className="p-4 rounded-xl text-sm font-semibold flex items-center justify-between"
            style={{ 
              background: message.type === 'success' ? '#E8F0EA' : '#FEE8E8', 
              color: message.type === 'success' ? '#4A8060' : '#B03030',
              border: `1px solid ${message.type === 'success' ? '#C8DAD0' : '#F5C6C6'}`
            }}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Kartica: Podaci o računu */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>Podaci o računu</h2>
            {!isEditingInfo && (
              <button 
                onClick={() => setIsEditingInfo(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: '#EEEDF9', color: '#8886B8', cursor: 'pointer' }}
              >
                Uredi podatke
              </button>
            )}
          </div>

          {!isEditingInfo ? (
            <div className="flex flex-col gap-3">
              {[
                ['Ime i prezime', user?.name || '-'], 
                ['Email adresa', user?.email || '-'], 
                ['Tip računa', user?.role === 'provider' ? 'Pružatelj usluga' : 'Korisnik']
              ].map(([lbl, val]) => (
                <div key={lbl} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F4F5F2' }}>
                  <span className="text-sm font-medium" style={{ color: '#505A5B' }}>{lbl}</span>
                  <span className="text-sm font-semibold" style={{ color: '#2B3132' }}>{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Ime i prezime</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: '#DDE3DE' }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Email adresa</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: '#DDE3DE' }}
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                  style={{ background: '#A7A5D0', cursor: 'pointer' }}
                >
                  <Save size={14} /> Spremi
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditingInfo(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: '#F4F5F2', color: '#505A5B', cursor: 'pointer' }}
                >
                  Odustani
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Kartica: Promjena lozinke */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ color: '#2B3132' }}>Sigurnost i lozinka</h2>
            {!isChangingPassword && (
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: '#F4F5F2', color: '#505A5B', cursor: 'pointer' }}
              >
                Promijeni lozinku
              </button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handleSavePassword} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Nova lozinka</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: '#DDE3DE' }}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#505A5B' }}>Potvrdi novu lozinku</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: '#DDE3DE' }}
                  minLength={6}
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                  style={{ background: '#A7A5D0', cursor: 'pointer' }}
                >
                  <KeyRound size={14} /> Spremi novu lozinku
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: '#F4F5F2', color: '#505A5B', cursor: 'pointer' }}
                >
                  Odustani
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Status pružatelja usluga (Provider) */}
        {user?.role === 'provider' && statusInfo && (
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDE3DE' }}>
            <h2 className="font-bold text-base mb-4" style={{ color: '#2B3132' }}>Status pružatelja usluga</h2>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                {catData && <span style={{ fontSize: '1.4rem' }}>{catData.icon}</span>}
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#2B3132' }}>
                    {providerProfile?.businessName || catData?.label || 'Profil'}
                  </p>
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: statusInfo.bg, color: statusInfo.color }}
                  >
                    {statusInfo.text}
                  </span>
                </div>
              </div>
              {statusInfo.action && (
                <Link 
                  to={statusInfo.action}
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ background: '#EEEDF9', color: '#8886B8', textDecoration: 'none', border: '1px solid #D4D2EC' }}
                >
                  {statusInfo.actionLabel}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Navigacijski gumbi */}
        <div className="flex gap-3">
          <Link 
            to="/dashboard"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
            style={{ background: '#EEEDF9', color: '#8886B8', textDecoration: 'none', border: '1px solid #D4D2EC' }}
          >
            Moje rezervacije
          </Link>
          <Link 
            to="/messages"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
            style={{ background: '#E8F0EA', color: '#4A8060', textDecoration: 'none', border: '1px solid #C8DAD0' }}
          >
            Poruke
          </Link>
        </div>

        {/* Gumb za odjavu */}
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: 'white', color: '#8A9192', border: '1px solid #DDE3DE', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEE8E8'; e.currentTarget.style.color = '#B03030'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#8A9192'; }}
        >
          <LogOut size={15} /> Odjavi se
        </button>
      </div>
    </div>
  );
}