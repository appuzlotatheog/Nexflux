import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getPopularMovies,
    getPopularTV,
    getMoviesByGenre,
    getTVByGenre,
    getMovieGenres,
    getTVGenres,
    getImageUrl,
    getPopularAnime,
    getTopRatedAnime,
    getTrendingAnime,
} from '../api/tmdb';
import Loader from '../components/Loader';
import './Browse.css';

// Anime genre categories
const ANIME_GENRES = [
    { id: 'popular', name: 'Popular' },
    { id: 'top-rated', name: 'Top Rated' },
    { id: 'trending', name: 'Trending' },
];

function Browse() {
    const { type, genreId } = useParams();
    const [content, setContent] = useState([]);
    const [genres, setGenres] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true); // Only for first load
    const [transitioning, setTransitioning] = useState(false); // For smooth transitions
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [contentKey, setContentKey] = useState(0); // Force animation on content change

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                if (type === 'anime') {
                    setGenres(ANIME_GENRES);
                } else {
                    const data = type === 'movie' ? await getMovieGenres() : await getTVGenres();
                    setGenres(data.genres);
                }
            } catch (error) {
                console.error('Failed to fetch genres:', error);
            }
        };
        fetchGenres();
    }, [type]);

    const hasLoadedOnce = useRef(false);

    useEffect(() => {
        const fetchContent = async () => {
            // Use transitioning for subsequent loads (smooth fade), initial loading for first
            if (hasLoadedOnce.current) {
                setTransitioning(true);
            } else {
                setInitialLoading(true);
            }
            setPage(1);
            try {
                let data;
                if (type === 'anime') {
                    // Handle anime categories
                    if (genreId === 'top-rated') {
                        data = await getTopRatedAnime();
                    } else if (genreId === 'trending') {
                        data = await getTrendingAnime();
                    } else {
                        data = await getPopularAnime();
                    }
                } else if (genreId) {
                    data = type === 'movie' ? await getMoviesByGenre(genreId) : await getTVByGenre(genreId);
                } else {
                    data = type === 'movie' ? await getPopularMovies() : await getPopularTV();
                }
                setContent(data.results);
                setHasMore(data.page < data.total_pages);
                setContentKey(prev => prev + 1); // Trigger animation
                hasLoadedOnce.current = true;
            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setInitialLoading(false);
                setTransitioning(false);
            }
        };
        fetchContent();
    }, [type, genreId]);

    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            let data;
            if (type === 'anime') {
                if (genreId === 'top-rated') {
                    data = await getTopRatedAnime(nextPage);
                } else if (genreId === 'trending') {
                    data = await getTrendingAnime(nextPage);
                } else {
                    data = await getPopularAnime(nextPage);
                }
            } else if (genreId) {
                data = type === 'movie' ? await getMoviesByGenre(genreId, nextPage) : await getTVByGenre(genreId, nextPage);
            } else {
                data = type === 'movie' ? await getPopularMovies(nextPage) : await getPopularTV(nextPage);
            }
            setContent(prev => [...prev, ...data.results]);
            setPage(nextPage);
            setHasMore(nextPage < data.total_pages);
        } catch (error) {
            console.error('Failed to load more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const currentGenre = genreId ? genres.find(g => String(g.id) === genreId)?.name : null;

    // Get page title
    const getTitle = () => {
        if (type === 'anime') return '🎌 Anime';
        if (type === 'movie') return '🎬 Movies';
        return '📺 TV Shows';
    };

    if (initialLoading) return <Loader fullPage />;

    return (
        <div className="browse container">
            {/* Header */}
            <div className="browse__header">
                <div className="browse__title-section">
                    <h1 className="browse__title">
                        {getTitle()}
                    </h1>
                    {currentGenre && <span className="browse__subtitle" key={currentGenre}>{currentGenre}</span>}
                </div>
                <div className="browse__type-toggle">
                    <Link
                        to="/browse/movie"
                        className={`browse__type-btn ${type === 'movie' ? 'browse__type-btn--active' : ''}`}
                    >
                        Movies
                    </Link>
                    <Link
                        to="/browse/tv"
                        className={`browse__type-btn ${type === 'tv' ? 'browse__type-btn--active' : ''}`}
                    >
                        TV Shows
                    </Link>
                    <Link
                        to="/browse/anime"
                        className={`browse__type-btn ${type === 'anime' ? 'browse__type-btn--active' : ''}`}
                    >
                        Anime
                    </Link>
                </div>
            </div>

            {/* Genres */}
            <div className="browse__genres">
                <Link
                    to={`/browse/${type}`}
                    className={`browse__genre ${!genreId ? 'browse__genre--active' : ''}`}
                >
                    All
                </Link>
                {genres.map((genre) => (
                    <Link
                        key={genre.id}
                        to={`/browse/${type}/${genre.id}`}
                        className={`browse__genre ${genreId === String(genre.id) ? 'browse__genre--active' : ''}`}
                    >
                        {genre.name}
                    </Link>
                ))}
            </div>

            {/* Grid */}
            <div
                key={contentKey}
                className={`browse__grid ${transitioning ? 'browse__grid--loading' : 'browse__grid--loaded'}`}
            >
                {content.map((item, index) => {
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date || '').split('-')[0];
                    const rating = item.vote_average ? Math.round(item.vote_average * 10) : null;

                    return (
                        <Link
                            key={item.id}
                            to={`/details/${type === 'anime' ? 'tv' : type}/${item.id}`}
                            className="browse__item"
                            style={{ animationDelay: `${(index % 20) * 0.03}s` }}
                        >
                            <div className="browse__item-poster">
                                {item.poster_path ? (
                                    <img src={getImageUrl(item.poster_path, 'w342')} alt={title} loading="lazy" />
                                ) : (
                                    <div className="browse__item-no-image">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                                            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="browse__item-overlay">
                                    <div className="browse__item-play">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                {rating && (
                                    <span className={`browse__item-rating ${rating >= 70 ? 'browse__item-rating--good' : ''}`}>
                                        {rating}%
                                    </span>
                                )}
                            </div>
                            <div className="browse__item-info">
                                <h3 className="browse__item-title">{title}</h3>
                                <span className="browse__item-year">{year}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {hasMore && (
                <div className="browse__load-more">
                    <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Browse;
