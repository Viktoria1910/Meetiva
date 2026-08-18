import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  updateProfile, 
  updatePassword 
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // prilagodite putanju do vaše firebase konfiguracije

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ uid: user.uid, ...userDoc.data() });
          } else {
            setUserProfile({
              uid: user.uid,
              name: user.displayName || '',
              email: user.email,
              role: 'user'
            });
          }
        } catch (error) {
          console.error("Greška pri dohvaćanju profila iz Firestorea:", error);
          setUserProfile({
            uid: user.uid,
            name: user.displayName || '',
            email: user.email,
            role: 'user'
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Funkcija za odjavu
  const logout = () => {
    return signOut(auth);
  };

  // Ažuriranje osobnih podataka
  const updateUserData = async ({ name, email }) => {
    if (!currentUser) return;

    // 1. Ažuriramo profil u Firebase Auth
    if (name && name !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: name });
    }

    // 2. Ažuriramo dokument u Firestore "users" kolekciji
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, { name, email });

    // 3. Ažuriramo lokalno stanje
    setUserProfile(prev => ({ ...prev, name, email }));
    setCurrentUser(auth.currentUser);
  };

  // Promjena lozinke
  const updatePasswordUser = async (newPassword) => {
    if (!currentUser) return;
    await updatePassword(currentUser, newPassword);
  };

  // Kombinirani 'user' objekt koji objedinjuje Auth i Firestore podatke
  const combinedUser = currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    name: userProfile?.name || currentUser.displayName || 'Korisnik',
    role: userProfile?.role || 'user',
    providerStatus: userProfile?.providerStatus || null,
    category: userProfile?.category || null,
    ...userProfile
  } : null;

  const value = {
    currentUser,
    userProfile,
    user: combinedUser,
    isLoggedIn: !!currentUser,
    loading,
    logout,
    updateUserData,
    updatePasswordUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}