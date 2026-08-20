// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout';

// Stranice
import Home          from './pages/Home';
import Services      from './pages/Services';
import CategoryPage  from './pages/CategoryPage';
import ProviderPage  from './pages/ProviderPage';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Messages      from './pages/Messages';
import Profile       from './pages/Profile';
import Search        from './pages/Search';
import ProviderSetup from './pages/ProviderSetup';
import AdminPanel    from './pages/AdminPanel';
import ProviderProfile from './pages/ProviderProfile'; // <-- 1. DODANO

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Glavni Layout - Sve rute unutar njega dobivaju Navbar i Footer */}
      <Route element={<Layout />}>
        {/* Javne rute */}
        <Route path="/"                          element={<Home />} />
        <Route path="/services"                  element={<Services />} />
        <Route path="/services/:category"        element={<CategoryPage />} />
        <Route path="/services/:category/:id"    element={<ProviderPage />} />
        <Route path="/login"                     element={<Login />} />
        <Route path="/register"                  element={<Register />} />
        <Route path="/search"                    element={<Search />} />

        {/* Zaštićene rute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        {/* 2. DODANA RUTA ZA PROVIDER PROFILE */}
        <Route 
          path="/provider-profile" 
          element={
            <ProtectedRoute>
              <ProviderProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider-setup" 
          element={
            <ProtectedRoute>
              <ProviderSetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Preusmjeravanja */}
      <Route path="/admin/pending-providers" element={<Navigate to="/admin" replace />} />
      <Route path="/categories" element={<Navigate to="/services" replace />} />
      <Route path="/bookings"   element={<Navigate to="/dashboard" replace />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  );
}