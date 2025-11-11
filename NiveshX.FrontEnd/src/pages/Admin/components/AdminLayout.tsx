import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-6 space-y-4 shadow-2xl rounded-r-xl">
        <h2 className="text-2xl font-bold mb-6 tracking-wide">Admin Panel</h2>
        <nav className="space-y-2">
          <Link
            to="/admin/motivation"
            className={`block px-4 py-2 rounded-lg transition-all duration-300 ${isActive('/admin/motivation')
                ? 'bg-gradient-to-r from-white to-blue-100 text-blue-900 font-bold shadow-lg border-l-4 border-blue-500'
                : 'hover:bg-blue-700 hover:text-white'
              }`}
          >
            🌟 Motivation Quotes
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-white shadow-inner rounded-lg overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
