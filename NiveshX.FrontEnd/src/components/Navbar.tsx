import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FiBell, FiDownload, FiChevronDown } from 'react-icons/fi';
import { profileImg, logoImg } from '../assets/images';

const NavBar: React.FC = () => {
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
        <nav className="bg-gray-900 text-white px-6 py-3 shadow-lg flex items-center justify-between">
            {/* Left: Logo + Links */}
            <div className="flex items-center gap-8">
                <Link to="/dashboard" className="text-2xl font-bold tracking-wide text-white">
                    <img
                        src={logoImg}
                        alt="NiveshX Logo"
                        className="w-30 h-10 object-contain bg-white rounded"
                    />
                </Link>
                <div className="flex gap-6 text-sm font-medium">
                    <Link to="/dashboard" className="border-b-2 border-topMenu pb-1">Dashboard</Link>
                    <Link to="/admin" className="hover:text-gray-300">Admin</Link>
                    <Link to="/master" className="hover:text-gray-300">Master</Link>
                </div>
            </div>

            {/* Right: Search + Icons + Profile */}
            <div className="flex items-center gap-6 relative" ref={dropdownRef}>
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-gray-800 text-sm text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="h-6 w-px bg-gray-600 mx-1" />
                
                {/* Bell & Download Icons */}
                <FiBell className="text-xl cursor-pointer hover:text-gray-300" />
                <div className="h-6 w-px bg-gray-600 mx-1" />
                {/* Profile + Dropdown Arrow */}
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

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute right-0 top-14 w-48 bg-gray-800 text-white rounded shadow-lg z-50 border border-topMenu">
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
        </nav>
    );
};

export default NavBar;
