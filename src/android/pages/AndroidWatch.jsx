/**
 * Android Watch Page v5.0
 * Full-screen video with auto-landscape orientation
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveWatchProgress, isAuthenticated } from '../services/api';
import { showVASTAd, canShowAd } from '../services/vastAds';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidWatch = () => {
    const { type, id, season, episode } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(parseInt(episode) || 1);
    const [currentSeason, setCurrentSeason] = useState(parseInt(season) || 1);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLandscape, setIsLandscape] = useState(false);
    const [error, setError] = useState(null);

    const controlsTimer = useRef(null);
    const containerRef = useRef(null);

    // Handle orientation
    useEffect(() => {
        const checkOrientation = () => {
            const landscape = window.innerWidth > window.innerHeight;
            setIsLandscape(landscape);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        // Try to lock to landscape
        const lockLandscape = async () => {
            try {
                if (screen.orientation?.lock) {
                    await screen.orientation.lock('landscape');
                }
            } catch (e) {
                // Some browsers don't support this
                console.log('Orientation lock not supported');
            }
        };

        lockLandscape();

        // Request fullscreen for immersive experience
        const requestFullscreen = async () => {
            try {
                if (containerRef.current?.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                }
            } catch (e) {
                console.log('Fullscreen not supported');
            }
        };

        // Small delay to let page render
        setTimeout(requestFullscreen, 500);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);

            // Unlock orientation on exit
            try {
                screen.orientation?.unlock?.();
            } catch (e) { }

            // Exit fullscreen on exit
            try {
                if (document.fullscreenElement) {
                    document.exitFullscreen?.();
                }
            } catch (e) { }
        };
    }, []);

    useEffect(() => {
        loadDetails();
        if (canShowAd()) showVASTAd();
    }, [id, type]);

    useEffect(() => {
        if (type === 'tv' && currentSeason) loadEpisodes();
    }, [currentSeason, id, type]);

    const loadDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`);
            if (!res.ok) throw new Error('Failed to load');
            const data = await res.json();
            setDetails(data);
        } catch (err) {
            setError('Failed to load content');
        } finally {
            setIsLoading(false);
        }
    };

    const loadEpisodes = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${currentSeason}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setEpisodes(data.episodes || []);
        } catch (err) { }
    };

    // VidSrc.cc URL - same as web
    const getVideoUrl = useCallback(() => {
        if (type === 'tv') {
            return `https://vidsrc.cc/v2/embed/tv/${id}/${currentSeason}/${currentEpisode}?autoPlay=true`;
        }
        return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`;
    }, [type, id, currentSeason, currentEpisode]);

    const handleBack = () => {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);

        // Save progress
        if (isAuthenticated() && details) {
            saveWatchProgress(
                parseInt(id), type,
                details.title || details.name,
                details.poster_path,
                50, 100,
                type === 'tv' ? currentSeason : null,
                type === 'tv' ? currentEpisode : null
            ).catch(() => { });
        }
        navigate(-1);
    };

    const handleNextEp = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (currentEpisode < episodes.length) {
            setCurrentEpisode(prev => prev + 1);
        } else if (details?.number_of_seasons > currentSeason) {
            setCurrentSeason(prev => prev + 1);
            setCurrentEpisode(1);
        }
    };

    const handlePrevEp = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (currentEpisode > 1) {
            setCurrentEpisode(prev => prev - 1);
        } else if (currentSeason > 1) {
            setCurrentSeason(prev => prev - 1);
            setCurrentEpisode(1);
        }
    };

    const handleTap = () => {
        setShowControls(prev => !prev);
        clearTimeout(controlsTimer.current);
        if (!showControls) {
            controlsTimer.current = setTimeout(() => setShowControls(false), 5000);
        }
    };

    const handleRotate = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        try {
            if (isLandscape) {
                screen.orientation.lock('portrait').catch(() => { });
            } else {
                screen.orientation.lock('landscape').catch(() => { });
            }
        } catch (e) { }
    };

    if (isLoading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingWrapper}>
                    <div style={styles.spinner} />
                    <p style={{ color: '#888', marginTop: 16 }}>Loading player...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorWrapper}>
                    <span style={{ fontSize: 48, marginBottom: 16 }}>😕</span>
                    <h2 style={{ color: '#fff', marginBottom: 8 }}>{error}</h2>
                    <button style={styles.retryBtn} onClick={loadDetails}>Retry</button>
                    <button style={{ ...styles.retryBtn, background: 'transparent', marginTop: 8 }} onClick={handleBack}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={styles.container} onClick={handleTap}>
            {/* Video Player */}
            <iframe
                key={`${currentSeason}-${currentEpisode}`}
                src={getVideoUrl()}
                style={styles.player}
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
            />

            {/* Controls Overlay */}
            <div style={{
                ...styles.controls,
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? 'auto' : 'none'
            }}>
                {/* Top Bar */}
                <div style={styles.topBar}>
                    <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleBack(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div style={styles.titleArea}>
                        <h1 style={styles.title}>{details?.title || details?.name}</h1>
                        {type === 'tv' && (
                            <span style={styles.subtitle}>Season {currentSeason} • Episode {currentEpisode}</span>
                        )}
                    </div>

                    <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleRotate(); }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                            <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.57-.59-2.16 0s-.59 1.57 0 2.16l7.07 7.07c.59.59 1.57.59 2.16 0s.59-1.57 0-2.16l-7.07-7.07zM7.52 21.48c-3.27-1.55-5.61-4.72-5.97-8.48h-1.5C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z" />
                        </svg>
                    </button>
                </div>

                {/* Center Play Button */}
                <div style={styles.centerArea}>
                    {/* Optional: Add center controls here */}
                </div>

                {/* Bottom Bar - Episode Navigation */}
                {type === 'tv' && episodes.length > 0 && (
                    <div style={styles.bottomBar}>
                        <button
                            style={{
                                ...styles.navBtn,
                                opacity: currentEpisode === 1 && currentSeason === 1 ? 0.4 : 1
                            }}
                            onClick={(e) => { e.stopPropagation(); handlePrevEp(); }}
                            disabled={currentEpisode === 1 && currentSeason === 1}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                            <span>Previous</span>
                        </button>

                        <div style={styles.episodeInfo}>
                            Ep {currentEpisode} of {episodes.length}
                        </div>

                        <button
                            style={{
                                ...styles.navBtn,
                                opacity: currentEpisode >= episodes.length && currentSeason >= (details?.number_of_seasons || 1) ? 0.4 : 1
                            }}
                            onClick={(e) => { e.stopPropagation(); handleNextEp(); }}
                        >
                            <span>Next</span>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden tip for first-time users */}
            {showControls && (
                <div style={styles.tip}>
                    Tap anywhere to {showControls ? 'hide' : 'show'} controls • Rotate phone for landscape
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 9999,
        overflow: 'hidden'
    },
    player: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#000'
    },
    controls: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.85) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'opacity 0.3s ease',
        zIndex: 10
    },
    topBar: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))'
    },
    iconBtn: {
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        border: 'none',
        borderRadius: '50%',
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, background 0.2s ease'
    },
    titleArea: {
        flex: 1,
        minWidth: 0
    },
    title: {
        fontSize: 17,
        fontWeight: 700,
        color: 'white',
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)'
    },
    centerArea: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: 16,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))'
    },
    navBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        border: 'none',
        borderRadius: 12,
        color: 'white',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    episodeInfo: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 500
    },
    loadingWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
    spinner: {
        width: 48,
        height: 48,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#E50914',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    errorWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 24,
        textAlign: 'center'
    },
    retryBtn: {
        padding: '12px 32px',
        background: '#E50914',
        border: 'none',
        borderRadius: 8,
        color: 'white',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer'
    },
    tip: {
        position: 'absolute',
        bottom: 'max(80px, calc(env(safe-area-inset-bottom) + 80px))',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 20,
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
    }
};

// Add keyframe animation via style tag
if (typeof document !== 'undefined') {
    const styleId = 'android-watch-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

export default AndroidWatch;
