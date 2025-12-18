/**
 * Android Watch Page v4.0
 * Uses ONLY VidSrc.cc (same as web)
 */
import React, { useState, useEffect, useRef } from 'react';
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

    const controlsTimer = useRef(null);

    useEffect(() => {
        loadDetails();

        // Show VAST ad if allowed
        if (canShowAd()) {
            showVASTAd();
        }

        // Try landscape lock
        try {
            screen.orientation?.lock?.('landscape').catch(() => { });
        } catch (e) { }

        return () => {
            try {
                screen.orientation?.unlock?.();
            } catch (e) { }
        };
    }, [id, type]);

    useEffect(() => {
        if (type === 'tv' && currentSeason) {
            loadEpisodes();
        }
    }, [currentSeason, id, type]);

    const loadDetails = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setDetails(data);
        } catch (err) {
            console.error('Failed to load details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadEpisodes = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${currentSeason}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setEpisodes(data.episodes || []);
        } catch (err) {
            console.error('Failed to load episodes:', err);
        }
    };

    // USING VIDSRC.CC ONLY - Same as web!
    const getVideoUrl = () => {
        if (type === 'tv') {
            return `https://vidsrc.cc/v2/embed/tv/${id}/${currentSeason}/${currentEpisode}?autoPlay=true`;
        }
        return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`;
    };

    const handleBack = () => {
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
        if (currentEpisode < episodes.length) {
            setCurrentEpisode(prev => prev + 1);
        } else if (details?.number_of_seasons > currentSeason) {
            setCurrentSeason(prev => prev + 1);
            setCurrentEpisode(1);
        }
    };

    const handlePrevEp = () => {
        if (currentEpisode > 1) {
            setCurrentEpisode(prev => prev - 1);
        } else if (currentSeason > 1) {
            setCurrentSeason(prev => prev - 1);
            setCurrentEpisode(1);
        }
    };

    const handleTap = () => {
        setShowControls(true);
        clearTimeout(controlsTimer.current);
        controlsTimer.current = setTimeout(() => {
            setShowControls(false);
        }, 4000);
    };

    if (isLoading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner} />
            </div>
        );
    }

    return (
        <div style={styles.container} onClick={handleTap}>
            {/* Video Player - VidSrc.cc */}
            <iframe
                key={`${currentSeason}-${currentEpisode}`}
                src={getVideoUrl()}
                style={styles.player}
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            />

            {/* Controls Overlay */}
            <div style={{
                ...styles.controls,
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? 'auto' : 'none'
            }}>
                {/* Header */}
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={handleBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div style={styles.info}>
                        <h1 style={styles.title}>{details?.title || details?.name}</h1>
                        {type === 'tv' && (
                            <span style={styles.episode}>S{currentSeason} E{currentEpisode}</span>
                        )}
                    </div>
                </div>

                {/* Episode Navigation */}
                {type === 'tv' && episodes.length > 0 && (
                    <div style={styles.nav}>
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
                            Previous
                        </button>
                        <button
                            style={styles.navBtn}
                            onClick={(e) => { e.stopPropagation(); handleNextEp(); }}
                        >
                            Next
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Inline styles - completely separate from web
const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 9999
    },
    player: {
        width: '100%',
        height: '100%',
        border: 'none'
    },
    controls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'opacity 0.3s ease'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '24px',
        paddingTop: 'max(24px, env(safe-area-inset-top))'
    },
    backBtn: {
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        border: 'none',
        borderRadius: '50%',
        color: 'white',
        cursor: 'pointer'
    },
    info: {
        flex: 1
    },
    title: {
        fontSize: '18px',
        fontWeight: 700,
        color: 'white',
        margin: 0
    },
    episode: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.7)'
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
    },
    navBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 24px',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer'
    },
    loading: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#E50914',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    }
};

export default AndroidWatch;
