/**
 * Android Content Card v9.0 - PREMIUM
 * Features:
 * - Long-press quick actions menu
 * - Shimmer loading skeleton
 * - Scroll animations (fade + scale)
 * - Higher resolution images
 * - Color-coded ratings
 * - Smooth press feedback
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWatchlist, isAuthenticated } from '../services/api';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

const ContentCard = ({
    id,
    type = 'movie',
    title,
    posterPath,
    rating,
    year,
    progress,
    size = 'md',
    animate = true
}) => {
    const navigate = useNavigate();
    const [isPressed, setIsPressed] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [isVisible, setIsVisible] = useState(!animate);
    const cardRef = useRef(null);
    const longPressTimer = useRef(null);

    // Use higher resolution images
    const imageUrl = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : null;

    const sizeConfig = {
        sm: { width: 110, fontSize: 12 },
        md: { width: 140, fontSize: 13 },
        lg: { width: 170, fontSize: 14 }
    };

    const config = sizeConfig[size] || sizeConfig.md;

    // Intersection Observer for scroll animations
    useEffect(() => {
        if (!animate) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [animate]);

    const handleTouchStart = () => {
        setIsPressed(true);
        longPressTimer.current = setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(20);
            setShowQuickActions(true);
            setIsPressed(false);
        }, 500);
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimer.current);
        if (!showQuickActions && isPressed) {
            if (navigator.vibrate) navigator.vibrate(8);
            navigate(`/${type}/${id}`);
        }
        setIsPressed(false);
    };

    const handleAddToList = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        if (navigator.vibrate) navigator.vibrate(10);
        try {
            await addToWatchlist(parseInt(id), type, title, posterPath);
        } catch (e) { }
        setShowQuickActions(false);
    };

    const handlePlay = (e) => {
        e.stopPropagation();
        if (navigator.vibrate) navigator.vibrate(10);
        if (type === 'tv') navigate(`/watch/tv/${id}/1/1`);
        else navigate(`/watch/movie/${id}`);
        setShowQuickActions(false);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        if (navigator.vibrate) navigator.vibrate(10);
        if (navigator.share) {
            navigator.share({
                title: title,
                url: `https://nexflux.app/${type}/${id}`
            }).catch(() => { });
        }
        setShowQuickActions(false);
    };

    const getRatingColor = () => {
        if (!rating) return colors.text4;
        if (rating >= 8) return '#22C55E';
        if (rating >= 6) return colors.gold;
        if (rating >= 4) return '#F97316';
        return '#EF4444';
    };

    return (
        <>
            <article
                ref={cardRef}
                style={{
                    ...styles.card,
                    width: config.width,
                    transform: isPressed
                        ? 'scale(0.93)'
                        : isVisible
                            ? 'scale(1) translateY(0)'
                            : 'scale(0.95) translateY(10px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => { setIsPressed(false); clearTimeout(longPressTimer.current); }}
            >
                {/* Poster */}
                <div style={styles.posterWrap}>
                    {imageUrl && !imageError ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            style={{
                                ...styles.poster,
                                opacity: imageLoaded ? 1 : 0
                            }}
                        />
                    ) : (
                        <div style={styles.placeholder}>
                            <span style={{ fontSize: 32, opacity: 0.3 }}>🎬</span>
                        </div>
                    )}

                    {/* Shimmer skeleton */}
                    {!imageLoaded && imageUrl && !imageError && (
                        <div style={styles.shimmer} />
                    )}

                    {/* Gradient overlay */}
                    <div style={styles.overlay} />

                    {/* Rating badge */}
                    {rating > 0 && (
                        <div style={{
                            ...styles.rating,
                            borderLeftColor: getRatingColor()
                        }}>
                            <span style={{ color: getRatingColor(), fontSize: 10 }}>★</span>
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Progress bar */}
                    {progress > 0 && (
                        <div style={styles.progressBar}>
                            <div style={{
                                ...styles.progressFill,
                                width: `${Math.min(100, progress)}%`
                            }} />
                        </div>
                    )}

                    {/* Play icon on press */}
                    {isPressed && (
                        <div style={styles.playIcon}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={styles.info}>
                    <h3 style={{ ...styles.title, fontSize: config.fontSize }}>{title}</h3>
                    {year && <span style={styles.year}>{year}</span>}
                </div>
            </article>

            {/* Quick Actions Modal */}
            {showQuickActions && (
                <div
                    style={styles.quickActionsOverlay}
                    onClick={() => setShowQuickActions(false)}
                >
                    <div style={styles.quickActionsCard} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.qaHeader}>
                            <img
                                src={imageUrl}
                                alt=""
                                style={styles.qaPoster}
                            />
                            <div>
                                <h3 style={styles.qaTitle}>{title}</h3>
                                <p style={styles.qaYear}>{year} • {type === 'tv' ? 'TV Series' : 'Movie'}</p>
                            </div>
                        </div>
                        <div style={styles.qaActions}>
                            <button style={styles.qaBtn} onClick={handlePlay}>
                                <span style={styles.qaIcon}>▶️</span>
                                <span>Play</span>
                            </button>
                            <button style={styles.qaBtn} onClick={handleAddToList}>
                                <span style={styles.qaIcon}>➕</span>
                                <span>Add to List</span>
                            </button>
                            <button style={styles.qaBtn} onClick={handleShare}>
                                <span style={styles.qaIcon}>📤</span>
                                <span>Share</span>
                            </button>
                            <button style={styles.qaBtn} onClick={() => { setShowQuickActions(false); navigate(`/${type}/${id}`); }}>
                                <span style={styles.qaIcon}>ℹ️</span>
                                <span>Details</span>
                            </button>
                        </div>
                        <button style={styles.qaClose} onClick={() => setShowQuickActions(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const styles = {
    card: {
        position: 'relative',
        flexShrink: 0,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent'
    },
    posterWrap: {
        position: 'relative',
        aspectRatio: '2/3',
        borderRadius: radius.lg,
        overflow: 'hidden',
        background: colors.bg3,
        boxShadow: shadows.card
    },
    poster: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'opacity 0.4s ease'
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.bg3} 0%, ${colors.bg4} 100%)`
    },
    shimmer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(90deg, ${colors.bg3} 25%, ${colors.bg4} 50%, ${colors.bg3} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
    },
    overlay: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '50%',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
        pointerEvents: 'none'
    },
    rating: {
        position: 'absolute',
        top: 8,
        left: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        borderLeft: '3px solid',
        borderRadius: 6,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: colors.text1
    },
    progressBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 4,
        background: 'rgba(255,255,255,0.2)'
    },
    progressFill: {
        height: '100%',
        background: colors.primary,
        borderRadius: '0 2px 2px 0'
    },
    playIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.primary,
        borderRadius: '50%',
        color: '#fff',
        boxShadow: shadows.glow,
        animation: 'pulse 0.3s ease'
    },
    info: {
        padding: `${space.sm}px 4px 0`
    },
    title: {
        fontWeight: typography.weights.medium,
        color: colors.text2,
        lineHeight: 1.35,
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    year: {
        fontSize: typography.sizes.xs,
        color: colors.text4,
        marginTop: 3,
        display: 'block'
    },
    // Quick Actions - NO BLUR for performance
    quickActionsOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease'
    },
    quickActionsCard: {
        width: '100%',
        maxWidth: 400,
        background: colors.bg3,
        borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
        padding: space.lg,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
    },
    qaHeader: {
        display: 'flex',
        gap: space.md,
        marginBottom: space.lg,
        paddingBottom: space.lg,
        borderBottom: `1px solid ${colors.bg4}`
    },
    qaPoster: {
        width: 60,
        height: 90,
        borderRadius: radius.sm,
        objectFit: 'cover'
    },
    qaTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        margin: 0,
        marginBottom: 4
    },
    qaYear: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        margin: 0
    },
    qaActions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: space.sm
    },
    qaBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: space.md,
        background: colors.bg4,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text2,
        fontSize: typography.sizes.xs,
        cursor: 'pointer'
    },
    qaIcon: {
        fontSize: 20
    },
    qaClose: {
        width: '100%',
        marginTop: space.lg,
        padding: space.md,
        background: 'transparent',
        border: `1px solid ${colors.bg5}`,
        borderRadius: radius.md,
        color: colors.text3,
        fontSize: typography.sizes.md,
        cursor: 'pointer'
    }
};

// Add animations
if (typeof document !== 'undefined') {
    const styleId = 'content-card-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
}

export default ContentCard;
