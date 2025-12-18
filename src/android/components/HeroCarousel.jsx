/**
 * Android Hero Carousel v4.0
 * Uses a- prefix classes
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/android.css';

const HeroCarousel = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const touchStart = useRef(0);
    const touchEnd = useRef(0);

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
        if (diff > 60) setCurrent(prev => (prev + 1) % items.length);
        else if (diff < -60) setCurrent(prev => (prev - 1 + items.length) % items.length);
    };

    const handlePlay = (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        if (type === 'tv') navigate(`/watch/tv/${item.id}/1/1`);
        else navigate(`/watch/movie/${item.id}`);
    };

    const handleInfo = (item) => {
        if (navigator.vibrate) navigator.vibrate(10);
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        navigate(`/${type}/${item.id}`);
    };

    if (!items.length) return null;

    const item = items[current];
    const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '';

    return (
        <section
            className="a-hero"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="a-hero__bg" style={{ backgroundImage: `url(${backdrop})` }} key={item.id} />
            <div className="a-hero__gradient-top" />
            <div className="a-hero__gradient-bottom" />

            <div className="a-hero__content a-slide-up">
                <div className="a-hero__badges">
                    {item.vote_average > 0 && (
                        <span className="a-hero__badge a-hero__badge--gold">★ {item.vote_average.toFixed(1)}</span>
                    )}
                    <span className="a-hero__badge">{item.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
                </div>

                <h1 className="a-hero__title">{item.title || item.name}</h1>
                <p className="a-hero__desc">{item.overview?.slice(0, 150)}{item.overview?.length > 150 ? '...' : ''}</p>

                <div className="a-hero__actions">
                    <button className="a-hero__btn a-hero__btn--play" onClick={() => handlePlay(item)}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        Play
                    </button>
                    <button className="a-hero__btn a-hero__btn--info" onClick={() => handleInfo(item)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                        </svg>
                        Info
                    </button>
                </div>

                {items.length > 1 && (
                    <div className="a-hero__dots">
                        {items.slice(0, 5).map((_, i) => (
                            <button
                                key={i}
                                className={`a-hero__dot ${i === current ? 'a-hero__dot--active' : ''}`}
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
