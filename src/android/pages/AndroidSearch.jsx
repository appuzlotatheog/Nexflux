/**
 * Android Search Page
 * Search with voice support and filters
 */
import React, { useState, useEffect, useCallback } from 'react';
import AndroidContentCard from '../components/ContentCard';
import './AndroidSearch.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [trending, setTrending] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'movie', label: 'Movies' },
        { id: 'tv', label: 'TV Shows' },
    ];

    // Fetch trending on mount
    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setTrending(data.results || []);
        } catch (error) {
            console.error('Error fetching trending:', error);
        }
    };

    // Debounced search
    const searchContent = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = activeFilter === 'all'
                ? `${TMDB_BASE}/search/multi`
                : `${TMDB_BASE}/search/${activeFilter}`;

            const res = await fetch(`${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            // Filter out people
            const filtered = (data.results || []).filter(item =>
                item.media_type !== 'person' && (item.poster_path || item.backdrop_path)
            );

            setResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter]);

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            searchContent(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query, searchContent]);

    const handleVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.onresult = (event) => {
                setQuery(event.results[0][0].transcript);
            };
            recognition.start();
        }
    };

    return (
        <div className="android-search">
            {/* Search Header */}
            <header className="android-search__header android-glass">
                <div className="android-search__input-wrapper">
                    <svg className="android-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        className="android-search__input"
                        placeholder="Search movies, TV shows..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {query && (
                        <button
                            className="android-search__clear"
                            onClick={() => setQuery('')}
                        >
                            ✕
                        </button>
                    )}
                    <button
                        className="android-search__voice"
                        onClick={handleVoiceSearch}
                        aria-label="Voice search"
                    >
                        🎤
                    </button>
                </div>

                {/* Filters */}
                <div className="android-search__filters">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            className={`android-search__filter ${activeFilter === filter.id ? 'android-search__filter--active' : ''}`}
                            onClick={() => setActiveFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <div className="android-search__content">
                {isLoading ? (
                    <div className="android-loading">
                        <div className="android-loading__spinner" />
                    </div>
                ) : query && results.length > 0 ? (
                    <div className="android-search__results">
                        <h2 className="android-search__title">Results</h2>
                        <div className="android-search__grid">
                            {results.map(item => (
                                <AndroidContentCard
                                    key={item.id}
                                    id={item.id}
                                    type={item.media_type || activeFilter}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    year={item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                                />
                            ))}
                        </div>
                    </div>
                ) : query && !isLoading ? (
                    <div className="android-search__empty">
                        <span className="android-search__empty-icon">🔍</span>
                        <p>No results found for "{query}"</p>
                    </div>
                ) : (
                    <div className="android-search__trending">
                        <h2 className="android-search__title">Trending</h2>
                        <div className="android-search__grid">
                            {trending.slice(0, 12).map(item => (
                                <AndroidContentCard
                                    key={item.id}
                                    id={item.id}
                                    type={item.media_type}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AndroidSearch;
