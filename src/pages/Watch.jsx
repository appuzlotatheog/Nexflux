import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Player from '../components/Player';
import EpisodeSelector from '../components/EpisodeSelector';
import Loader from '../components/Loader';
import { getMovieDetails, getTVDetails, getTVSeasonDetails } from '../api/tmdb';
import { saveWatchProgress } from '../utils/watchHistory';
import './Watch.css';

// Player sources configuration (for UI display)
const PLAYER_SOURCES = [
    { id: 'xenon', name: 'Xenon', badge: 'Fast', badgeColor: '#3498db' },
    { id: 'helium', name: 'Helium', badge: 'No Ads', badgeColor: '#16a085' },
    { id: 'neon', name: 'Neon', badge: null, badgeColor: null },
    { id: 'argon', name: 'Argon', badge: null, badgeColor: null },
];

function Watch() {
    const { type, id, season = '1', episode = '1' } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [seasonDetails, setSeasonDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [showServerMenu, setShowServerMenu] = useState(false);

    // Server selection state
    const [activeSource, setActiveSource] = useState(() => {
        const saved = localStorage.getItem('nexflux_player_source');
        return saved || 'xenon';
    });

    const currentSeason = parseInt(season);
    const currentEpisode = parseInt(episode);

    const currentSource = PLAYER_SOURCES.find(s => s.id === activeSource) || PLAYER_SOURCES[0];

    const handleSourceChange = (sourceId) => {
        setActiveSource(sourceId);
        localStorage.setItem('nexflux_player_source', sourceId);
        setShowServerMenu(false);
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                if (type === 'movie') {
                    const data = await getMovieDetails(id);
                    setDetails(data);
                } else {
                    const [tvData, seasonData] = await Promise.all([
                        getTVDetails(id),
                        getTVSeasonDetails(id, currentSeason),
                    ]);
                    setDetails(tvData);
                    setSeasonDetails(seasonData);
                }
            } catch (error) {
                console.error('Failed to fetch details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [type, id, currentSeason, currentEpisode]);

    useEffect(() => {
        let timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 4000);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate(`/details/${type}/${id}`);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keydown', handleKeyDown);
        timeout = setTimeout(() => setShowControls(false), 4000);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeout);
        };
    }, [navigate, type, id]);

    // Track progress periodically (simulated since iframe doesn't expose video time)
    useEffect(() => {
        if (!details) return;

        // Save initial watch start
        const item = {
            id: parseInt(id),
            type,
            title: details.title || details.name,
            poster_path: details.poster_path,
            backdrop_path: details.backdrop_path,
        };

        const episodeInfo = type === 'tv' ? {
            season: currentSeason,
            episode: currentEpisode,
            episodeName: seasonDetails?.episodes?.[currentEpisode - 1]?.name || '',
        } : null;

        // Simulate progress tracking (since we can't access iframe video time)
        let progress = 0.1;
        const duration = type === 'movie' ? 7200 : 2700; // 2h for movie, 45min for TV

        // Save initial progress
        saveWatchProgress(item, duration * progress, duration, episodeInfo);

        const progressInterval = setInterval(() => {
            progress = Math.min(progress + 0.05, 0.95); // Cap at 95%
            saveWatchProgress(item, duration * progress, duration, episodeInfo);
        }, 30000); // Every 30 seconds

        return () => clearInterval(progressInterval);
    }, [details, type, id, currentSeason, currentEpisode, seasonDetails]);

    const handleSelectSeason = async (seasonNum) => {
        navigate(`/watch/tv/${id}/${seasonNum}/1`);
    };

    const handleSelectEpisode = (episodeNum) => {
        navigate(`/watch/tv/${id}/${currentSeason}/${episodeNum}`);
        setShowEpisodes(false);
    };

    if (loading) return <Loader fullPage />;

    const title = details?.title || details?.name;
    const episodeTitle = type === 'tv' && seasonDetails?.episodes?.[currentEpisode - 1]
        ? seasonDetails.episodes[currentEpisode - 1].name
        : '';

    return (
        <div className="watch">
            <div className={`watch__controls ${showControls ? 'watch__controls--visible' : ''}`}>
                <div className="watch__header">
                    <Link to={`/details/${type}/${id}`} className="watch__back">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                    </Link>
                    <div className="watch__title">
                        <h1>{title}</h1>
                        {type === 'tv' && (
                            <span className="watch__episode-info">
                                S{currentSeason} • E{currentEpisode} "{episodeTitle}"
                            </span>
                        )}
                    </div>
                </div>

                <div className="watch__controls-right">
                    {/* Server Selector */}
                    <div className="watch__server-select">
                        <button
                            className="watch__server-btn"
                            onClick={() => setShowServerMenu(!showServerMenu)}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M2 4h20v4H2zm0 6h20v4H2zm0 6h20v4H2z" />
                            </svg>
                            {currentSource.name}
                            {currentSource.badge && (
                                <span className="watch__server-badge" style={{ background: currentSource.badgeColor }}>
                                    {currentSource.badge}
                                </span>
                            )}
                        </button>

                        {showServerMenu && (
                            <div className="watch__server-menu">
                                {PLAYER_SOURCES.map((source) => (
                                    <button
                                        key={source.id}
                                        className={`watch__server-option ${activeSource === source.id ? 'watch__server-option--active' : ''}`}
                                        onClick={() => handleSourceChange(source.id)}
                                    >
                                        {source.name}
                                        {source.badge && (
                                            <span className="watch__server-badge" style={{ background: source.badgeColor }}>
                                                {source.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {type === 'tv' && details?.seasons && (
                        <button
                            className={`watch__episodes-btn ${showEpisodes ? 'watch__episodes-btn--active' : ''}`}
                            onClick={() => setShowEpisodes(!showEpisodes)}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                            </svg>
                            Episodes
                        </button>
                    )}
                </div>
            </div>

            <Player
                type={type}
                tmdbId={id}
                season={currentSeason}
                episode={currentEpisode}
                autoPlay={true}
                activeSource={activeSource}
            />

            {/* Episode Panel */}
            <div className={`watch__episodes-panel ${showEpisodes ? 'watch__episodes-panel--open' : ''}`}>
                <div className="watch__episodes-header">
                    <h3>Episodes</h3>
                    <button className="watch__close-episodes" onClick={() => setShowEpisodes(false)}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
                {type === 'tv' && (
                    <EpisodeSelector
                        seasons={details.seasons.filter(s => s.season_number > 0)}
                        currentSeason={currentSeason}
                        currentEpisode={currentEpisode}
                        onSelectSeason={handleSelectSeason}
                        onSelectEpisode={handleSelectEpisode}
                        episodes={seasonDetails?.episodes || []}
                    />
                )}
            </div>

            {showEpisodes && <div className="watch__backdrop" onClick={() => setShowEpisodes(false)} />}
        </div>
    );
}

export default Watch;

