import React from "react";
import {
  MdBusiness,
  MdDomain,
  MdFormatQuote,
  MdGroup,
  MdLocalOffer,
  MdPublic,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-white via-slate-50 to-slate-100 text-gray-800 p-6 space-y-4 shadow-lg border-r">
        <h2 className="text-2xl font-semibold mb-6 tracking-wide text-blue-700">
          Admin Panel
        </h2>
        <nav className="space-y-2">
          <Link
            to="/admin/motivation"
            className={`block px-4 py-2 rounded-md transition-all duration-300 ${
              isActive("/admin/motivation")
                ? "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MdFormatQuote className="text-lg" />
              Motivation Quotes
            </span>
          </Link>

          <Link
            to="/admin/user-management"
            className={`block px-4 py-2 rounded-md transition-all duration-300 ${
              isActive("/admin/user-management")
                ? "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MdGroup className="text-lg" />
              User Management
            </span>
          </Link>

          <Link
            to="/admin/country"
            className={`block px-4 py-2 rounded-md transition-all duration-300 ${
              isActive("/admin/country")
                ? "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MdPublic className="text-lg" />
              Countries
            </span>
          </Link>

          <Link
            to="/admin/industry"
            className={`block px-4 py-2 rounded-md transition-all duration-300 ${
              isActive("/admin/industry")
                ? "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MdBusiness className="text-lg" />
              Industries
            </span>
          </Link>

          <Link
            to="/admin/sector"
            className={`block px-4 py-2 rounded-md transition-all duration-300 ${
              isActive("/admin/sector")
                ? "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MdDomain className="text-lg" />
              Sectors
            </span>
          </Link>

          <Link
            to="/admin/classification-tag"
            className={`block px-4 py-2 rounded-md transition-all duration-300 ${
              isActive("/admin/classification-tag")
                ? "bg-blue-100 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MdLocalOffer className="text-lg" />
              Classification Tags
            </span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white shadow-inner rounded-lg overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
