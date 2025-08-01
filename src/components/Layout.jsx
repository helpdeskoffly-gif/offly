import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useTheme } from '../contexts/ThemeContext';

export function Layout() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${
      theme === "dark" 
        ? "bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950" 
        : "bg-gradient-to-br from-emerald-200 via-green-200 to-teal-200"
    }`}>
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
}
