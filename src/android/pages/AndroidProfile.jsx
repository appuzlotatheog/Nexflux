/**
 * Android Profile Page v3.0
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, isAuthenticated, getWatchlist, getFavorites, getContinueWatching } from '../services/api';
import '../styles/theme.css';
import '../styles/android.css';

const AndroidProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ watchlist: 0, favorites: 0, watching: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [navigate]);

    const loadProfile = async () => {
        try {
            const [profileRes, wlRes, favRes, cwRes] = await Promise.all([
                getProfile(),
                getWatchlist(),
                getFavorites(),
                getContinueWatching()
            ]);
            if (profileRes.success) setUser(profileRes.user);
            setStats({
                watchlist: wlRes.watchlist?.length || 0,
                favorites: favRes.favorites?.length || 0,
                watching: cwRes.continueWatching?.length || 0
            });
        } catch (err) { }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="nx-loading">
                <div className="nx-spinner" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--nx-bg-primary)', padding: 'var(--nx-md)', paddingTop: 'calc(var(--nx-safe-top) + var(--nx-lg))' }}>
            {/* Profile Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--nx-xl)' }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--nx-primary), var(--nx-primary-dark))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    marginBottom: 'var(--nx-md)',
                    boxShadow: 'var(--nx-shadow-glow)'
                }}>
                    👤
                </div>
                <h1 style={{ fontSize: 'var(--nx-font-2xl)', fontWeight: 800 }}>{user?.username || 'User'}</h1>
                <p style={{ color: 'var(--nx-text-muted)', fontSize: 'var(--nx-font-sm)' }}>{user?.email}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--nx-md)', marginBottom: 'var(--nx-xl)' }}>
                <div style={{ background: 'var(--nx-bg-card)', borderRadius: 'var(--nx-radius-md)', padding: 'var(--nx-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--nx-font-xl)', fontWeight: 800, color: 'var(--nx-primary)' }}>{stats.watchlist}</div>
                    <div style={{ fontSize: 'var(--nx-font-xs)', color: 'var(--nx-text-muted)' }}>Watchlist</div>
                </div>
                <div style={{ background: 'var(--nx-bg-card)', borderRadius: 'var(--nx-radius-md)', padding: 'var(--nx-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--nx-font-xl)', fontWeight: 800, color: 'var(--nx-primary)' }}>{stats.favorites}</div>
                    <div style={{ fontSize: 'var(--nx-font-xs)', color: 'var(--nx-text-muted)' }}>Favorites</div>
                </div>
                <div style={{ background: 'var(--nx-bg-card)', borderRadius: 'var(--nx-radius-md)', padding: 'var(--nx-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--nx-font-xl)', fontWeight: 800, color: 'var(--nx-primary)' }}>{stats.watching}</div>
                    <div style={{ fontSize: 'var(--nx-font-xs)', color: 'var(--nx-text-muted)' }}>Watching</div>
                </div>
            </div>

            {/* Menu */}
            <div style={{ background: 'var(--nx-bg-card)', borderRadius: 'var(--nx-radius-md)', overflow: 'hidden', marginBottom: 'var(--nx-lg)' }}>
                <button
                    onClick={() => navigate('/my-list')}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--nx-md)', width: '100%', padding: 'var(--nx-md)', background: 'none', border: 'none', borderBottom: '1px solid var(--nx-glass-border)', color: 'var(--nx-text-primary)', fontSize: 'var(--nx-font-md)', textAlign: 'left', cursor: 'pointer' }}
                >
                    <span>📑</span>
                    My List
                    <span style={{ marginLeft: 'auto', color: 'var(--nx-text-muted)' }}>›</span>
                </button>
                <button
                    onClick={() => navigate('/search')}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--nx-md)', width: '100%', padding: 'var(--nx-md)', background: 'none', border: 'none', color: 'var(--nx-text-primary)', fontSize: 'var(--nx-font-md)', textAlign: 'left', cursor: 'pointer' }}
                >
                    <span>🔍</span>
                    Search
                    <span style={{ marginLeft: 'auto', color: 'var(--nx-text-muted)' }}>›</span>
                </button>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="nx-btn"
                style={{ width: '100%', background: 'rgba(255, 82, 82, 0.15)', color: '#FF5252', border: '1px solid rgba(255, 82, 82, 0.3)' }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default AndroidProfile;
