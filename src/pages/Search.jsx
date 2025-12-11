import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMulti, getImageUrl } from '../api/tmdb';
import Loader from '../components/Loader';
import './Search.css';

function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const searchContent = async () => {
            setLoading(true);
            try {
                const data = await searchMulti(query);
                setResults(data.results.filter(item =>
                    item.media_type === 'movie' || item.media_type === 'tv'
                ));
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        searchContent();
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue.trim() });
        }
    };

    const filteredResults = filter === 'all'
        ? results
        : results.filter(item => item.media_type === filter);

    return (
        <div className="search container">
            {/* Header */}
            <div className="search__header">
                <form onSubmit={handleSubmit} className="search__form">
                    <div className="search__input-wrapper">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="search__input-icon">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input
                            type="text"
                            className="search__input"
                            placeholder="Search movies, TV shows..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                        {inputValue && (
                            <button
                                type="button"
                                className="search__clear"
                                onClick={() => { setInputValue(''); setSearchParams({}); }}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </form>

                {results.length > 0 && (
                    <div className="search__filters">
                        <button
                            className={`search__filter ${filter === 'all' ? 'search__filter--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({results.length})
                        </button>
                        <button
                            className={`search__filter ${filter === 'movie' ? 'search__filter--active' : ''}`}
                            onClick={() => setFilter('movie')}
                        >
                            🎬 Movies ({results.filter(r => r.media_type === 'movie').length})
                        </button>
                        <button
                            className={`search__filter ${filter === 'tv' ? 'search__filter--active' : ''}`}
                            onClick={() => setFilter('tv')}
                        >
                            📺 TV Shows ({results.filter(r => r.media_type === 'tv').length})
                        </button>
                    </div>
                )}
            </div>

            {loading && <Loader />}

            {!query && !loading && (
                <div className="search__empty">
                    <div className="search__empty-icon">🔍</div>
                    <h2>Search for Movies & TV Shows</h2>
                    <p>Find your favorite content</p>
                </div>
            )}

            {query && filteredResults.length === 0 && !loading && (
                <div className="search__empty">
                    <div className="search__empty-icon">😔</div>
                    <h2>No results found</h2>
                    <p>We couldn't find anything for "{query}"</p>
                </div>
            )}

            {!loading && (
                <div className="search__results">
                    {filteredResults.map((item, index) => {
                        const title = item.title || item.name;
                        const year = (item.release_date || item.first_air_date || '').split('-')[0];
                        const rating = item.vote_average ? Math.round(item.vote_average * 10) : null;

                        return (
                            <Link
                                key={`${item.media_type}-${item.id}`}
                                to={`/details/${item.media_type}/${item.id}`}
                                className="search__item"
                                style={{ animationDelay: `${index * 0.04}s` }}
                            >
                                <div className="search__item-poster">
                                    {item.poster_path ? (
                                        <img src={getImageUrl(item.poster_path, 'w342')} alt={title} loading="lazy" />
                                    ) : (
                                        <div className="search__item-no-image">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                                                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="search__item-overlay">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <span className="search__item-type">
                                        {item.media_type === 'movie' ? '🎬' : '📺'}
                                    </span>
                                </div>
                                <div className="search__item-info">
                                    <h3 className="search__item-title">{title}</h3>
                                    <div className="search__item-meta">
                                        {rating && (
                                            <span className={`rating ${rating >= 70 ? 'rating--good' : 'rating--average'}`}>
                                                {rating}%
                                            </span>
                                        )}
                                        {year && <span className="search__item-year">{year}</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Search;
