/**
 * Android My List Page v4.0
 * Uses a- prefix classes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import '../styles/android.css';

const AndroidMyList = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('watchlist');
    const [watchlist, setWatchlist] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) { navigate('/login'); return; }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [wl, fav] = await Promise.all([getWatchlist(), getFavorites()]);
            if (wl.success) setWatchlist(wl.watchlist || []);
            if (fav.success) setFavorites(fav.favorites || []);
        } catch (e) { }
        setLoading(false);
    };

    const items = tab === 'watchlist' ? watchlist : favorites;

    if (loading) return <div className="a-loading"><div className="a-spinner" /></div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--a-bg-1)', padding: 'var(--a-4)', paddingTop: 'calc(var(--a-safe-t) + var(--a-6))' }}>
            <h1 style={{ fontSize: 'var(--a-fs-2xl)', fontWeight: 800, marginBottom: 'var(--a-5)' }}>My List</h1>

            <div style={{ display: 'flex', gap: 'var(--a-2)', marginBottom: 'var(--a-5)' }}>
                {['watchlist', 'favorites'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`a-btn ${tab === t ? 'a-btn--primary' : 'a-btn--secondary'}`}
                        style={{ flex: 1 }}
                    >
                        {t === 'watchlist' ? `Watchlist (${watchlist.length})` : `Favorites (${favorites.length})`}
                    </button>
                ))}
            </div>

            {items.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--a-3)' }}>
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
                <div className="a-empty">
                    <span className="a-empty__icon">{tab === 'watchlist' ? '📑' : '❤️'}</span>
                    <h3 className="a-empty__title">No {tab} yet</h3>
                    <p className="a-empty__text">Start adding movies and shows!</p>
                    <button className="a-btn a-btn--primary" style={{ marginTop: 'var(--a-5)' }} onClick={() => navigate('/search')}>
                        Browse Content
                    </button>
                </div>
            )}
        </div>
    );
};

export default AndroidMyList;
