import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTVDetails, getTVSeasonDetails, getBackdropUrl, getImageUrl } from '../api/tmdb';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { addToRecentlyViewed } from '../components/RecentlyViewed';
import EpisodeSelector from '../components/EpisodeSelector';
import ContentRow from '../components/ContentRow';
import ShareButton from '../components/ShareButton';
import FavoriteButton from '../components/FavoriteButton';
import WatchlistButton from '../components/WatchlistButton';
import Loader from '../components/Loader';
import './Details.css';

function Details() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
    const toast = useToast();
    const [details, setDetails] = useState(null);
    const [seasonDetails, setSeasonDetails] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = type === 'movie'
                    ? await getMovieDetails(id)
                    : await getTVDetails(id);
                setDetails(data);

                // Track in recently viewed
                addToRecentlyViewed({
                    id: parseInt(id),
                    title: data.title || data.name,
                    poster_path: data.poster_path,
                    backdrop_path: data.backdrop_path,
                    media_type: type,
                    vote_average: data.vote_average
                });

                if (type === 'tv' && data.seasons?.length > 0) {
                    const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
                    setSelectedSeason(firstSeason.season_number);
                    const seasonData = await getTVSeasonDetails(id, firstSeason.season_number);
                    setSeasonDetails(seasonData);
                }
            } catch (error) {
                console.error('Failed to fetch details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [type, id]);

    const handleSeasonChange = async (seasonNum) => {
        setSelectedSeason(seasonNum);
        try {
            const seasonData = await getTVSeasonDetails(id, seasonNum);
            setSeasonDetails(seasonData);
        } catch (error) {
            console.error('Failed to fetch season:', error);
        }
    };

    if (loading) return <Loader fullPage />;

    if (!details) {
        return (
            <div className="details container">
                <p className="details__error">Content not found</p>
            </div>
        );
    }

    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').split('-')[0];
    const runtime = details.runtime || (details.episode_run_time?.[0]);
    const rating = details.vote_average ? Math.round(details.vote_average * 10) : null;
    const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    // Content object for buttons
    const contentData = {
        id: parseInt(id),
        title,
        poster_path: details.poster_path,
        media_type: type
    };

    return (
        <div className="details">

            {/* Hero */}
            <div
                className="details__hero"
                style={{ backgroundImage: `url(${getBackdropUrl(details.backdrop_path)})` }}
            >
                <div className="details__hero-gradient" />
            </div>

            <div className="details__content container">
                <div className="details__main">
                    {/* Poster */}
                    <div className="details__poster-wrapper">
                        <div className="details__poster">
                            <img src={getImageUrl(details.poster_path, 'w500')} alt={title} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="details__info">
                        <div className="details__badges">
                            {rating >= 70 && <span className="badge badge-primary">⭐ POPULAR</span>}
                            <span className="badge badge-hd">HD</span>
                            {type === 'tv' && <span className="badge badge-new">SERIES</span>}
                            {/* Content Rating Badge */}
                            {details.adult && <span className="badge details__badge-mature">18+</span>}
                            {!details.adult && <span className="badge details__badge-rating">PG-13</span>}
                        </div>

                        <h1 className="details__title">{title}</h1>

                        <div className="details__meta">
                            {rating && (
                                <span className={`rating ${rating >= 70 ? 'rating--good' : rating >= 50 ? 'rating--average' : 'rating--poor'}`}>
                                    ⭐ {rating}%
                                </span>
                            )}
                            {year && <span>{year}</span>}
                            {runtime && <span>{runtime} min</span>}
                            {type === 'tv' && details.number_of_seasons && (
                                <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
                            )}
                        </div>

                        <div className="details__genres">
                            {details.genres?.map((genre) => (
                                <Link key={genre.id} to={`/browse/${type}/${genre.id}`} className="genre-tag">
                                    {genre.name}
                                </Link>
                            ))}
                        </div>

                        <div className="details__actions">
                            <Link
                                to={`/watch/${type}/${id}${type === 'tv' ? `/${selectedSeason}/1` : ''}`}
                                className="btn btn-play"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Play Now
                            </Link>

                            <FavoriteButton content={contentData} size="lg" />
                            <WatchlistButton content={contentData} size="lg" showLabel />

                            {trailer && (
                                <a
                                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                        <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                    </svg>
                                    Trailer
                                </a>
                            )}

                            <ShareButton
                                title={`Watch ${title} on Nexflux`}
                                url={window.location.href}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="details__tabs">
                            <button
                                className={`details__tab ${activeTab === 'overview' ? 'details__tab--active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Overview
                            </button>
                            {type === 'tv' && (
                                <button
                                    className={`details__tab ${activeTab === 'episodes' ? 'details__tab--active' : ''}`}
                                    onClick={() => setActiveTab('episodes')}
                                >
                                    Episodes
                                </button>
                            )}
                            <button
                                className={`details__tab ${activeTab === 'cast' ? 'details__tab--active' : ''}`}
                                onClick={() => setActiveTab('cast')}
                            >
                                Cast
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="details__tab-content">
                            {activeTab === 'overview' && (
                                <div className="details__overview animate-fade-in">
                                    <p>{details.overview || 'No overview available.'}</p>
                                </div>
                            )}

                            {activeTab === 'episodes' && type === 'tv' && (
                                <div className="details__episodes-tab animate-fade-in">
                                    <EpisodeSelector
                                        seasons={details.seasons.filter(s => s.season_number > 0)}
                                        currentSeason={selectedSeason}
                                        currentEpisode={1}
                                        onSelectSeason={handleSeasonChange}
                                        onSelectEpisode={(ep) => navigate(`/watch/tv/${id}/${selectedSeason}/${ep}`)}
                                        episodes={seasonDetails?.episodes || []}
                                    />
                                </div>
                            )}

                            {activeTab === 'cast' && details.credits?.cast?.length > 0 && (
                                <div className="details__cast animate-fade-in">
                                    <div className="details__cast-list">
                                        {details.credits.cast.slice(0, 10).map((person) => (
                                            <div key={person.id} className="details__cast-item">
                                                <div className="details__cast-photo">
                                                    {person.profile_path ? (
                                                        <img src={getImageUrl(person.profile_path, 'w185')} alt={person.name} />
                                                    ) : (
                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="details__cast-info">
                                                    <span className="details__cast-name">{person.name}</span>
                                                    <span className="details__cast-character">{person.character}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar */}
                {details.similar?.results?.length > 0 && (
                    <ContentRow
                        title="More Like This"
                        items={details.similar.results.map(item => ({ ...item, media_type: type }))}
                    />
                )}

                {details.recommendations?.results?.length > 0 && (
                    <ContentRow
                        title="Recommendations"
                        items={details.recommendations.results.map(item => ({ ...item, media_type: type }))}
                    />
                )}
            </div>
        </div>
    );
}

export default Details;
