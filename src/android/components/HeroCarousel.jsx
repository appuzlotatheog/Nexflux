/**
 * Android Hero Carousel v3.0
 * Premium full-screen hero with Ken Burns effect
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';
import '../styles/android.css';

const HeroCarousel = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const touchStart = useRef(0);
    const touchEnd = useRef(0);

    // Auto-scroll
    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % items.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [items.length]);

    const handleTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        touchEnd.current = e.changedTouches[0].clientX;
        const diff = touchStart.current - touchEnd.current;
        if (diff > 60) {
            setCurrent(prev => (prev + 1) % items.length);
        } else if (diff < -60) {
            setCurrent(prev => (prev - 1 + items.length) % items.length);
        }
    };

    const handlePlay = (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        if (mediaType === 'tv') {
            navigate(`/watch/tv/${item.id}/1/1`);
        } else {
            navigate(`/watch/movie/${item.id}`);
        }
    };

    const handleInfo = (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        navigate(`/${mediaType}/${item.id}`);
    };

    if (!items.length) return null;

    const item = items[current];
    const backdrop = item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : '';

    return (
        <section
            className="nx-hero"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background with Ken Burns */}
            <div
                className="nx-hero__bg"
                style={{ backgroundImage: `url(${backdrop})` }}
                key={item.id}
            />

            {/* Gradients */}
            <div className="nx-hero__gradient-top" />
            <div className="nx-hero__gradient-bottom" />

            {/* Content */}
            <div className="nx-hero__content nx-slide-up">
                {/* Badges */}
                <div className="nx-hero__badges">
                    {item.vote_average > 0 && (
                        <span className="nx-hero__badge nx-hero__badge--rating">
                            ★ {item.vote_average.toFixed(1)}
                        </span>
                    )}
                    <span className="nx-hero__badge">
                        {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                    </span>
                </div>

                {/* Title */}
                <h1 className="nx-hero__title">
                    {item.title || item.name}
                </h1>

                {/* Overview */}
                <p className="nx-hero__overview">
                    {item.overview?.slice(0, 150)}{item.overview?.length > 150 ? '...' : ''}
                </p>

                {/* Actions */}
                <div className="nx-hero__actions">
                    <button
                        className="nx-hero__btn nx-hero__btn--play"
                        onClick={() => handlePlay(item)}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        className="nx-hero__btn nx-hero__btn--info"
                        onClick={() => handleInfo(item)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        Info
                    </button>
                </div>

                {/* Dots */}
                {items.length > 1 && (
                    <div className="nx-hero__dots">
                        {items.slice(0, 5).map((_, i) => (
                            <button
                                key={i}
                                className={`nx-hero__dot ${i === current ? 'nx-hero__dot--active' : ''}`}
                                onClick={() => setCurrent(i)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroCarousel;
