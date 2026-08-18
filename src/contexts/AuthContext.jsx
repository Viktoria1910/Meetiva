import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { app } from '../firebase'; // Provjerite je li putanja do vaše firebase.js datoteke točna

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dohvaćanje Firebase Auth instance
  const auth = getAuth(app);

  // Funkcija za prijavu
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Demo prijava za testiranje (po potrebi)
  const demoLogin = async () => {
    const mockUser = {
      uid: 'demo-user-123',
      email: 'demo@meetiva.com',
      displayName: 'Demo Korisnik',
    };
    setCurrentUser(mockUser);
    return mockUser;
  };

  // Funkcija za odjavu
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    // Sigurno slušanje promjena stanja autentifikacije
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Greška u Auth State Promatraču:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const value = {
    currentUser,
    loading,
    login,
    demoLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}