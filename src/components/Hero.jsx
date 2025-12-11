import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBackdropUrl, getTrending, getGenres } from '../api/tmdb';
import './Hero.css';

function Hero() {
    const [featured, setFeatured] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [items, setItems] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [genres, setGenres] = useState({});

    // Fetch genres for display
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const [movieGenres, tvGenres] = await Promise.all([
                    getGenres('movie'),
                    getGenres('tv')
                ]);
                const genreMap = {};
                [...(movieGenres.genres || []), ...(tvGenres.genres || [])].forEach(g => {
                    genreMap[g.id] = g.name;
                });
                setGenres(genreMap);
            } catch (error) {
                console.error('Failed to fetch genres:', error);
            }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const data = await getTrending('all', 'day');
                const filtered = data.results
                    .filter(item => item.backdrop_path && item.overview)
                    .slice(0, 5);
                setItems(filtered);
                if (filtered.length > 0) {
                    setFeatured(filtered[0]);
                    setTimeout(() => setIsVisible(true), 100);
                }
            } catch (error) {
                console.error('Failed to fetch featured:', error);
            }
        };
        fetchFeatured();
    }, []);

    // Progress bar timer
    useEffect(() => {
        if (items.length === 0 || isPaused) return;

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    // Switch to next
                    setIsVisible(false);
                    setTimeout(() => {
                        setCurrentIndex(i => {
                            const next = (i + 1) % items.length;
                            setFeatured(items[next]);
                            return next;
                        });
                        setIsVisible(true);
                    }, 400);
                    return 0;
                }
                return prev + 1.25; // 8 seconds = (100 / 8000ms * 100ms)
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, [items, isPaused]);

    const handleIndicatorClick = (index) => {
        if (index === currentIndex) return;
        setIsVisible(false);
        setProgress(0);
        setTimeout(() => {
            setCurrentIndex(index);
            setFeatured(items[index]);
            setIsVisible(true);
        }, 300);
    };

    if (!featured) {
        return (
            <div className="hero hero--loading">
                <div className="hero__skeleton">
                    <div className="skeleton hero__skeleton-title"></div>
                    <div className="skeleton hero__skeleton-desc"></div>
                    <div className="skeleton hero__skeleton-btn"></div>
                </div>
            </div>
        );
    }

    const mediaType = featured.media_type || (featured.first_air_date ? 'tv' : 'movie');
    const title = featured.title || featured.name;
    const rating = featured.vote_average ? Math.round(featured.vote_average * 10) : null;
    const featuredGenres = (featured.genre_ids || []).slice(0, 3).map(id => genres[id]).filter(Boolean);

    return (
        <div
            className="hero"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className={`hero__backdrop ${isVisible ? 'hero__backdrop--visible' : ''}`}
                style={{ backgroundImage: `url(${getBackdropUrl(featured.backdrop_path)})` }}
            />
            <div className="hero__gradient" />
            <div className="hero__vignette" />
            <div className="hero__grain" />

            <div className={`hero__content container ${isVisible ? 'hero__content--visible' : ''}`}>
                <div className="hero__badges">
                    <span className="badge badge-top10">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        TOP 10
                    </span>
                    <span className="badge badge-hd">4K</span>
                    {isPaused && <span className="badge badge-paused">⏸ PAUSED</span>}
                </div>

                <h1 className="hero__title">{title}</h1>

                <div className="hero__meta">
                    {rating && (
                        <span className={`hero__rating ${rating >= 70 ? 'hero__rating--good' : rating >= 50 ? 'hero__rating--average' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            {rating}%
                        </span>
                    )}
                    <span className="hero__year">
                        {(featured.release_date || featured.first_air_date || '').split('-')[0]}
                    </span>
                    <span className="hero__type">
                        {mediaType === 'movie' ? '🎬 Movie' : '📺 Series'}
                    </span>
                </div>

                {/* Genre Tags */}
                {featuredGenres.length > 0 && (
                    <div className="hero__genres">
                        {featuredGenres.map((genre, i) => (
                            <span key={i} className="hero__genre-tag">{genre}</span>
                        ))}
                    </div>
                )}

                <p className="hero__description">{featured.overview}</p>

                <div className="hero__actions">
                    <Link
                        to={`/watch/${mediaType}/${featured.id}${mediaType === 'tv' ? '/1/1' : ''}`}
                        className="btn btn-play"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play Now
                    </Link>
                    <Link
                        to={`/details/${mediaType}/${featured.id}`}
                        className="btn btn-secondary"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        </svg>
                        More Info
                    </Link>
                </div>

                {/* Progress Indicators */}
                <div className="hero__indicators">
                    {items.map((item, index) => (
                        <button
                            key={item.id}
                            className={`hero__indicator ${index === currentIndex ? 'hero__indicator--active' : ''}`}
                            onClick={() => handleIndicatorClick(index)}
                            aria-label={`View ${item.title || item.name}`}
                        >
                            {index === currentIndex && (
                                <div
                                    className="hero__indicator-progress"
                                    style={{ width: `${progress}%` }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Hero;
