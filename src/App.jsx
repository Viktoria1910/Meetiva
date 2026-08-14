import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Home         from './pages/Home';
import Services     from './pages/Services';
import CategoryPage from './pages/CategoryPage';
import ProviderPage from './pages/ProviderPage';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Messages     from './pages/Messages';
import Profile      from './pages/Profile';
import Search       from './pages/Search';
import ProviderSetup from './pages/ProviderSetup';
import AdminPanel   from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                          element={<Home />} />
          <Route path="/services"                  element={<Services />} />
          <Route path="/services/:category"        element={<CategoryPage />} />
          <Route path="/services/:category/:id"    element={<ProviderPage />} />
          <Route path="/login"                     element={<Login />} />
          <Route path="/register"                  element={<Register />} />
          <Route path="/dashboard"                 element={<Dashboard />} />
          <Route path="/messages"                  element={<Messages />} />
          <Route path="/profile"                   element={<Profile />} />
          <Route path="/search"                    element={<Search />} />
          <Route path="/provider-setup"             element={<ProviderSetup />} />
          <Route path="/admin"                      element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
