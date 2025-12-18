/**
 * Android Profile Page v4.0
 * Uses a- prefix classes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, isAuthenticated, getWatchlist, getFavorites, getContinueWatching } from '../services/api';
import '../styles/android.css';

const AndroidProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ watchlist: 0, favorites: 0, watching: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) { navigate('/login'); return; }
        loadProfile();
    }, [navigate]);

    const loadProfile = async () => {
        try {
            const [p, wl, fav, cw] = await Promise.all([getProfile(), getWatchlist(), getFavorites(), getContinueWatching()]);
            if (p.success) setUser(p.user);
            setStats({
                watchlist: wl.watchlist?.length || 0,
                favorites: fav.favorites?.length || 0,
                watching: cw.continueWatching?.length || 0
            });
        } catch (e) { }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="a-loading"><div className="a-spinner" /></div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--a-bg-1)', padding: 'var(--a-4)', paddingTop: 'calc(var(--a-safe-t) + var(--a-6))' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--a-8)' }}>
                <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--a-primary), var(--a-primary-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px', marginBottom: 'var(--a-4)',
                    boxShadow: 'var(--a-glow)'
                }}>👤</div>
                <h1 style={{ fontSize: 'var(--a-fs-2xl)', fontWeight: 800 }}>{user?.username || 'User'}</h1>
                <p style={{ color: 'var(--a-text-4)', fontSize: 'var(--a-fs-sm)' }}>{user?.email}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--a-3)', marginBottom: 'var(--a-6)' }}>
                {[
                    { label: 'Watchlist', value: stats.watchlist },
                    { label: 'Favorites', value: stats.favorites },
                    { label: 'Watching', value: stats.watching }
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--a-bg-3)', borderRadius: 'var(--a-r-md)', padding: 'var(--a-4)', textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--a-fs-xl)', fontWeight: 800, color: 'var(--a-primary)' }}>{s.value}</div>
                        <div style={{ fontSize: 'var(--a-fs-xs)', color: 'var(--a-text-4)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Menu */}
            <div style={{ background: 'var(--a-bg-3)', borderRadius: 'var(--a-r-md)', overflow: 'hidden', marginBottom: 'var(--a-5)' }}>
                {[
                    { icon: '📑', label: 'My List', path: '/my-list' },
                    { icon: '🔍', label: 'Search', path: '/search' }
                ].map((item, idx) => (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--a-4)', width: '100%',
                            padding: 'var(--a-4)', background: 'none',
                            border: 'none', borderBottom: idx === 0 ? '1px solid var(--a-border)' : 'none',
                            color: 'var(--a-text-2)', fontSize: 'var(--a-fs-md)', textAlign: 'left', cursor: 'pointer'
                        }}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                        <span style={{ marginLeft: 'auto', color: 'var(--a-text-4)' }}>›</span>
                    </button>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="a-btn"
                style={{ width: '100%', background: 'rgba(255, 69, 58, 0.15)', color: '#FF453A', border: '1px solid rgba(255, 69, 58, 0.3)' }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default AndroidProfile;
