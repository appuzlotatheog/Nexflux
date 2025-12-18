/**
 * Android Hero Carousel
 * Full-screen hero banner with swipeable featured content
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroCarousel.css';

const HeroCarousel = ({ items = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Auto-scroll every 6 seconds
    useEffect(() => {
        if (items.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [items.length]);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;

        if (diff > threshold) {
            // Swipe left - next
            setCurrentIndex(prev => (prev + 1) % items.length);
        } else if (diff < -threshold) {
            // Swipe right - previous
            setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
        }
    };

    const handleWatch = (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(`/watch/${item.media_type || 'movie'}/${item.id}`);
    };

    const handleDetails = (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(`/${item.media_type || 'movie'}/${item.id}`);
    };

    if (!items.length) return null;

    const current = items[currentIndex];
    const backdropUrl = current.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${current.backdrop_path}`
        : '';

    return (
        <section
            className="android-hero"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Image */}
            <div
                className="android-hero__backdrop"
                style={{ backgroundImage: `url(${backdropUrl})` }}
            />

            {/* Gradient Overlays */}
            <div className="android-hero__gradient-top" />
            <div className="android-hero__gradient-bottom" />

            {/* Content */}
            <div className="android-hero__content">
                {/* Type Badge */}
                <div className="android-hero__badges">
                    {current.vote_average > 0 && (
                        <span className="android-hero__badge android-hero__badge--rating">
                            ★ {current.vote_average.toFixed(1)}
                        </span>
                    )}
                    <span className="android-hero__badge">
                        {current.media_type === 'tv' ? 'TV Series' : 'Movie'}
                    </span>
                </div>

                {/* Title */}
                <h1 className="android-hero__title">
                    {current.title || current.name}
                </h1>

                {/* Overview */}
                <p className="android-hero__overview">
                    {current.overview?.slice(0, 150)}
                    {current.overview?.length > 150 ? '...' : ''}
                </p>

                {/* Action Buttons */}
                <div className="android-hero__actions">
                    <button
                        className="android-hero__btn android-hero__btn--primary"
                        onClick={() => handleWatch(current)}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        className="android-hero__btn android-hero__btn--secondary"
                        onClick={() => handleDetails(current)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        Info
                    </button>
                </div>
            </div>

            {/* Pagination Dots */}
            {items.length > 1 && (
                <div className="android-hero__dots">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`android-hero__dot ${index === currentIndex ? 'android-hero__dot--active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default HeroCarousel;
