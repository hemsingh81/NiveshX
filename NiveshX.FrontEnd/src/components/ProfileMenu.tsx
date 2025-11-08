// src/components/ProfileMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { profileImg } from '../assets/images';
import { useAuth } from './AuthContext';

const ProfileMenu: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <img
          src={profileImg}
          alt="Profile"
          className="w-8 h-8 rounded-full border-2 border-white bg-white object-cover"
        />
        <FiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-12 w-48 bg-gray-800 text-white rounded shadow-lg z-50 border border-topMenu">
          <Link to="/profile" className="block px-4 py-2 hover:bg-gray-700">Profile</Link>
          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-700">Settings</Link>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
