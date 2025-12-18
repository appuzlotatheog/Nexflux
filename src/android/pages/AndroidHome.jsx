/**
 * Android Home Page v3.0
 * Premium home with hero and content rows
 */
import React, { useState, useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ContentCard from '../components/ContentCard';
import { getContinueWatching, isAuthenticated } from '../services/api';
import '../styles/theme.css';
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

    useEffect(() => {
        loadContent();
        if (isAuthenticated()) {
            loadContinueWatching();
        }
    }, []);

    const loadContent = async () => {
        try {
            const [trendingRes, popularRes, topRatedRes, tvRes] = await Promise.all([
                fetch(`${TMDB_BASE}/trending/all/day?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}`),
            ]);

            const [trendingData, popularData, topRatedData, tvData] = await Promise.all([
                trendingRes.json(),
                popularRes.json(),
                topRatedRes.json(),
                tvRes.json(),
            ]);

            setTrending(trendingData.results?.slice(0, 5) || []);
            setPopular(popularData.results || []);
            setTopRated(topRatedData.results || []);
            setTvShows(tvData.results || []);
        } catch (err) {
            console.error('Failed to load content:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadContinueWatching = async () => {
        try {
            const data = await getContinueWatching();
            if (data.success) {
                setContinueWatching(data.continueWatching || []);
            }
        } catch (err) {
            console.error('Failed to load continue watching:', err);
        }
    };

    if (loading) {
        return (
            <div className="nx-loading">
                <div className="nx-spinner" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--nx-bg-primary)' }}>
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
        </div>
    );
};

// Content Row Component
const ContentRow = ({ title, items, type, showProgress }) => {
    if (!items.length) return null;

    return (
        <section className="nx-content-row">
            <header className="nx-content-row__header">
                <h2 className="nx-content-row__title">{title}</h2>
            </header>
            <div className="nx-content-row__scroll">
                {items.slice(0, 20).map((item, idx) => (
                    <ContentCard
                        key={item.id || item.contentId || idx}
                        id={item.contentId || item.id}
                        type={item.contentType || item.media_type || type || 'movie'}
                        title={item.title || item.name}
                        posterPath={item.posterPath || item.poster_path}
                        rating={item.vote_average || 0}
                        year={item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                        progress={showProgress && item.duration ? Math.round((item.progress / item.duration) * 100) : 0}
                        size="md"
                    />
                ))}
            </div>
        </section>
    );
};

export default AndroidHome;
