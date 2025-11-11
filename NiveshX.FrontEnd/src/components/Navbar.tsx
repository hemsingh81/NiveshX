import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoImg } from '../assets/images';
import ProfileMenu from './ProfileMenu';
import NotificationMenu from './NotificationMenu';

const NavBar: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const linkClass = (path: string) =>
        currentPath === path
            ? 'border-b-2 primary-siteBdColor pb-1 text-white'
            : 'hover:text-gray-300';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-6 py-3 shadow-2xl flex items-center justify-between">
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
                    <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                    <Link to="/admin" className={linkClass('/admin')}>Admin</Link>
                    <Link to="/master" className={linkClass('/master')}>Master</Link>
                </div>
            </div>

            {/* Right: Search + Icons + Profile */}
            <div className="flex items-center gap-6">
                <NotificationMenu />
                <div className="h-6 w-px bg-gray-600 mx-1" />
                <ProfileMenu />
            </div>
        </nav>
    );
};

export default NavBar;
