/**
 * Android Profile Page
 * User profile with stats and settings
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, isAuthenticated, getStoredUser } from '../services/api';
import './AndroidProfile.css';

const AndroidProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getStoredUser());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="android-profile android-loading">
                <div className="android-loading__spinner" />
            </div>
        );
    }

    const menuItems = [
        { icon: '📋', label: 'My List', action: () => navigate('/my-list') },
        { icon: '⏰', label: 'Watch History', action: () => { } },
        { icon: '⚙️', label: 'Settings', action: () => { } },
        { icon: '🔔', label: 'Notifications', action: () => { } },
        { icon: '❓', label: 'Help & Support', action: () => { } },
        { icon: '📜', label: 'Terms & Privacy', action: () => { } },
    ];

    return (
        <div className="android-profile">
            {/* Header */}
            <header className="android-profile__header">
                <div className="android-profile__avatar">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                    ) : (
                        <span>{user.username?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                </div>
                <h1 className="android-profile__name">{user.username}</h1>
                <p className="android-profile__email">{user.email}</p>
            </header>

            {/* Stats */}
            <div className="android-profile__stats">
                <div className="android-profile__stat">
                    <span className="android-profile__stat-value">{user.watchlist?.length || 0}</span>
                    <span className="android-profile__stat-label">Watchlist</span>
                </div>
                <div className="android-profile__stat">
                    <span className="android-profile__stat-value">{user.favorites?.length || 0}</span>
                    <span className="android-profile__stat-label">Favorites</span>
                </div>
                <div className="android-profile__stat">
                    <span className="android-profile__stat-value">{user.continueWatching?.length || 0}</span>
                    <span className="android-profile__stat-label">Watching</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="android-profile__menu">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className="android-profile__menu-item"
                        onClick={item.action}
                    >
                        <span className="android-profile__menu-icon">{item.icon}</span>
                        <span className="android-profile__menu-label">{item.label}</span>
                        <svg className="android-profile__menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="android-profile__logout">
                <button
                    className="android-btn android-btn-secondary android-profile__logout-btn"
                    onClick={handleLogout}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging out...' : 'Sign Out'}
                </button>
            </div>

            {/* App Info */}
            <footer className="android-profile__footer">
                <span className="android-profile__version">Nexflux v2.0.0</span>
            </footer>
        </div>
    );
};

export default AndroidProfile;
