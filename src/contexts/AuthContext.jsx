import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Demo accounts — replace with Firebase signIn later
const DEMO_USERS = [
  { uid: 'u1', name: 'Ana Kovač',     email: 'ana@test.com',  role: 'user'     },
  { uid: 'u2', name: 'Ivan Fotograf', email: 'ivan@test.com', role: 'provider' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('meetiva_user')); }
    catch { return null; }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('meetiva_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('meetiva_user');
  };

  // TODO: replace with Firebase signInWithEmailAndPassword
  const demoLogin = (email, _password) => {
    const found = DEMO_USERS.find(u => u.email === email);
    if (found) { login(found); return true; }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
