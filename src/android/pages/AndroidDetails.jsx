/**
 * Android Details Page v9.0 - PREMIUM
 * Features:
 * - Cinematic backdrop with parallax
 * - Animated content reveal
 * - Quick action buttons
 * - Improved cast carousel
 * - Better episode selector
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

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
    const [episodes, setEpisodes] = useState([]);
    const [scrollY, setScrollY] = useState(0);

    const containerRef = useRef(null);

    useEffect(() => {
        loadDetails();
        if (isAuthenticated()) checkUserLists();
    }, [id, type]);

    useEffect(() => {
        if (type === 'tv' && details) loadEpisodes();
    }, [selectedSeason, details]);

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setScrollY(containerRef.current.scrollTop);
            }
        };
        containerRef.current?.addEventListener('scroll', handleScroll);
        return () => containerRef.current?.removeEventListener('scroll', handleScroll);
    }, []);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [d, credits, sim] = await Promise.all([
                fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
                fetch(`${TMDB_BASE}/${type}/${id}/similar?api_key=${TMDB_API_KEY}`).then(r => r.json())
            ]);
            setDetails(d);
            setCast(credits.cast?.slice(0, 15) || []);
            setSimilar(sim.results?.slice(0, 10) || []);
        } catch (e) { }
        setLoading(false);
    };

    const loadEpisodes = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${selectedSeason}?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setEpisodes(data.episodes || []);
        } catch (e) { }
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

    const handleShare = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (navigator.share) {
            navigator.share({
                title: details.title || details.name,
                url: `https://nexflux.app/${type}/${id}`
            }).catch(() => { });
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
            </div>
        );
    }

    if (!details) {
        return (
            <div style={styles.errorContainer}>
                <span style={{ fontSize: 56 }}>😕</span>
                <h2 style={{ color: colors.text1, margin: '16px 0 8px' }}>Not Found</h2>
                <button style={styles.primaryBtn} onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '';
    const poster = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '';
    const seasons = details.seasons?.filter(s => s.season_number > 0) || [];

    return (
        <div ref={containerRef} style={styles.page}>
            {/* Backdrop with parallax */}
            <div style={{
                ...styles.backdrop,
                backgroundImage: `url(${backdrop})`,
                transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.001})`
            }} />
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
                    <img src={poster} alt="" style={styles.poster} loading="lazy" />
                    <div style={styles.info}>
                        <h1 style={styles.title}>{details.title || details.name}</h1>

                        {/* Meta badges */}
                        <div style={styles.metaBadges}>
                            {details.vote_average > 0 && (
                                <span style={styles.ratingBadge}>
                                    <span style={{ color: colors.gold }}>★</span> {details.vote_average.toFixed(1)}
                                </span>
                            )}
                            <span style={styles.metaBadge}>{(details.release_date || details.first_air_date)?.split('-')[0]}</span>
                            {details.runtime && <span style={styles.metaBadge}>{details.runtime}m</span>}
                            {type === 'tv' && details.number_of_seasons && (
                                <span style={styles.metaBadge}>{details.number_of_seasons} Seasons</span>
                            )}
                        </div>

                        {/* Genres */}
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
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <div style={styles.actionIcons}>
                        <button
                            style={{
                                ...styles.iconBtn,
                                background: inWatchlist ? colors.primary : colors.bg4
                            }}
                            onClick={toggleWatchlist}
                        >
                            {inWatchlist ? '✓' : '+'}
                        </button>
                        <button
                            style={{
                                ...styles.iconBtn,
                                background: isFavorite ? colors.primary : colors.bg4
                            }}
                            onClick={toggleFavorite}
                        >
                            {isFavorite ? '❤️' : '🤍'}
                        </button>
                        <button style={styles.iconBtn} onClick={handleShare}>
                            📤
                        </button>
                    </div>
                </div>

                {/* Overview */}
                <Section title="Synopsis">
                    <p style={styles.overview}>{details.overview || 'No overview available.'}</p>
                </Section>

                {/* Seasons & Episodes for TV */}
                {type === 'tv' && seasons.length > 0 && (
                    <Section title="Seasons & Episodes">
                        {/* Season selector */}
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
                                    Season {s.season_number}
                                </button>
                            ))}
                        </div>

                        {/* Episodes list */}
                        <div style={styles.episodesList}>
                            {episodes.slice(0, 10).map(ep => (
                                <button
                                    key={ep.id}
                                    style={styles.episodeCard}
                                    onClick={() => {
                                        if (navigator.vibrate) navigator.vibrate(10);
                                        navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`);
                                    }}
                                >
                                    <div style={{
                                        ...styles.episodeThumb,
                                        backgroundImage: ep.still_path ? `url(https://image.tmdb.org/t/p/w300${ep.still_path})` : 'none'
                                    }}>
                                        <div style={styles.episodePlay}>▶</div>
                                    </div>
                                    <div style={styles.episodeInfo}>
                                        <span style={styles.episodeNumber}>E{ep.episode_number}</span>
                                        <span style={styles.episodeName}>{ep.name}</span>
                                    </div>
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
                                    <span style={styles.castChar}>{p.character?.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Similar */}
                {similar.length > 0 && (
                    <Section title="More Like This">
                        <div style={styles.similarScroll} className="hide-scrollbar">
                            {similar.map(item => (
                                <ContentCard
                                    key={item.id}
                                    id={item.id}
                                    type={type}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    year={(item.release_date || item.first_air_date)?.split('-')[0]}
                                    size="md"
                                />
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
        background: colors.bg1,
        overflowY: 'auto',
        position: 'relative'
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.bg1
    },
    spinner: {
        width: 48,
        height: 48,
        border: `3px solid ${colors.bg4}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.bg1,
        padding: space.xl,
        textAlign: 'center'
    },
    primaryBtn: {
        padding: `${space.lg}px ${space.xxl}px`,
        background: colors.primary,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        cursor: 'pointer'
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        willChange: 'transform'
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60vh',
        background: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, ${colors.bg1} 100%)`
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
        WebkitBackdropFilter: 'blur(16px)',
        border: 'none',
        borderRadius: '50%',
        color: colors.text1,
        cursor: 'pointer',
        zIndex: 100
    },
    content: {
        position: 'relative',
        padding: space.lg,
        paddingTop: '40vh',
        paddingBottom: 100,
        zIndex: 10
    },
    header: {
        display: 'flex',
        gap: space.lg,
        marginBottom: space.xl
    },
    poster: {
        width: 130,
        aspectRatio: '2/3',
        borderRadius: radius.lg,
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
        lineHeight: 1.15,
        marginBottom: space.sm
    },
    metaBadges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: space.sm
    },
    ratingBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: `4px ${space.sm}px`,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 6,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: colors.text1
    },
    metaBadge: {
        padding: `4px ${space.sm}px`,
        background: colors.bg4,
        borderRadius: 6,
        fontSize: typography.sizes.xs,
        color: colors.text3
    },
    genres: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
    },
    genre: {
        padding: `4px ${space.md}px`,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 6,
        fontSize: typography.sizes.xs,
        color: colors.text2
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
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        boxShadow: shadows.glow,
        cursor: 'pointer'
    },
    actionIcons: {
        display: 'flex',
        gap: space.sm
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
        cursor: 'pointer',
        transition: 'all 0.2s ease'
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
        lineHeight: 1.75
    },
    seasonScroll: {
        display: 'flex',
        gap: space.sm,
        overflowX: 'auto',
        paddingBottom: space.md,
        scrollbarWidth: 'none'
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
        transition: 'all 0.2s ease'
    },
    episodesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: space.md
    },
    episodeCard: {
        display: 'flex',
        gap: space.md,
        padding: 0,
        background: colors.bg3,
        border: 'none',
        borderRadius: radius.md,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left'
    },
    episodeThumb: {
        width: 120,
        height: 70,
        background: colors.bg4,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    episodePlay: {
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '50%',
        color: colors.text1,
        fontSize: 12
    },
    episodeInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: space.md
    },
    episodeNumber: {
        fontSize: typography.sizes.xs,
        color: colors.text4,
        marginBottom: 4
    },
    episodeName: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    castScroll: {
        display: 'flex',
        gap: space.lg,
        overflowX: 'auto',
        scrollbarWidth: 'none'
    },
    castItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0
    },
    castPhoto: {
        width: 70,
        height: 70,
        borderRadius: '50%',
        background: colors.bg4,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        border: `2px solid ${colors.bg5}`
    },
    castName: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
        color: colors.text2,
        maxWidth: 70,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    castChar: {
        fontSize: 10,
        color: colors.text4,
        maxWidth: 70,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    similarScroll: {
        display: 'flex',
        gap: space.md,
        overflowX: 'auto',
        scrollbarWidth: 'none'
    }
};

export default AndroidDetails;
