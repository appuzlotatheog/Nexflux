/**
 * Android Hero Carousel v8.0
 * Premium hero with better transitions
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, space, typography, shadows, radius, duration } from '../styles/designSystem';

const HeroCarousel = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState({});
    const navigate = useNavigate();
    const touchStartX = useRef(0);
    const autoScrollRef = useRef(null);

    // Preload images
    useEffect(() => {
        items.forEach((item, idx) => {
            if (item.backdrop_path) {
                const img = new Image();
                img.src = `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`;
                img.onload = () => {
                    setImagesLoaded(prev => ({ ...prev, [idx]: true }));
                };
            }
        });
    }, [items]);

    // Auto-scroll
    useEffect(() => {
        if (items.length <= 1) return;
        autoScrollRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % items.length);
        }, 7000);
        return () => clearInterval(autoScrollRef.current);
    }, [items.length]);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        clearInterval(autoScrollRef.current);
    };

    const handleTouchEnd = (e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (navigator.vibrate) navigator.vibrate(8);
            setCurrent(prev => diff > 0
                ? (prev + 1) % items.length
                : (prev - 1 + items.length) % items.length
            );
        }
    };

    const handlePlay = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        const item = items[current];
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        navigate(type === 'tv' ? `/watch/tv/${item.id}/1/1` : `/watch/movie/${item.id}`);
    };

    const handleInfo = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        const item = items[current];
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        navigate(`/${type}/${item.id}`);
    };

    if (!items.length) return null;

    const item = items[current];
    const backdrop = item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : '';

    return (
        <section
            style={styles.container}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* All backgrounds (hidden) for smooth transitions */}
            {items.map((it, idx) => (
                <div
                    key={it.id}
                    style={{
                        ...styles.backdrop,
                        backgroundImage: `url(https://image.tmdb.org/t/p/w1280${it.backdrop_path})`,
                        opacity: idx === current && imagesLoaded[idx] ? 1 : 0,
                        zIndex: idx === current ? 1 : 0
                    }}
                />
            ))}

            {/* Loading shimmer */}
            {!imagesLoaded[current] && (
                <div style={styles.shimmer} />
            )}

            {/* Gradient overlays */}
            <div style={styles.gradientTop} />
            <div style={styles.gradientBottom} />

            {/* Content */}
            <div style={styles.content}>
                {/* Top badges */}
                <div style={styles.badges}>
                    {item.vote_average > 0 && (
                        <span style={styles.ratingBadge}>
                            <span style={{ color: colors.gold }}>★</span>
                            <span>{item.vote_average.toFixed(1)}</span>
                        </span>
                    )}
                    <span style={styles.typeBadge}>
                        {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                    </span>
                    {(item.release_date || item.first_air_date) && (
                        <span style={styles.yearBadge}>
                            {(item.release_date || item.first_air_date).split('-')[0]}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 style={styles.title}>{item.title || item.name}</h1>

                {/* Description */}
                <p style={styles.description}>
                    {item.overview?.slice(0, 130)}{item.overview?.length > 130 ? '...' : ''}
                </p>

                {/* Action buttons */}
                <div style={styles.actions}>
                    <button style={styles.playButton} onClick={handlePlay}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Play Now</span>
                    </button>
                    <button style={styles.infoButton} onClick={handleInfo}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <span>Info</span>
                    </button>
                </div>

                {/* Pagination dots */}
                {items.length > 1 && (
                    <div style={styles.pagination}>
                        {items.slice(0, 5).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(5);
                                    setCurrent(i);
                                }}
                                style={i === current ? styles.dotActive : styles.dot}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const styles = {
    container: {
        position: 'relative',
        width: '100%',
        height: '75vh',
        minHeight: 500,
        maxHeight: 680,
        overflow: 'hidden',
        background: colors.bg1
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
        transition: 'opacity 0.6s ease-out'
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(90deg, ${colors.bg2} 0%, ${colors.bg3} 50%, ${colors.bg2} 100%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
    },
    gradientTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 5
    },
    gradientBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        background: `linear-gradient(0deg, ${colors.bg1} 0%, ${colors.bg1} 15%, transparent 100%)`,
        pointerEvents: 'none',
        zIndex: 5
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: `${space.xxxl}px ${space.lg}px`,
        zIndex: 10
    },
    badges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space.sm,
        marginBottom: space.md
    },
    ratingBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: `6px ${space.md}px`,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.text1
    },
    typeBadge: {
        display: 'inline-block',
        padding: `6px ${space.md}px`,
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.text1,
        textTransform: 'uppercase',
        letterSpacing: 0.6
    },
    yearBadge: {
        display: 'inline-block',
        padding: `6px ${space.md}px`,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        fontSize: typography.sizes.xs,
        color: colors.text2
    },
    title: {
        fontSize: 'clamp(26px, 7vw, 40px)',
        fontWeight: typography.weights.black,
        color: colors.text1,
        lineHeight: 1.1,
        marginBottom: space.sm,
        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    description: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.regular,
        color: colors.text3,
        lineHeight: 1.55,
        marginBottom: space.xl,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    actions: {
        display: 'flex',
        gap: space.md
    },
    playButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        flex: 1,
        maxWidth: 165,
        padding: `14px ${space.xl}px`,
        background: colors.text1,
        border: 'none',
        borderRadius: radius.md,
        color: colors.bg1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(255,255,255,0.2)'
    },
    infoButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        flex: 1,
        maxWidth: 130,
        padding: `14px ${space.xl}px`,
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(16px)',
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer'
    },
    pagination: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: space.xl
    },
    dot: {
        width: 8,
        height: 8,
        padding: 0,
        border: 'none',
        borderRadius: radius.full,
        background: 'rgba(255,255,255,0.35)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    dotActive: {
        width: 28,
        height: 8,
        padding: 0,
        border: 'none',
        borderRadius: 4,
        background: colors.primary,
        boxShadow: `0 0 14px ${colors.primaryGlow}`,
        cursor: 'pointer'
    }
};

// Add shimmer animation
if (typeof document !== 'undefined') {
    const styleId = 'hero-carousel-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

export default HeroCarousel;
