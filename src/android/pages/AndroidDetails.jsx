/**
 * Android Details Page v4.0
 * Uses a- prefix classes
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import '../styles/android.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidDetails = ({ type: propType }) => {
    const { id } = useParams();
    const type = propType || 'movie';
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        loadDetails();
        if (isAuthenticated()) checkLists();
    }, [id, type]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [d, c] = await Promise.all([
                fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
            ]);
            setDetails(d);
            setCast(c.cast?.slice(0, 10) || []);
            if (type === 'tv' && d.seasons) setSeasons(d.seasons.filter(s => s.season_number > 0));
        } catch (e) { }
        setLoading(false);
    };

    const checkLists = async () => {
        try {
            const [wl, fav] = await Promise.all([getWatchlist(), getFavorites()]);
            if (wl.success) setInWatchlist(wl.watchlist.some(i => i.contentId === parseInt(id) && i.contentType === type));
            if (fav.success) setIsFavorite(fav.favorites.some(i => i.contentId === parseInt(id) && i.contentType === type));
        } catch (e) { }
    };

    const handleWatch = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (type === 'tv') navigate(`/watch/tv/${id}/${selectedSeason}/1`);
        else navigate(`/watch/movie/${id}`);
    };

    const handleWatchlist = async () => {
        if (!isAuthenticated()) return navigate('/login');
        try {
            if (inWatchlist) await removeFromWatchlist(parseInt(id), type);
            else await addToWatchlist(parseInt(id), type, details.title || details.name, details.poster_path);
            setInWatchlist(!inWatchlist);
        } catch (e) { }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated()) return navigate('/login');
        try {
            if (isFavorite) await removeFromFavorites(parseInt(id), type);
            else await addToFavorites(parseInt(id), type, details.title || details.name, details.poster_path);
            setIsFavorite(!isFavorite);
        } catch (e) { }
    };

    if (loading) return <div className="a-loading"><div className="a-spinner" /></div>;

    if (!details) {
        return (
            <div className="a-error">
                <span className="a-error__icon">😕</span>
                <h2 className="a-error__title">Not Found</h2>
                <p className="a-error__text">Content not available</p>
                <button className="a-btn a-btn--primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '';
    const poster = details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : '';

    return (
        <div className="a-details">
            <div className="a-details__backdrop" style={{ backgroundImage: `url(${backdrop})` }} />
            <div className="a-details__gradient" />

            <button className="a-details__back" onClick={() => navigate(-1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="a-details__content a-slide-up">
                <div className="a-details__header">
                    <img src={poster} alt={details.title || details.name} className="a-details__poster" />
                    <div className="a-details__info">
                        <h1 className="a-details__title">{details.title || details.name}</h1>
                        <div className="a-details__meta">
                            {details.vote_average > 0 && <span className="a-details__rating">★ {details.vote_average.toFixed(1)}</span>}
                            <span>{(details.release_date || details.first_air_date)?.split('-')[0]}</span>
                            {details.runtime && <span>{details.runtime}m</span>}
                            {type === 'tv' && <span>{details.number_of_seasons}S</span>}
                        </div>
                        <div className="a-details__genres">
                            {details.genres?.slice(0, 3).map(g => <span key={g.id} className="a-details__genre">{g.name}</span>)}
                        </div>
                    </div>
                </div>

                <div className="a-details__actions">
                    <button className="a-btn a-btn--primary" style={{ flex: 1 }} onClick={handleWatch}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}><path d="M8 5v14l11-7z" /></svg>
                        Play
                    </button>
                    <button className={`a-btn a-btn--icon ${inWatchlist ? 'a-btn--primary' : 'a-btn--secondary'}`} onClick={handleWatchlist}>
                        {inWatchlist ? '✓' : '+'}
                    </button>
                    <button className={`a-btn a-btn--icon ${isFavorite ? 'a-btn--primary' : 'a-btn--secondary'}`} onClick={handleFavorite}>
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>

                <div className="a-details__section">
                    <h2 className="a-details__section-title">Overview</h2>
                    <p className="a-details__overview">{details.overview}</p>
                </div>

                {type === 'tv' && seasons.length > 0 && (
                    <div className="a-details__section">
                        <h2 className="a-details__section-title">Seasons</h2>
                        <div className="a-scroll-x" style={{ padding: '4px 0' }}>
                            {seasons.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSeason(s.season_number)}
                                    className="a-btn"
                                    style={{
                                        background: selectedSeason === s.season_number ? 'var(--a-primary)' : 'var(--a-bg-4)',
                                        color: selectedSeason === s.season_number ? 'white' : 'var(--a-text-3)',
                                        padding: '10px 20px'
                                    }}
                                >
                                    S{s.season_number}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {cast.length > 0 && (
                    <div className="a-details__section">
                        <h2 className="a-details__section-title">Cast</h2>
                        <div className="a-scroll-x" style={{ padding: '4px 0' }}>
                            {cast.map(p => (
                                <div key={p.id} style={{ textAlign: 'center', width: 80, flexShrink: 0 }}>
                                    <img
                                        src={p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : ''}
                                        alt={p.name}
                                        style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', background: 'var(--a-bg-4)' }}
                                    />
                                    <p style={{ fontSize: 11, marginTop: 6, color: 'var(--a-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
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
