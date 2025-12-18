/**
 * Android Details Page v3.0
 * Premium movie/TV details
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import '../styles/theme.css';
import '../styles/android.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidDetails = ({ type: propType }) => {
    const { id } = useParams();
    const type = propType || 'movie';
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        loadDetails();
        if (isAuthenticated()) {
            checkLists();
        }
    }, [id, type]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [detailsRes, creditsRes, similarRes] = await Promise.all([
                fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE}/${type}/${id}/similar?api_key=${TMDB_API_KEY}`),
            ]);

            const [detailsData, creditsData, similarData] = await Promise.all([
                detailsRes.json(),
                creditsRes.json(),
                similarRes.json(),
            ]);

            setDetails(detailsData);
            setCast(creditsData.cast?.slice(0, 10) || []);
            setSimilar(similarData.results?.slice(0, 10) || []);

            if (type === 'tv' && detailsData.seasons) {
                setSeasons(detailsData.seasons.filter(s => s.season_number > 0));
            }
        } catch (err) {
            console.error('Failed to load details:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkLists = async () => {
        try {
            const [wl, fav] = await Promise.all([getWatchlist(), getFavorites()]);
            if (wl.success) {
                setInWatchlist(wl.watchlist.some(i => i.contentId === parseInt(id) && i.contentType === type));
            }
            if (fav.success) {
                setIsFavorite(fav.favorites.some(i => i.contentId === parseInt(id) && i.contentType === type));
            }
        } catch (err) { }
    };

    const handleWatch = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (type === 'tv') {
            navigate(`/watch/tv/${id}/${selectedSeason}/1`);
        } else {
            navigate(`/watch/movie/${id}`);
        }
    };

    const handleWatchlist = async () => {
        if (!isAuthenticated()) return navigate('/login');
        try {
            if (inWatchlist) {
                await removeFromWatchlist(parseInt(id), type);
            } else {
                await addToWatchlist(parseInt(id), type, details.title || details.name, details.poster_path);
            }
            setInWatchlist(!inWatchlist);
        } catch (err) { }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated()) return navigate('/login');
        try {
            if (isFavorite) {
                await removeFromFavorites(parseInt(id), type);
            } else {
                await addToFavorites(parseInt(id), type, details.title || details.name, details.poster_path);
            }
            setIsFavorite(!isFavorite);
        } catch (err) { }
    };

    if (loading) {
        return (
            <div className="nx-loading">
                <div className="nx-spinner" />
            </div>
        );
    }

    if (!details) {
        return (
            <div className="nx-error">
                <span className="nx-error-icon">😕</span>
                <h2 className="nx-error-title">Not Found</h2>
                <p className="nx-error-text">Content not available</p>
                <button className="nx-btn nx-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '';
    const poster = details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : '';

    return (
        <div className="nx-details">
            {/* Backdrop */}
            <div className="nx-details__backdrop" style={{ backgroundImage: `url(${backdrop})` }} />
            <div className="nx-details__gradient" />

            {/* Back */}
            <button className="nx-details__back" onClick={() => navigate(-1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Content */}
            <div className="nx-details__content nx-slide-up">
                {/* Header */}
                <div className="nx-details__header">
                    <img src={poster} alt={details.title || details.name} className="nx-details__poster" />
                    <div className="nx-details__info">
                        <h1 className="nx-details__title">{details.title || details.name}</h1>
                        <div className="nx-details__meta">
                            {details.vote_average > 0 && (
                                <span className="nx-details__rating">★ {details.vote_average.toFixed(1)}</span>
                            )}
                            <span>{details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
                            {details.runtime && <span>{details.runtime}m</span>}
                            {type === 'tv' && <span>{details.number_of_seasons}S</span>}
                        </div>
                        <div className="nx-details__genres">
                            {details.genres?.slice(0, 3).map(g => (
                                <span key={g.id} className="nx-details__genre">{g.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="nx-details__actions">
                    <button className="nx-btn nx-btn-primary" style={{ flex: 1 }} onClick={handleWatch}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        className="nx-btn nx-btn-secondary"
                        onClick={handleWatchlist}
                        style={{ width: 48, padding: 0 }}
                    >
                        {inWatchlist ? '✓' : '+'}
                    </button>
                    <button
                        className="nx-btn nx-btn-secondary"
                        onClick={handleFavorite}
                        style={{ width: 48, padding: 0 }}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* Overview */}
                <div className="nx-details__section">
                    <h2 className="nx-details__section-title">Overview</h2>
                    <p className="nx-details__overview">{details.overview}</p>
                </div>

                {/* Seasons */}
                {type === 'tv' && seasons.length > 0 && (
                    <div className="nx-details__section">
                        <h2 className="nx-details__section-title">Seasons</h2>
                        <div className="nx-scroll-x" style={{ padding: '4px 0' }}>
                            {seasons.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSeason(s.season_number)}
                                    className="nx-btn"
                                    style={{
                                        background: selectedSeason === s.season_number ? 'var(--nx-primary)' : 'var(--nx-bg-elevated)',
                                        color: selectedSeason === s.season_number ? 'white' : 'var(--nx-text-secondary)',
                                        padding: '10px 20px',
                                        fontSize: '14px'
                                    }}
                                >
                                    S{s.season_number}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cast */}
                {cast.length > 0 && (
                    <div className="nx-details__section">
                        <h2 className="nx-details__section-title">Cast</h2>
                        <div className="nx-scroll-x" style={{ padding: '4px 0' }}>
                            {cast.map(person => (
                                <div key={person.id} style={{ textAlign: 'center', width: 80, flexShrink: 0 }}>
                                    <img
                                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}
                                        alt={person.name}
                                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', background: 'var(--nx-bg-elevated)' }}
                                    />
                                    <p style={{ fontSize: 11, marginTop: 6, color: 'var(--nx-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</p>
                                    <p style={{ fontSize: 10, color: 'var(--nx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AndroidDetails;
