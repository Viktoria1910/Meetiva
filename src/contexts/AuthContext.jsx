import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'admin@meetiva.com';

async function fetchProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return { uid, ...snap.data() };
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUser(profile || { uid: firebaseUser.uid, email: firebaseUser.email, role: 'user' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const register = async ({ name, email, password, role, category }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const profile = {
        name,
        email,
        role: email === ADMIN_EMAIL ? 'admin' : role,
        category: role === 'provider' ? category : null,
        providerStatus: role === 'provider' ? 'setup' : null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      const newUser = { uid: cred.user.uid, ...profile };
      setUser(newUser);
      return { user: newUser };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') return { error: 'Email već postoji.' };
      if (err.code === 'auth/weak-password') return { error: 'Lozinka mora imati najmanje 6 znakova.' };
      return { error: 'Registracija nije uspjela. Pokušaj opet.' };
    }
  };

  const demoLogin = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchProfile(cred.user.uid);
      const u = profile || { uid: cred.user.uid, email, role: 'user' };
      setUser(u);
      return { user: u };
    } catch (err) {
      const codes = ['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-email'];
      if (codes.includes(err.code)) return { error: 'Neispravna email adresa ili lozinka.' };
      return { error: 'Prijava nije uspjela. Pokušaj opet.' };
    }
  };

  const updateUser = async (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try { await updateDoc(doc(db, 'users', user.uid), updates); } catch (_) {}
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F4F5F2' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #DDE3DE', borderTopColor: '#A7A5D0', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, logout, demoLogin, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
