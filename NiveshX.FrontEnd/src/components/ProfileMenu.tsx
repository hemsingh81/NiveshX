import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { FaHandsPraying } from 'react-icons/fa6';
import { profileImg } from '../assets/images';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { logoutUser } from '../services/authService';

const ProfileMenu: React.FC = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null; // or a loading spinner
  const firstName = user?.name?.split(' ')[0] || 'User';
  const profilePictureUrl = user?.profilePictureUrl || profileImg;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(prev => !prev)}
        className="flex items-center gap-2 focus:outline-none whitespace-nowrap"
      >
        <span className="flex items-center gap-1 text-sm text-white">
          Ram Ram <FaHandsPraying /> {firstName}
        </span>

        <img
          src={profilePictureUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full border-2 border-white bg-white object-cover"
        />
        <FiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-12 w-48 bg-gray-800 text-white rounded shadow-lg z-50 border primary-siteBdColor">
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
