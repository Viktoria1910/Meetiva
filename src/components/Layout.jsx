// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer'; // Opcionalno

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar se prikazuje na svim stranicama unutar ove grupe */}
      <Navbar />

      {/* Dinamički sadržaj stranice (Home, Services, Profile...) */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer se prikazuje na svim stranicama */}
      <Footer />
    </div>
  );
}