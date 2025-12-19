/**
 * Android Home Page v5.0
 * Premium home with pull-to-refresh and better loading
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ContentCard from '../components/ContentCard';
import { getContinueWatching, isAuthenticated } from '../services/api';
import '../styles/android.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidHome = () => {
    const [trending, setTrending] = useState([]);
    const [popular, setPopular] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [tvShows, setTvShows] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const containerRef = useRef(null);
    const touchStartY = useRef(0);
    const pullDistance = useRef(0);

    useEffect(() => {
        loadContent();
        if (isAuthenticated()) loadContinueWatching();
    }, []);

    const loadContent = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [t, p, r, tv] = await Promise.all([
                fetch(`${TMDB_BASE}/trending/all/day?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}`).then(r => r.json()),
            ]);
            setTrending(t.results?.slice(0, 5) || []);
            setPopular(p.results || []);
            setTopRated(r.results || []);
            setTvShows(tv.results || []);

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

    // Pull to refresh handlers
    const handleTouchStart = useCallback((e) => {
        if (containerRef.current?.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (touchStartY.current > 0 && containerRef.current?.scrollTop === 0) {
            pullDistance.current = e.touches[0].clientY - touchStartY.current;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (pullDistance.current > 80 && !refreshing) {
            loadContent(true);
        }
        touchStartY.current = 0;
        pullDistance.current = 0;
    }, [refreshing]);

    if (loading) {
        return (
            <div className="a-loading">
                <div className="a-spinner" />
                <p style={{ color: 'var(--a-text-4)', marginTop: 16, fontSize: 14 }}>Loading your content...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="a-error">
                <span className="a-error__icon">😕</span>
                <h2 className="a-error__title">{error}</h2>
                <p className="a-error__text">Check your internet connection</p>
                <button className="a-btn a-btn--primary" onClick={() => loadContent()}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{ minHeight: '100vh', background: 'var(--a-bg-1)', overflowY: 'auto' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to refresh indicator */}
            {refreshing && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    gap: 8
                }}>
                    <div className="a-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                    <span style={{ color: 'var(--a-text-3)', fontSize: 13 }}>Refreshing...</span>
                </div>
            )}

            {/* Hero */}
            <HeroCarousel items={trending} />

            {/* Continue Watching */}
            {continueWatching.length > 0 && (
                <ContentRow
                    title="Continue Watching"
                    items={continueWatching}
                    showProgress
                />
            )}

            {/* Popular Movies */}
            <ContentRow title="Popular Movies" items={popular} type="movie" />

            {/* Popular TV */}
            <ContentRow title="Popular TV Shows" items={tvShows} type="tv" />

            {/* Top Rated */}
            <ContentRow title="Top Rated" items={topRated} type="movie" />

            {/* More content coming soon */}
            <div style={{
                padding: '32px 16px 80px',
                textAlign: 'center',
                color: 'var(--a-text-4)',
                fontSize: 13
            }}>
                More content coming soon • Pull down to refresh
            </div>
        </div>
    );
};

// Content Row with skeleton loading
const ContentRow = ({ title, items, type, showProgress }) => {
    if (!items.length) return null;
    return (
        <section className="a-row">
            <header className="a-row__header">
                <h2 className="a-row__title">{title}</h2>
            </header>
            <div className="a-row__scroll">
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
                        size="md"
                    />
                ))}
            </div>
        </section>
    );
};

export default AndroidHome;
