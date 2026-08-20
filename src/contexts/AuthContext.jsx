import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  onSnapshot
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Ugasi prethodni listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setCurrentUser(user);
      setUserProfile(null);

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Prvo pokušaj users
      const userRef = doc(db, 'users', user.uid);

      unsubscribeProfile = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile({
              id: snapshot.id,
              ...snapshot.data()
            });

            setLoading(false);
            return;
          }

          // Ako users dokument ne postoji,
          // prijeđi na providers
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }

          const providerRef = doc(db, 'providers', user.uid);

          unsubscribeProfile = onSnapshot(
            providerRef,
            (providerSnapshot) => {
              if (providerSnapshot.exists()) {
                setUserProfile({
                  id: providerSnapshot.id,
                  ...providerSnapshot.data()
                });
              } else {
                setUserProfile(null);
              }

              setLoading(false);
            },
            (error) => {
              console.error(
                'Greška kod providers listenera:',
                error
              );

              setUserProfile(null);
              setLoading(false);
            }
          );
        },
        (error) => {
          console.error(
            'Greška kod users listenera:',
            error
          );

          setUserProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}