/**
 * Android Home Page v4.0
 * Uses a- prefix classes
 */
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadContent();
        if (isAuthenticated()) loadContinueWatching();
    }, []);

    const loadContent = async () => {
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
        } catch (e) { }
        setLoading(false);
    };

    const loadContinueWatching = async () => {
        try {
            const data = await getContinueWatching();
            if (data.success) setContinueWatching(data.continueWatching || []);
        } catch (e) { }
    };

    if (loading) {
        return (
            <div className="a-loading">
                <div className="a-spinner" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--a-bg-1)' }}>
            <HeroCarousel items={trending} />

            {continueWatching.length > 0 && (
                <ContentRow title="Continue Watching" items={continueWatching} showProgress />
            )}

            <ContentRow title="Popular Movies" items={popular} type="movie" />
            <ContentRow title="Popular TV Shows" items={tvShows} type="tv" />
            <ContentRow title="Top Rated" items={topRated} type="movie" />
        </div>
    );
};

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
