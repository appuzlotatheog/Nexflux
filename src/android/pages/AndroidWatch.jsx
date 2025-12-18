/**
 * Android Watch Page
 * Full-screen video player with VAST ad support
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveWatchProgress, isAuthenticated } from '../services/api';
import { showVASTAd, canShowAd } from '../services/vastAds';
import './AndroidWatch.css';

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
    const [adShown, setAdShown] = useState(false);

    const iframeRef = useRef(null);
    const controlsTimerRef = useRef(null);

    useEffect(() => {
        fetchDetails();

        // Show VAST ad before video if cooldown complete
        if (canShowAd() && !adShown) {
            showVASTAd().then(() => {
                setAdShown(true);
            });
        }

        // Lock to landscape on mobile
        if (screen.orientation?.lock) {
            screen.orientation.lock('landscape').catch(() => { });
        }

        return () => {
            // Unlock orientation
            if (screen.orientation?.unlock) {
                screen.orientation.unlock();
            }
        };
    }, [id, type]);

    useEffect(() => {
        if (type === 'tv' && currentSeason) {
            fetchEpisodes();
        }
    }, [currentSeason, id, type]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setDetails(data);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEpisodes = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${currentSeason}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setEpisodes(data.episodes || []);
        } catch (error) {
            console.error('Error fetching episodes:', error);
        }
    };

    const getEmbedUrl = () => {
        if (type === 'tv') {
            return `https://vidsrc.xyz/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
        }
        return `https://vidsrc.xyz/embed/movie/${id}`;
    };

    const handleBack = () => {
        // Save progress if authenticated
        if (isAuthenticated() && details) {
            saveWatchProgress(
                parseInt(id),
                type,
                details.title || details.name,
                details.poster_path,
                0, // Would need actual progress
                0,
                type === 'tv' ? currentSeason : undefined,
                type === 'tv' ? currentEpisode : undefined
            );
        }
        navigate(-1);
    };

    const handleNextEpisode = () => {
        if (currentEpisode < episodes.length) {
            setCurrentEpisode(prev => prev + 1);
        } else if (details.number_of_seasons > currentSeason) {
            setCurrentSeason(prev => prev + 1);
            setCurrentEpisode(1);
        }
    };

    const handlePrevEpisode = () => {
        if (currentEpisode > 1) {
            setCurrentEpisode(prev => prev - 1);
        } else if (currentSeason > 1) {
            setCurrentSeason(prev => prev - 1);
            // Would need to fetch previous season's episode count
        }
    };

    const handleShowControls = () => {
        setShowControls(true);
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    if (isLoading) {
        return (
            <div className="android-watch android-loading">
                <div className="android-loading__spinner" />
            </div>
        );
    }

    return (
        <div className="android-watch" onClick={handleShowControls}>
            {/* Video Player */}
            <iframe
                ref={iframeRef}
                src={getEmbedUrl()}
                className="android-watch__player"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
            />

            {/* Controls Overlay */}
            <div className={`android-watch__controls ${showControls ? 'android-watch__controls--visible' : ''}`}>
                {/* Top Bar */}
                <header className="android-watch__header">
                    <button className="android-watch__back" onClick={handleBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="android-watch__info">
                        <h1 className="android-watch__title">{details?.title || details?.name}</h1>
                        {type === 'tv' && (
                            <span className="android-watch__episode">S{currentSeason} E{currentEpisode}</span>
                        )}
                    </div>
                </header>

                {/* Episode Navigation (TV only) */}
                {type === 'tv' && episodes.length > 0 && (
                    <div className="android-watch__nav">
                        <button
                            className="android-watch__nav-btn"
                            onClick={handlePrevEpisode}
                            disabled={currentEpisode === 1 && currentSeason === 1}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                            Previous
                        </button>
                        <button
                            className="android-watch__nav-btn"
                            onClick={handleNextEpisode}
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
