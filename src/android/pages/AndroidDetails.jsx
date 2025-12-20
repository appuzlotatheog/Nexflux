/**
 * Android Details Page v7.0
 * Cinematic detail view with premium design
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import { colors, space, typography, shadows, radius, commonStyles } from '../styles/designSystem';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidDetails = ({ type: propType }) => {
    const { id } = useParams();
    const type = propType || 'movie';
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        loadDetails();
        if (isAuthenticated()) checkUserLists();
    }, [id, type]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [d, credits, sim] = await Promise.all([
                fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/${type}/${id}/similar?api_key=${TMDB_API_KEY}`).then(r => r.json())
            ]);
            setDetails(d);
            setCast(credits.cast?.slice(0, 12) || []);
            setSimilar(sim.results?.slice(0, 10) || []);
        } catch (e) {
            console.error('Failed to load details:', e);
        }
        setLoading(false);
    };

    const checkUserLists = async () => {
        try {
            const [wl, fav] = await Promise.all([getWatchlist(), getFavorites()]);
            if (wl.success) setInWatchlist(wl.watchlist.some(i => i.contentId === parseInt(id) && i.contentType === type));
            if (fav.success) setIsFavorite(fav.favorites.some(i => i.contentId === parseInt(id) && i.contentType === type));
        } catch (e) { }
    };

    const handlePlay = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (type === 'tv') navigate(`/watch/tv/${id}/${selectedSeason}/1`);
        else navigate(`/watch/movie/${id}`);
    };

    const toggleWatchlist = async () => {
        if (!isAuthenticated()) return navigate('/login');
        if (navigator.vibrate) navigator.vibrate(10);
        try {
            if (inWatchlist) await removeFromWatchlist(parseInt(id), type);
            else await addToWatchlist(parseInt(id), type, details.title || details.name, details.poster_path);
            setInWatchlist(!inWatchlist);
        } catch (e) { }
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated()) return navigate('/login');
        if (navigator.vibrate) navigator.vibrate(10);
        try {
            if (isFavorite) await removeFromFavorites(parseInt(id), type);
            else await addToFavorites(parseInt(id), type, details.title || details.name, details.poster_path);
            setIsFavorite(!isFavorite);
        } catch (e) { }
    };

    if (loading) {
        return (
            <div style={commonStyles.centerContainer}>
                <div style={commonStyles.spinner} />
            </div>
        );
    }

    if (!details) {
        return (
            <div style={commonStyles.centerContainer}>
                <span style={{ fontSize: 48, marginBottom: space.lg }}>😕</span>
                <h2 style={{ color: colors.text1, marginBottom: space.sm }}>Not Found</h2>
                <button style={commonStyles.primaryButton} onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '';
    const poster = details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : '';
    const seasons = details.seasons?.filter(s => s.season_number > 0) || [];

    return (
        <div style={styles.page}>
            {/* Backdrop */}
            <div style={{ ...styles.backdrop, backgroundImage: `url(${backdrop})` }} />
            <div style={styles.gradientOverlay} />

            {/* Back button */}
            <button style={styles.backButton} onClick={() => { if (navigator.vibrate) navigator.vibrate(10); navigate(-1); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Content */}
            <div style={styles.content}>
                {/* Header with poster */}
                <div style={styles.header}>
                    <img src={poster} alt={details.title || details.name} style={styles.poster} />
                    <div style={styles.info}>
                        <h1 style={styles.title}>{details.title || details.name}</h1>
                        <div style={styles.meta}>
                            {details.vote_average > 0 && (
                                <span style={styles.rating}>★ {details.vote_average.toFixed(1)}</span>
                            )}
                            <span>{(details.release_date || details.first_air_date)?.split('-')[0]}</span>
                            {details.runtime && <span>{details.runtime}m</span>}
                            {type === 'tv' && details.number_of_seasons && (
                                <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
                            )}
                        </div>
                        <div style={styles.genres}>
                            {details.genres?.slice(0, 3).map(g => (
                                <span key={g.id} style={styles.genre}>{g.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={styles.actions}>
                    <button style={styles.playButton} onClick={handlePlay}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        style={{ ...styles.iconBtn, background: inWatchlist ? colors.primary : colors.bg4 }}
                        onClick={toggleWatchlist}
                    >
                        {inWatchlist ? '✓' : '+'}
                    </button>
                    <button
                        style={{ ...styles.iconBtn, background: isFavorite ? colors.primary : colors.bg4 }}
                        onClick={toggleFavorite}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* Overview */}
                <Section title="Overview">
                    <p style={styles.overview}>{details.overview}</p>
                </Section>

                {/* Seasons for TV */}
                {type === 'tv' && seasons.length > 0 && (
                    <Section title="Seasons">
                        <div style={styles.seasonScroll} className="hide-scrollbar">
                            {seasons.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setSelectedSeason(s.season_number); }}
                                    style={{
                                        ...styles.seasonBtn,
                                        background: selectedSeason === s.season_number ? colors.primary : colors.bg4,
                                        boxShadow: selectedSeason === s.season_number ? shadows.glow : 'none'
                                    }}
                                >
                                    S{s.season_number}
                                </button>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Cast */}
                {cast.length > 0 && (
                    <Section title="Cast">
                        <div style={styles.castScroll} className="hide-scrollbar">
                            {cast.map(p => (
                                <div key={p.id} style={styles.castItem}>
                                    <div style={{
                                        ...styles.castPhoto,
                                        backgroundImage: p.profile_path ? `url(https://image.tmdb.org/t/p/w185${p.profile_path})` : 'none'
                                    }}>
                                        {!p.profile_path && <span>👤</span>}
                                    </div>
                                    <span style={styles.castName}>{p.name?.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {children}
    </div>
);

const styles = {
    page: {
        minHeight: '100vh',
        background: colors.bg1
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center top'
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55vh',
        background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, ${colors.bg1} 100%)`
    },
    backButton: {
        position: 'fixed',
        top: 'max(16px, env(safe-area-inset-top))',
        left: space.lg,
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        border: 'none',
        borderRadius: '50%',
        color: colors.text1,
        cursor: 'pointer',
        zIndex: 100
    },
    content: {
        position: 'relative',
        padding: space.lg,
        paddingTop: '36vh',
        zIndex: 10
    },
    header: {
        display: 'flex',
        gap: space.lg,
        marginBottom: space.xl
    },
    poster: {
        width: 120,
        aspectRatio: '2/3',
        borderRadius: radius.md,
        boxShadow: shadows.lg,
        objectFit: 'cover'
    },
    info: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        lineHeight: 1.1,
        marginBottom: space.sm
    },
    meta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space.sm,
        fontSize: typography.sizes.sm,
        color: colors.text3,
        marginBottom: space.sm
    },
    rating: {
        color: colors.gold,
        fontWeight: typography.weights.bold
    },
    genres: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
    },
    genre: {
        padding: `4px ${space.md}px`,
        background: colors.bg4,
        borderRadius: 6,
        fontSize: typography.sizes.xs,
        color: colors.text3
    },
    actions: {
        display: 'flex',
        gap: space.md,
        marginBottom: space.xxl
    },
    playButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        flex: 1,
        padding: `${space.lg}px ${space.xl}px`,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        boxShadow: shadows.glow,
        cursor: 'pointer'
    },
    iconBtn: {
        width: 52,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: '50%',
        fontSize: 18,
        cursor: 'pointer'
    },
    section: {
        marginBottom: space.xxl
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        marginBottom: space.md
    },
    overview: {
        fontSize: typography.sizes.md,
        color: colors.text3,
        lineHeight: 1.7
    },
    seasonScroll: {
        display: 'flex',
        gap: space.sm,
        overflowX: 'auto',
        paddingBottom: space.xs
    },
    seasonBtn: {
        padding: `${space.sm}px ${space.lg}px`,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 200ms ease'
    },
    castScroll: {
        display: 'flex',
        gap: space.lg,
        overflowX: 'auto'
    },
    castItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0
    },
    castPhoto: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: colors.bg4,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24
    },
    castName: {
        fontSize: typography.sizes.xs,
        color: colors.text3,
        maxWidth: 64,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    }
};

export default AndroidDetails;
