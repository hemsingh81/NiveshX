import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const NavBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold tracking-wide">
        NiveshX
      </Link>
      <div className="space-x-4">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
