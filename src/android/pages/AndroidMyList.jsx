/**
 * Android My List Page v7.0
 * Premium tabs for watchlist and favorites
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import { colors, space, typography, shadows, radius, commonStyles } from '../styles/designSystem';

const AndroidMyList = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('watchlist');
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
        } catch (e) { }
        setLoading(false);
    };

    const items = activeTab === 'watchlist' ? watchlist : favorites;

    if (loading) {
        return (
            <div style={commonStyles.centerContainer}>
                <div style={commonStyles.spinner} />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>My List</h1>
            </header>

            {/* Tabs */}
            <div style={styles.tabs}>
                {[
                    { key: 'watchlist', label: 'Watchlist', count: watchlist.length },
                    { key: 'favorites', label: 'Favorites', count: favorites.length }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setActiveTab(tab.key); }}
                        style={{
                            ...styles.tab,
                            background: activeTab === tab.key ? colors.primary : colors.bg4,
                            boxShadow: activeTab === tab.key ? shadows.glow : 'none'
                        }}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={styles.content}>
                {items.length > 0 ? (
                    <div style={styles.grid}>
                        {items.map((item, idx) => (
                            <ContentCard
                                key={item.contentId || idx}
                                id={item.contentId}
                                type={item.contentType}
                                title={item.title}
                                posterPath={item.posterPath}
                                size="md"
                            />
                        ))}
                    </div>
                ) : (
                    <div style={styles.empty}>
                        <span style={styles.emptyIcon}>{activeTab === 'watchlist' ? '📑' : '❤️'}</span>
                        <h3 style={styles.emptyTitle}>No {activeTab} yet</h3>
                        <p style={styles.emptyText}>Start adding movies and series!</p>
                        <button
                            style={commonStyles.primaryButton}
                            onClick={() => navigate('/search')}
                        >
                            Browse Content
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: colors.bg1,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 120
    },
    header: {
        padding: `${space.lg}px ${space.lg}px ${space.md}px`
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        margin: 0
    },
    tabs: {
        display: 'flex',
        gap: space.sm,
        padding: `0 ${space.lg}px ${space.lg}px`
    },
    tab: {
        flex: 1,
        padding: `${space.md}px ${space.lg}px`,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        transition: 'all 200ms ease'
    },
    content: {
        padding: `0 ${space.lg}px`
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: space.md
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${space.xxxl}px ${space.lg}px`,
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: space.lg,
        opacity: 0.7
    },
    emptyTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text1,
        marginBottom: space.sm
    },
    emptyText: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        marginBottom: space.xl
    }
};

export default AndroidMyList;
