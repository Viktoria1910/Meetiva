import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // Dok se status prijave učitava iz Firebase-a
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F2]">
        <p className="text-sm font-semibold text-[#505A5B]">Učitavanje...</p>
      </div>
    );
  }

  // Ako korisnik nije prijavljen
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ako ruta zahtijeva određenu ulogu (npr. admin ili provider)
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}