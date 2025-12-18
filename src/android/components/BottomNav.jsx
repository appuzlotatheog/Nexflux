/**
 * Android Bottom Navigation v4.0
 * Uses a- prefix classes
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/android.css';

const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/' },
    { id: 'search', icon: '🔍', label: 'Search', path: '/search' },
    { id: 'mylist', icon: '📑', label: 'My List', path: '/my-list' },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleClick = (path) => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(path);
    };

    // Hide on watch page
    if (location.pathname.startsWith('/watch')) return null;

    return (
        <nav className="a-nav">
            <div className="a-nav__inner">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`a-nav__item ${isActive(item.path) ? 'a-nav__item--active' : ''}`}
                        onClick={() => handleClick(item.path)}
                    >
                        <span className="a-nav__icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
