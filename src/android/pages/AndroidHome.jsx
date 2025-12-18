/**
 * Android Home Page
 * Premium home screen with hero carousel and content rows
 */
import React, { useState, useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import AndroidContentCard from '../components/ContentCard';
import { getContinueWatching, isAuthenticated } from '../services/api';
import './AndroidHome.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidHome = () => {
    const [trending, setTrending] = useState([]);
    const [popular, setPopular] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchContent();
        if (isAuthenticated()) {
            fetchContinueWatching();
        }
    }, []);

    const fetchContent = async () => {
        try {
            const [trendingRes, popularRes, topRatedRes, newReleasesRes] = await Promise.all([
                fetch(`${TMDB_BASE}/trending/all/day?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}`),
            ]);

            const [trendingData, popularData, topRatedData, newReleasesData] = await Promise.all([
                trendingRes.json(),
                popularRes.json(),
                topRatedRes.json(),
                newReleasesRes.json(),
            ]);

            setTrending(trendingData.results?.slice(0, 5) || []);
            setPopular(popularData.results || []);
            setTopRated(topRatedData.results || []);
            setNewReleases(newReleasesData.results || []);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchContinueWatching = async () => {
        try {
            const data = await getContinueWatching();
            if (data.success) {
                setContinueWatching(data.continueWatching || []);
            }
        } catch (error) {
            console.error('Error fetching continue watching:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="android-home android-home--loading">
                <div className="android-home__skeleton-hero" />
                <div className="android-home__skeleton-row">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="android-home__skeleton-card android-skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="android-home">
            {/* Hero Carousel */}
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

            {/* Top Rated */}
            <ContentRow title="Top Rated" items={topRated} type="movie" />

            {/* New Releases */}
            <ContentRow title="New Releases" items={newReleases} type="movie" />
        </div>
    );
};

// Content Row Component
const ContentRow = ({ title, items, type, showProgress }) => {
    if (!items.length) return null;

    return (
        <section className="android-content-row">
            <header className="android-content-row__header">
                <h2 className="android-content-row__title">{title}</h2>
            </header>
            <div className="android-content-row__scroll android-scroll-hide">
                {items.map((item, index) => (
                    <AndroidContentCard
                        key={item.id || index}
                        id={item.contentId || item.id}
                        type={item.contentType || item.media_type || type || 'movie'}
                        title={item.title || item.name}
                        posterPath={item.posterPath || item.poster_path}
                        rating={item.vote_average || 0}
                        year={item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                        progress={showProgress ? Math.round((item.progress / item.duration) * 100) : 0}
                    />
                ))}
            </div>
        </section>
    );
};

export default AndroidHome;
