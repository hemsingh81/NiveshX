// src/components/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { logoImg } from '../assets/images';
import ProfileMenu from './ProfileMenu';
import NotificationMenu from './NotificationMenu';

const NavBar: React.FC = () => {
    return (
        <nav className="bg-gray-900 text-white px-6 py-3 shadow-2xl flex items-center justify-between">
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
            <div className="flex items-center gap-6">
                {/* NotificationMenu */}
                <NotificationMenu />
                <div className="h-6 w-px bg-gray-600 mx-1" />
                {/* Profile Dropdown */}
                <ProfileMenu />
            </div>
        </nav>
    );
};

export default NavBar;
