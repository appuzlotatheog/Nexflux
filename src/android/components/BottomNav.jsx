/**
 * Android Bottom Navigation v3.0
 * Premium animated bottom nav
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/theme.css';
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
    if (location.pathname.startsWith('/watch')) {
        return null;
    }

    return (
        <nav className="nx-bottom-nav">
            <div className="nx-bottom-nav__inner">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            className={`nx-bottom-nav__item ${active ? 'nx-bottom-nav__item--active' : ''}`}
                            onClick={() => handleClick(item.path)}
                        >
                            <span className="nx-bottom-nav__icon">{item.icon}</span>
                            <span className="nx-bottom-nav__label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
