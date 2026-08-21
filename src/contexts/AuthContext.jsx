import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext();

const ADMIN_EMAIL = 'admin@meetiva.com';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Registracija korisnika i spremanje profila u Firestore
  const register = async ({ name, email, password, role = 'user', category = null }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      const profileData = {
        name: name || '',
        email: email,
        role: email === ADMIN_EMAIL ? 'admin' : role,
        category: role === 'provider' ? category : null,
        providerStatus: role === 'provider' ? 'setup' : null,
        createdAt: serverTimestamp()
      };

      // Određivanje kolekcije ovisno o ulozi korisnika
      const targetCollection = role === 'provider' ? 'providers' : 'users';
      await setDoc(doc(db, targetCollection, cred.user.uid), profileData);

      return { user: cred.user };
    } catch (err) {
      console.error("Greška pri registraciji:", err);
      if (err.code === 'auth/email-already-in-use') return { error: 'Email već postoji.' };
      if (err.code === 'auth/weak-password') return { error: 'Lozinka mora imati najmanje 6 znakova.' };
      return { error: 'Registracija nije uspjela. Pokušaj opet.' };
    }
  };

  // 2. Prijava
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Demo prijava s hvatanjem grešaka
  const demoLogin = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { user: cred.user };
    } catch (err) {
      const codes = ['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-email'];
      if (codes.includes(err.code)) return { error: 'Neispravna email adresa ili lozinka.' };
      return { error: 'Prijava nije uspjela. Pokušaj opet.' };
    }
  };

  // 3. Odjava
  const logout = () => {
    return signOut(auth);
  };

  // 4. Pratitelj stanja autentifikacije i automatsko učitavanje profila
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Očisti prethodni profil listener ako postoji
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Provjeri postoji li dokument u 'users' ili 'providers'
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let targetRef = userRef;

        if (!userSnap.exists()) {
          const providerRef = doc(db, 'providers', user.uid);
          const providerSnap = await getDoc(providerRef);

          if (providerSnap.exists()) {
            targetRef = providerRef;
          }
        }

        // Postavi stabilan real-time listener na profil
        unsubscribeProfile = onSnapshot(targetRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile({
              id: snapshot.id,
              uid: snapshot.id,
              ...snapshot.data()
            });
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Greška pri slušanju profila:", error);
          setUserProfile(null);
          setLoading(false);
        });

      } catch (error) {
        console.error("Greška pri dohvaćanju profila:", error);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Izvoz sa svim potrebnim funkcijama i alijasima
  const value = {
    // Stanja
    currentUser,
    user: userProfile || currentUser, // Podrška za komponente koje traže 'user'
    userProfile,
    loading,
    isLoggedIn: Boolean(currentUser),

    // Akcije
    login,
    demoLogin,
    logout,
    register,
    signup: register // Alias da radi i poziv preko 'signup'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}