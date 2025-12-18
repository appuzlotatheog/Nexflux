/**
 * Android Bottom Navigation
 * Premium animated bottom nav for Android app
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
    { id: 'home', icon: '🏠', activeIcon: '🏠', label: 'Home', path: '/' },
    { id: 'search', icon: '🔍', activeIcon: '🔎', label: 'Search', path: '/search' },
    { id: 'mylist', icon: '📋', activeIcon: '📑', label: 'My List', path: '/my-list' },
    { id: 'profile', icon: '👤', activeIcon: '👤', label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleNavClick = (path) => {
        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        navigate(path);
    };

    // Hide on watch page
    if (location.pathname.startsWith('/watch')) {
        return null;
    }

    return (
        <nav className="android-bottom-nav">
            <div className="android-bottom-nav__container">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            className={`android-bottom-nav__item ${active ? 'android-bottom-nav__item--active' : ''}`}
                            onClick={() => handleNavClick(item.path)}
                            aria-label={item.label}
                        >
                            <span className="android-bottom-nav__icon">
                                {active ? item.activeIcon : item.icon}
                            </span>
                            <span className="android-bottom-nav__label">{item.label}</span>
                            {active && <span className="android-bottom-nav__indicator" />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
