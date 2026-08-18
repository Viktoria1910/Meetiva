// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-6 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} Meetiva. Sva prava pridržana.</p>
    </footer>
  );
}