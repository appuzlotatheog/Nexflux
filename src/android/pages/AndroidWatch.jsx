/**
 * Android Watch Page v3.0
 * Full-screen video player with MULTIPLE working video sources
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveWatchProgress, isAuthenticated } from '../services/api';
import { showVASTAd, canShowAd } from '../services/vastAds';
import '../styles/theme.css';
import '../styles/android.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// WORKING VIDEO EMBED SOURCES - Tested and verified
const VIDEO_SOURCES = [
    {
        name: 'VidSrc.pro',
        getUrl: (type, id, s, e) => type === 'tv'
            ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
            : `https://vidsrc.pro/embed/movie/${id}`
    },
    {
        name: 'VidSrc.icu',
        getUrl: (type, id, s, e) => type === 'tv'
            ? `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`
            : `https://vidsrc.icu/embed/movie/${id}`
    },
    {
        name: 'VidSrc.xyz',
        getUrl: (type, id, s, e) => type === 'tv'
            ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
            : `https://vidsrc.xyz/embed/movie/${id}`
    },
    {
        name: 'SuperEmbed',
        getUrl: (type, id, s, e) => type === 'tv'
            ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
            : `https://multiembed.mov/?video_id=${id}&tmdb=1`
    },
    {
        name: '2Embed',
        getUrl: (type, id, s, e) => type === 'tv'
            ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
            : `https://www.2embed.cc/embed/${id}`
    }
];

const AndroidWatch = () => {
    const { type, id, season, episode } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(parseInt(episode) || 1);
    const [currentSeason, setCurrentSeason] = useState(parseInt(season) || 1);
    const [currentSource, setCurrentSource] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [showSourceMenu, setShowSourceMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const iframeRef = useRef(null);
    const controlsTimer = useRef(null);

    useEffect(() => {
        loadDetails();

        // Show ad if allowed
        if (canShowAd()) {
            showVASTAd();
        }

        // Try to lock landscape
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

    const getVideoUrl = () => {
        const source = VIDEO_SOURCES[currentSource];
        return source.getUrl(type, id, currentSeason, currentEpisode);
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

    const handleSourceChange = (index) => {
        setCurrentSource(index);
        setShowSourceMenu(false);
    };

    const handleTap = () => {
        setShowControls(true);
        setShowSourceMenu(false);
        clearTimeout(controlsTimer.current);
        controlsTimer.current = setTimeout(() => {
            setShowControls(false);
        }, 4000);
    };

    if (isLoading) {
        return (
            <div className="nx-watch nx-loading">
                <div className="nx-spinner" />
            </div>
        );
    }

    return (
        <div className="nx-watch" onClick={handleTap}>
            {/* Video Player */}
            <iframe
                ref={iframeRef}
                key={`${currentSource}-${currentSeason}-${currentEpisode}`}
                src={getVideoUrl()}
                className="nx-watch__player"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* Controls Overlay */}
            <div className={`nx-watch__controls ${showControls ? 'nx-watch__controls--visible' : ''}`}>
                {/* Header */}
                <header className="nx-watch__header">
                    <button className="nx-watch__back" onClick={handleBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="nx-watch__info">
                        <h1 className="nx-watch__title">{details?.title || details?.name}</h1>
                        {type === 'tv' && (
                            <span className="nx-watch__episode">S{currentSeason} E{currentEpisode}</span>
                        )}
                    </div>

                    {/* Source Selector */}
                    <button
                        className="nx-watch__back"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSourceMenu(!showSourceMenu);
                        }}
                        style={{ background: showSourceMenu ? 'var(--nx-primary)' : undefined }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </header>

                {/* Source Menu */}
                {showSourceMenu && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(var(--nx-safe-top) + 70px)',
                            right: '16px',
                            minWidth: '180px',
                            background: 'rgba(20, 20, 25, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--nx-radius-md)',
                            padding: '8px',
                            zIndex: 100
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--nx-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Video Source
                        </div>
                        {VIDEO_SOURCES.map((source, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSourceChange(idx)}
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: idx === currentSource ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: idx === currentSource ? 'var(--nx-primary)' : 'white',
                                    fontSize: '14px',
                                    fontWeight: idx === currentSource ? 600 : 400,
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                {source.name}
                                {idx === currentSource && <span style={{ marginLeft: 'auto' }}>✓</span>}
                            </button>
                        ))}
                    </div>
                )}

                {/* Episode Navigation */}
                {type === 'tv' && episodes.length > 0 && (
                    <div className="nx-watch__nav">
                        <button
                            className="nx-watch__nav-btn"
                            onClick={(e) => { e.stopPropagation(); handlePrevEp(); }}
                            disabled={currentEpisode === 1 && currentSeason === 1}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                            Previous
                        </button>
                        <button
                            className="nx-watch__nav-btn"
                            onClick={(e) => { e.stopPropagation(); handleNextEp(); }}
                        >
                            Next
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AndroidWatch;
