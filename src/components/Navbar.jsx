import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import logoImg from '../assets/logo.png';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // 1. Dohvaćanje neodobrenih pružatelja (samo za admine)
  useEffect(() => {
    if (currentUser && userProfile?.role === 'admin') {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'provider'),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingCount(snapshot.docs.length);
      });

      return () => unsubscribe();
    }
  }, [currentUser, userProfile]);

  // 2. Dohvaćanje broja nepročitanih poruka (za sve prijavljene korisnike)
  useEffect(() => {
    if (!currentUser?.uid) {
      setUnreadMessagesCount(0);
      return;
    }

    // Dohvati sve razgovore u kojima sudjeluje korisnik
    const qChats = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribes = [];

    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      let totals = {};

      if (snapshot.empty) {
        setUnreadMessagesCount(0);
        return;
      }

      snapshot.docs.forEach((chatDoc) => {
        // Za svaki chat pratimo nepročitane poruke
        const messagesQ = query(
          collection(db, 'chats', chatDoc.id, 'messages'),
          where('read', '==', false)
        );

        const unsubMsg = onSnapshot(messagesQ, (msgSnapshot) => {
          // Brojimo samo poruke koje je poslala DRUGA osoba
          const count = msgSnapshot.docs.filter(
            docSnap => docSnap.data().senderId !== currentUser.uid
          ).length;

          totals[chatDoc.id] = count;

          // Izračunaj ukupni zbroj svih nepročitanih poruka iz svih chata-ova
          const sum = Object.values(totals).reduce((a, b) => a + b, 0);
          setUnreadMessagesCount(sum);
        });

        unsubscribes.push(unsubMsg);
      });
    });

    return () => {
      unsubscribeChats();
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Greška pri odjavi:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: isActive(path) ? '#2B3132' : '#8A9192',
    fontWeight: isActive(path) ? 600 : 500,
    textDecoration: 'none',
    transition: 'color 0.2s',
  });

  return (
    <nav className="w-full bg-white border-b sticky top-0 z-50 px-6 py-3 flex items-center justify-between" style={{ borderColor: '#DDE3DE' }}>
      
      {/* 1. Lijevo: Logo */}
      <div className="flex-1 flex justify-start items-center">
        <Link to="/" className="flex items-center">
          <img 
            src={logoImg} 
            alt="Meetiva Logo" 
            className="h-8 w-auto object-contain" 
          />
        </Link>
      </div>

      {/* 2. Sredina: Navigacija */}
      <div className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm">
        {/* Kategorije se prikazuju UVIJEK */}
        <Link to="/services" style={navLinkStyle('/services')}>
          Kategorije
        </Link>

        {/* Poruke, Rezervacije i uloge prikazuju se SAMO AKO JE KORISNIK PRIJAVLJEN */}
        {currentUser && (
          <>
            <Link 
              to="/messages" 
              style={navLinkStyle('/messages')}
              className="relative flex items-center gap-1.5"
            >
              <span>Poruke</span>
              
              {/* Ljubičasti krug s brojem nepročitanih poruka */}
              {unreadMessagesCount > 0 && (
                <span 
                  className="px-1.5 py-0.5 text-[11px] font-bold text-white rounded-full flex items-center justify-center leading-none shadow-sm"
                  style={{ background: '#A7A5D0', minWidth: '18px', height: '18px' }}
                >
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}
            </Link>

            <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
              Rezervacije
            </Link>

            {userProfile?.role === 'provider' && (
              <Link to="/provider-profile" style={navLinkStyle('/provider-profile')}>
                Moje usluge
              </Link>
            )}

            {userProfile?.role === 'admin' && (
              <Link 
                to="/admin" 
                style={navLinkStyle('/admin')}
                className="flex items-center gap-2"
              >
                <span>Nove Registracije</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
          </>
        )}
      </div>

      {/* 3. Desno: Profil ili Prijava/Registracija */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ background: '#A7A5D0' }}
              >
                {(userProfile?.name || currentUser.displayName || currentUser.email || 'K')[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-medium" style={{ color: '#2B3132' }}>
                {userProfile?.name || currentUser.displayName || 'Moj Profil'}
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-full transition-all"
              style={{ color: '#505A5B', textDecoration: 'none' }}
            >
              Prijava
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all shadow-sm"
              style={{ background: '#A7A5D0', textDecoration: 'none' }}
            >
              Registracija
            </Link>
          </div>
        )}
      </div>

    </nav>
  );
}