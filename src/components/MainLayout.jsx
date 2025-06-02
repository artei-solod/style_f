import React from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import WardrobeView from './WardrobeView';
import OutfitsView from './OutfitsView';
import ShoppingView from './ShoppingView';

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: In your real app, clear auth tokens, call logout endpoint, etc.
    // Then send user back to landing page:
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 1. Top Navbar */}
      <header className="bg-white shadow-md h-16 flex items-center px-6 justify-between">
        <h1 className="text-2xl font-bold text-gray-800">AI Stylist</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Sidebar Navigation */}
        <nav className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <ul className="mt-6">
            <li>
              <NavLink
                to="wardrobe"
                className={({ isActive }) =>
                  'block px-6 py-3 text-lg font-medium ' +
                  (isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50')
                }
              >
                Wardrobe
              </NavLink>
            </li>
            <li>
              <NavLink
                to="outfits"
                className={({ isActive }) =>
                  'block px-6 py-3 text-lg font-medium ' +
                  (isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50')
                }
              >
                Outfits
              </NavLink>
            </li>
            <li>
              <NavLink
                to="shopping"
                className={({ isActive }) =>
                  'block px-6 py-3 text-lg font-medium ' +
                  (isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50')
                }
              >
                Shopping
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* 3. Main Content Area (Nested Routes) */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            {/* Default: redirect /app → /app/wardrobe */}
            <Route path="/" element={<Navigate to="wardrobe" replace />} />

            <Route path="wardrobe" element={<WardrobeView />} />
            <Route path="outfits" element={<OutfitsView />} />
            <Route path="shopping" element={<ShoppingView />} />

            {/* Catch-all: redirect unknown paths under /app to wardrobe */}
            <Route path="*" element={<Navigate to="wardrobe" replace />} />
          </Routes>
        </main>
      </div>
    </div>
);
}
