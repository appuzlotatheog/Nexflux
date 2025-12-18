/**
 * Android My List Page v3.0
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import '../styles/theme.css';
import '../styles/android.css';

const AndroidMyList = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('watchlist');
    const [watchlist, setWatchlist] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [wl, fav] = await Promise.all([getWatchlist(), getFavorites()]);
            if (wl.success) setWatchlist(wl.watchlist || []);
            if (fav.success) setFavorites(fav.favorites || []);
        } catch (err) { }
        setLoading(false);
    };

    const items = tab === 'watchlist' ? watchlist : favorites;

    if (loading) {
        return (
            <div className="nx-loading">
                <div className="nx-spinner" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--nx-bg-primary)', padding: 'var(--nx-md)', paddingTop: 'calc(var(--nx-safe-top) + var(--nx-lg))' }}>
            <h1 style={{ fontSize: 'var(--nx-font-2xl)', fontWeight: 800, marginBottom: 'var(--nx-lg)' }}>My List</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--nx-sm)', marginBottom: 'var(--nx-lg)' }}>
                <button
                    onClick={() => setTab('watchlist')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: tab === 'watchlist' ? 'var(--nx-primary)' : 'var(--nx-bg-elevated)',
                        border: 'none',
                        borderRadius: 'var(--nx-radius-md)',
                        color: tab === 'watchlist' ? 'white' : 'var(--nx-text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Watchlist ({watchlist.length})
                </button>
                <button
                    onClick={() => setTab('favorites')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: tab === 'favorites' ? 'var(--nx-primary)' : 'var(--nx-bg-elevated)',
                        border: 'none',
                        borderRadius: 'var(--nx-radius-md)',
                        color: tab === 'favorites' ? 'white' : 'var(--nx-text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Favorites ({favorites.length})
                </button>
            </div>

            {/* Content */}
            {items.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--nx-md)' }}>
                    {items.map((item, idx) => (
                        <ContentCard
                            key={item.contentId || idx}
                            id={item.contentId}
                            type={item.contentType}
                            title={item.title}
                            posterPath={item.posterPath}
                            size="sm"
                        />
                    ))}
                </div>
            ) : (
                <div className="nx-empty">
                    <span className="nx-empty-icon">{tab === 'watchlist' ? '📑' : '❤️'}</span>
                    <h3 className="nx-empty-title">No {tab} yet</h3>
                    <p className="nx-empty-text">Start adding movies and shows!</p>
                    <button
                        className="nx-btn nx-btn-primary"
                        onClick={() => navigate('/search')}
                        style={{ marginTop: 'var(--nx-lg)' }}
                    >
                        Browse Content
                    </button>
                </div>
            )}
        </div>
    );
};

export default AndroidMyList;
