/**
 * Android Details Page
 * Movie/TV show details with actions
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import './AndroidDetails.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidDetails = ({ type: propType }) => {
    const { id } = useParams();
    const type = propType || 'movie';
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [credits, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        fetchDetails();
        if (isAuthenticated()) {
            checkUserLists();
        }
    }, [id, type]);

    const fetchDetails = async () => {
        setIsLoading(true);
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
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkUserLists = async () => {
        try {
            const [watchlistRes, favoritesRes] = await Promise.all([
                getWatchlist(),
                getFavorites(),
            ]);

            if (watchlistRes.success) {
                setInWatchlist(watchlistRes.watchlist.some(item =>
                    item.contentId === parseInt(id) && item.contentType === type
                ));
            }

            if (favoritesRes.success) {
                setIsFavorite(favoritesRes.favorites.some(item =>
                    item.contentId === parseInt(id) && item.contentType === type
                ));
            }
        } catch (error) {
            console.error('Error checking user lists:', error);
        }
    };

    const handleWatch = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (type === 'tv') {
            navigate(`/watch/tv/${id}/1/1`);
        } else {
            navigate(`/watch/movie/${id}`);
        }
    };

    const handleWatchlist = async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        try {
            if (inWatchlist) {
                await removeFromWatchlist(parseInt(id), type);
            } else {
                await addToWatchlist(parseInt(id), type, details.title || details.name, details.poster_path);
            }
            setInWatchlist(!inWatchlist);
        } catch (error) {
            console.error('Watchlist error:', error);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                await removeFromFavorites(parseInt(id), type);
            } else {
                await addToFavorites(parseInt(id), type, details.title || details.name, details.poster_path);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Favorites error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="android-details android-loading">
                <div className="android-loading__spinner" />
            </div>
        );
    }

    if (!details) {
        return (
            <div className="android-details android-error">
                <span className="android-error__icon">😕</span>
                <h2 className="android-error__title">Not Found</h2>
                <p className="android-error__message">Content not available</p>
            </div>
        );
    }

    const backdropUrl = details.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
        : '';

    const posterUrl = details.poster_path
        ? `https://image.tmdb.org/t/p/w342${details.poster_path}`
        : '';

    return (
        <div className="android-details">
            {/* Backdrop */}
            <div
                className="android-details__backdrop"
                style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            <div className="android-details__gradient" />

            {/* Back Button */}
            <button className="android-details__back" onClick={() => navigate(-1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Content */}
            <div className="android-details__content">
                {/* Poster & Info */}
                <div className="android-details__header">
                    <img
                        src={posterUrl}
                        alt={details.title || details.name}
                        className="android-details__poster"
                    />
                    <div className="android-details__info">
                        <h1 className="android-details__title">{details.title || details.name}</h1>
                        <div className="android-details__meta">
                            {details.vote_average > 0 && (
                                <span className="android-details__rating">★ {details.vote_average.toFixed(1)}</span>
                            )}
                            <span>{details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
                            {details.runtime && <span>{details.runtime}m</span>}
                            {type === 'tv' && <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>}
                        </div>
                        <div className="android-details__genres">
                            {details.genres?.slice(0, 3).map(genre => (
                                <span key={genre.id} className="android-details__genre">{genre.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="android-details__actions">
                    <button className="android-btn android-btn-primary android-details__play" onClick={handleWatch}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        className={`android-btn android-btn-secondary ${inWatchlist ? 'android-details__btn--active' : ''}`}
                        onClick={handleWatchlist}
                    >
                        {inWatchlist ? '✓' : '+'}
                    </button>
                    <button
                        className={`android-btn android-btn-secondary ${isFavorite ? 'android-details__btn--active' : ''}`}
                        onClick={handleFavorite}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* Overview */}
                <div className="android-details__section">
                    <h2 className="android-details__section-title">Overview</h2>
                    <p className="android-details__overview">{details.overview}</p>
                </div>

                {/* Seasons (TV) */}
                {type === 'tv' && seasons.length > 0 && (
                    <div className="android-details__section">
                        <h2 className="android-details__section-title">Seasons</h2>
                        <div className="android-details__seasons android-scroll-hide">
                            {seasons.map(season => (
                                <button
                                    key={season.id}
                                    className={`android-details__season ${selectedSeason === season.season_number ? 'android-details__season--active' : ''}`}
                                    onClick={() => setSelectedSeason(season.season_number)}
                                >
                                    S{season.season_number}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cast */}
                {credits.length > 0 && (
                    <div className="android-details__section">
                        <h2 className="android-details__section-title">Cast</h2>
                        <div className="android-details__cast android-scroll-hide">
                            {credits.map(person => (
                                <div key={person.id} className="android-details__cast-item">
                                    <img
                                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/default-avatar.png'}
                                        alt={person.name}
                                        className="android-details__cast-img"
                                    />
                                    <span className="android-details__cast-name">{person.name}</span>
                                    <span className="android-details__cast-char">{person.character}</span>
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
