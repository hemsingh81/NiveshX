import React, { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';

const NotificationMenu: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="text-xl cursor-pointer hover:text-gray-300 focus:outline-none"
      >
        <FiBell />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-10 w-64 bg-gray-800 text-white rounded shadow-lg z-50 border border-topMenu">
          <div className="px-4 py-3 text-sm text-gray-300">No notifications</div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
