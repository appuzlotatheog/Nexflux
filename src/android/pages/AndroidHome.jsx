/**
 * Android Home Page v9.0 - PREMIUM
 * Features:
 * - Skeleton loading screens
 * - Pull-to-refresh
 * - Better section headers
 * - Scroll animations
 * - Continue watching prominent
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ContentCard from '../components/ContentCard';
import { getContinueWatching, isAuthenticated } from '../services/api';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidHome = () => {
    const [trending, setTrending] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [popularTV, setPopularTV] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [actionMovies, setActionMovies] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const containerRef = useRef(null);
    const touchStartY = useRef(0);

    useEffect(() => {
        loadAllContent();
        if (isAuthenticated()) loadContinueWatching();
    }, []);

    const loadAllContent = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [trend, movies, tv, top, action] = await Promise.all([
                fetch(`${TMDB_BASE}/trending/all/day?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc`).then(r => r.json()),
            ]);

            setTrending(trend.results?.slice(0, 5) || []);
            setPopularMovies(movies.results || []);
            setPopularTV(tv.results || []);
            setTopRated(top.results || []);
            setActionMovies(action.results || []);

            if (isRefresh && navigator.vibrate) navigator.vibrate(10);
        } catch (e) {
            setError('Failed to load content');
        }

        setLoading(false);
        setRefreshing(false);
    };

    const loadContinueWatching = async () => {
        try {
            const data = await getContinueWatching();
            if (data.success) setContinueWatching(data.continueWatching || []);
        } catch (e) { }
    };

    // Pull-to-refresh
    const handleTouchStart = (e) => {
        if (containerRef.current?.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchEnd = (e) => {
        const pullDistance = e.changedTouches[0].clientY - touchStartY.current;
        if (pullDistance > 80 && !refreshing && containerRef.current?.scrollTop === 0) {
            loadAllContent(true);
        }
        touchStartY.current = 0;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div style={styles.page}>
                {/* Hero skeleton */}
                <div style={styles.heroSkeleton}>
                    <div style={styles.shimmer} />
                </div>

                {/* Row skeletons */}
                {[1, 2, 3].map(i => (
                    <div key={i} style={styles.rowSkeleton}>
                        <div style={styles.rowTitleSkeleton} />
                        <div style={styles.cardRow}>
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} style={styles.cardSkeleton}>
                                    <div style={styles.shimmer} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={styles.errorContainer}>
                <span style={{ fontSize: 56, marginBottom: 16 }}>📡</span>
                <h2 style={styles.errorTitle}>Connection Problem</h2>
                <p style={styles.errorText}>{error}</p>
                <button style={styles.retryBtn} onClick={() => loadAllContent()}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={styles.page}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to refresh indicator */}
            {refreshing && (
                <div style={styles.refreshIndicator}>
                    <div style={styles.spinner} />
                    <span>Refreshing...</span>
                </div>
            )}

            {/* Hero Carousel */}
            <HeroCarousel items={trending} />

            {/* Continue Watching - Prominent */}
            {continueWatching.length > 0 && (
                <ContentRow
                    title="Continue Watching"
                    subtitle="Pick up where you left off"
                    items={continueWatching}
                    showProgress
                    size="lg"
                />
            )}

            {/* Popular Movies */}
            <ContentRow
                title="Popular Movies"
                subtitle="Trending this week"
                items={popularMovies}
                type="movie"
            />

            {/* Popular TV Shows */}
            <ContentRow
                title="Popular TV Shows"
                items={popularTV}
                type="tv"
            />

            {/* Action Movies */}
            <ContentRow
                title="Action & Adventure"
                items={actionMovies}
                type="movie"
            />

            {/* Top Rated */}
            <ContentRow
                title="Top Rated"
                subtitle="Critically acclaimed"
                items={topRated}
                type="movie"
            />

            {/* Footer */}
            <div style={styles.footer}>
                <p style={styles.footerText}>Pull down to refresh</p>
            </div>
        </div>
    );
};

// Content Row Component with improved design
const ContentRow = ({ title, subtitle, items, type, showProgress, size = 'md' }) => {
    if (!items.length) return null;

    return (
        <section style={styles.section}>
            <header style={styles.sectionHeader}>
                <div>
                    <h2 style={styles.sectionTitle}>{title}</h2>
                    {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
                </div>
                <button style={styles.seeAllBtn}>See All</button>
            </header>
            <div style={styles.rowScroll} className="hide-scrollbar">
                {items.slice(0, 20).map((item, idx) => (
                    <ContentCard
                        key={item.id || item.contentId || idx}
                        id={item.contentId || item.id}
                        type={item.contentType || item.media_type || type || 'movie'}
                        title={item.title || item.name}
                        posterPath={item.posterPath || item.poster_path}
                        rating={item.vote_average || 0}
                        year={(item.release_date || item.first_air_date)?.split('-')[0]}
                        progress={showProgress && item.duration ? Math.round((item.progress / item.duration) * 100) : 0}
                        size={size}
                        animate={true}
                    />
                ))}
            </div>
        </section>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: colors.bg1,
        paddingBottom: 'max(110px, calc(env(safe-area-inset-bottom) + 100px))',
        overflowY: 'auto'
    },
    // Loading skeletons
    heroSkeleton: {
        width: '100%',
        height: '70vh',
        background: colors.bg2,
        overflow: 'hidden',
        position: 'relative'
    },
    rowSkeleton: {
        padding: `${space.xl}px 0`,
        paddingLeft: space.lg
    },
    rowTitleSkeleton: {
        width: 150,
        height: 24,
        background: colors.bg3,
        borderRadius: 6,
        marginBottom: space.md
    },
    cardRow: {
        display: 'flex',
        gap: space.md,
        paddingRight: space.lg
    },
    cardSkeleton: {
        width: 140,
        aspectRatio: '2/3',
        borderRadius: radius.lg,
        background: colors.bg3,
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative'
    },
    shimmer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(90deg, ${colors.bg2} 25%, ${colors.bg3} 50%, ${colors.bg2} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
    },
    // Error
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: space.xl,
        background: colors.bg1,
        textAlign: 'center'
    },
    errorTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        marginBottom: space.sm
    },
    errorText: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        marginBottom: space.xl
    },
    retryBtn: {
        padding: `${space.lg}px ${space.xxl}px`,
        background: colors.primary,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        cursor: 'pointer',
        boxShadow: shadows.glow
    },
    // Refresh
    refreshIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        padding: space.lg,
        background: colors.bg2,
        color: colors.text3,
        fontSize: typography.sizes.sm
    },
    spinner: {
        width: 20,
        height: 20,
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    // Section
    section: {
        marginBottom: space.xl
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: `0 ${space.lg}px ${space.md}px`
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        margin: 0
    },
    sectionSubtitle: {
        fontSize: typography.sizes.xs,
        color: colors.text4,
        margin: 0,
        marginTop: 2
    },
    seeAllBtn: {
        background: 'none',
        border: 'none',
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer'
    },
    rowScroll: {
        display: 'flex',
        gap: space.md,
        padding: `${space.xs}px ${space.lg}px`,
        overflowX: 'auto',
        scrollSnapType: 'x proximity',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },
    footer: {
        padding: `${space.xxl}px ${space.lg}px`,
        textAlign: 'center'
    },
    footerText: {
        fontSize: typography.sizes.xs,
        color: colors.text4
    }
};

// Add animations
if (typeof document !== 'undefined') {
    const styleId = 'home-page-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `;
        document.head.appendChild(style);
    }
}

export default AndroidHome;
