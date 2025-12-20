/**
 * Android My List Page v9.0 - PREMIUM
 * Features:
 * - Smooth tab animation
 * - Swipe to remove (visual indicator)
 * - Empty state illustrations
 * - Count badges
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { getWatchlist, getFavorites, removeFromWatchlist, removeFromFavorites, isAuthenticated } from '../services/api';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

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

    const handleRemove = async (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        try {
            if (activeTab === 'watchlist') {
                await removeFromWatchlist(item.contentId, item.contentType);
                setWatchlist(prev => prev.filter(i => i.contentId !== item.contentId));
            } else {
                await removeFromFavorites(item.contentId, item.contentType);
                setFavorites(prev => prev.filter(i => i.contentId !== item.contentId));
            }
        } catch (e) { }
    };

    const items = activeTab === 'watchlist' ? watchlist : favorites;

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>My List</h1>
                <p style={styles.subtitle}>Your personal collection</p>
            </header>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                <div style={styles.tabs}>
                    <button
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setActiveTab('watchlist'); }}
                        style={{
                            ...styles.tab,
                            color: activeTab === 'watchlist' ? colors.text1 : colors.text4
                        }}
                    >
                        <span style={styles.tabIcon}>📑</span>
                        <span>Watchlist</span>
                        <span style={styles.tabCount}>{watchlist.length}</span>
                    </button>
                    <button
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setActiveTab('favorites'); }}
                        style={{
                            ...styles.tab,
                            color: activeTab === 'favorites' ? colors.text1 : colors.text4
                        }}
                    >
                        <span style={styles.tabIcon}>❤️</span>
                        <span>Favorites</span>
                        <span style={styles.tabCount}>{favorites.length}</span>
                    </button>
                </div>
                {/* Tab indicator */}
                <div style={{
                    ...styles.tabIndicator,
                    transform: `translateX(${activeTab === 'watchlist' ? '0%' : '100%'})`
                }} />
            </div>

            {/* Content */}
            <div style={styles.content}>
                {items.length > 0 ? (
                    <div style={styles.grid}>
                        {items.map((item, idx) => (
                            <div key={item.contentId || idx} style={styles.cardWrapper}>
                                <ContentCard
                                    id={item.contentId}
                                    type={item.contentType}
                                    title={item.title}
                                    posterPath={item.posterPath}
                                    size="md"
                                />
                                <button
                                    style={styles.removeBtn}
                                    onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.empty}>
                        <div style={styles.emptyIllustration}>
                            {activeTab === 'watchlist' ? '📑' : '❤️'}
                        </div>
                        <h3 style={styles.emptyTitle}>
                            {activeTab === 'watchlist' ? 'Your watchlist is empty' : 'No favorites yet'}
                        </h3>
                        <p style={styles.emptyText}>
                            {activeTab === 'watchlist'
                                ? 'Add movies and shows to watch later'
                                : 'Mark your favorite content to find them here'}
                        </p>
                        <button
                            style={styles.browseBtn}
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
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.bg1
    },
    spinner: {
        width: 48,
        height: 48,
        border: `3px solid ${colors.bg4}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    header: {
        padding: `${space.lg}px ${space.lg}px ${space.md}px`
    },
    title: {
        fontSize: typography.sizes.xxxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        margin: 0
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        marginTop: space.xs
    },
    tabsContainer: {
        position: 'relative',
        margin: `0 ${space.lg}px ${space.lg}px`,
        background: colors.bg3,
        borderRadius: radius.lg,
        overflow: 'hidden'
    },
    tabs: {
        display: 'flex',
        position: 'relative',
        zIndex: 2
    },
    tab: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: `${space.lg}px`,
        background: 'none',
        border: 'none',
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        transition: 'color 0.2s ease'
    },
    tabIcon: {
        fontSize: 16
    },
    tabCount: {
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        background: colors.bg5,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: '700'
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '50%',
        height: 3,
        background: colors.primary,
        borderRadius: 2,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    content: {
        padding: `0 ${space.lg}px`
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: space.md
    },
    cardWrapper: {
        position: 'relative'
    },
    removeBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        border: 'none',
        borderRadius: '50%',
        color: colors.text1,
        fontSize: 12,
        cursor: 'pointer',
        zIndex: 10
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${space.xxxl}px ${space.lg}px`,
        textAlign: 'center'
    },
    emptyIllustration: {
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg3,
        borderRadius: '50%',
        fontSize: 40,
        marginBottom: space.xl,
        opacity: 0.6
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
        marginBottom: space.xl,
        maxWidth: 280
    },
    browseBtn: {
        padding: `${space.lg}px ${space.xxl}px`,
        background: colors.primary,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        boxShadow: shadows.glow
    }
};

export default AndroidMyList;
