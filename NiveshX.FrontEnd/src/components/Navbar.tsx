import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FiBell, FiDownload } from 'react-icons/fi';
import { profileImg, logoImg } from '../assets/images';

const NavBar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

            {/* Right: Search + Icons */}
            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-gray-800 text-sm text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {/* <FiSearch className="absolute left-3 top-2.5 text-gray-400" /> */}
                </div>

                {/* Bell Icon */}
                <FiBell className="text-xl cursor-pointer hover:text-gray-300" />

                {/* Download Icon */}
                <FiDownload className="text-xl cursor-pointer hover:text-gray-300" />

                {/* Profile Image */}
                <img
                    src={profileImg}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white bg-white object-cover cursor-pointer"
                />
            </div>
        </nav>
    );
};

export default NavBar;