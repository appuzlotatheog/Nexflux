import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { intelligentSearch } from '../api/gemini';
import { searchMulti } from '../api/tmdb';
import './SmartSearch.css';

function SmartSearch({ onClose }) {
    const [query, setQuery] = useState('');
    const [isAIMode, setIsAIMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Debounced AI search
    useEffect(() => {
        if (!query.trim() || query.length < 3) {
            setAiSuggestions([]);
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                if (isAIMode) {
                    // AI-powered intelligent search
                    const result = await intelligentSearch(query);
                    setAiSuggestions(result.suggestions || []);

                    // Also get TMDB results for the keywords
                    if (result.searchTerms?.length) {
                        const tmdbResults = await searchMulti(result.searchTerms[0]);
                        setSearchResults(tmdbResults.results?.slice(0, 6) || []);
                    }
                } else {
                    // Regular TMDB search
                    const results = await searchMulti(query);
                    setSearchResults(results.results?.slice(0, 8) || []);
                }
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, isAIMode ? 800 : 400);

        return () => clearTimeout(timer);
    }, [query, isAIMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}&ai=${isAIMode}`);
            onClose?.();
        }
    };

    const handleSuggestionClick = (title) => {
        navigate(`/search?q=${encodeURIComponent(title)}`);
        onClose?.();
    };

    const handleResultClick = (item) => {
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        navigate(`/details/${type}/${item.id}`);
        onClose?.();
    };

    const exampleQueries = [
        "Funny movies with dogs",
        "Shows like Breaking Bad",
        "Romantic comedies from 2023",
        "Sci-fi with time travel",
        "Feel-good movies for a rainy day"
    ];

    return (
        <div className="smart-search">
            <div className="smart-search__header">
                <div className="smart-search__mode-toggle">
                    <button
                        className={`smart-search__mode ${!isAIMode ? 'smart-search__mode--active' : ''}`}
                        onClick={() => setIsAIMode(false)}
                    >
                        🔍 Standard
                    </button>
                    <button
                        className={`smart-search__mode ${isAIMode ? 'smart-search__mode--active' : ''}`}
                        onClick={() => setIsAIMode(true)}
                    >
                        ✨ AI Search
                    </button>
                </div>
                <button className="smart-search__close" onClick={onClose}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="smart-search__form">
                <div className="smart-search__input-wrapper">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isAIMode ? "Try: 'funny movies with dogs' or 'shows like Breaking Bad'" : "Search movies and TV shows..."}
                        className="smart-search__input"
                    />
                    {loading && <div className="smart-search__spinner" />}
                </div>
            </form>

            {isAIMode && !query && (
                <div className="smart-search__examples">
                    <p className="smart-search__examples-label">Try asking:</p>
                    <div className="smart-search__examples-list">
                        {exampleQueries.map((example) => (
                            <button
                                key={example}
                                className="smart-search__example"
                                onClick={() => setQuery(example)}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showResults && (
                <div className="smart-search__results">
                    {aiSuggestions.length > 0 && isAIMode && (
                        <div className="smart-search__section">
                            <h4 className="smart-search__section-title">✨ AI Suggestions</h4>
                            <div className="smart-search__suggestions">
                                {aiSuggestions.map((title) => (
                                    <button
                                        key={title}
                                        className="smart-search__suggestion"
                                        onClick={() => handleSuggestionClick(title)}
                                    >
                                        <span className="smart-search__suggestion-icon">🎬</span>
                                        {title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="smart-search__section">
                            <h4 className="smart-search__section-title">
                                {isAIMode ? '📺 Related Content' : '🔍 Results'}
                            </h4>
                            <div className="smart-search__grid">
                                {searchResults.map((item) => (
                                    <button
                                        key={item.id}
                                        className="smart-search__result"
                                        onClick={() => handleResultClick(item)}
                                    >
                                        {item.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                alt={item.title || item.name}
                                                className="smart-search__result-poster"
                                            />
                                        ) : (
                                            <div className="smart-search__result-placeholder">🎬</div>
                                        )}
                                        <div className="smart-search__result-info">
                                            <span className="smart-search__result-title">
                                                {item.title || item.name}
                                            </span>
                                            <span className="smart-search__result-meta">
                                                {item.media_type === 'tv' ? 'TV' : 'Movie'} • {(item.release_date || item.first_air_date || '').split('-')[0]}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && query && aiSuggestions.length === 0 && searchResults.length === 0 && (
                        <div className="smart-search__empty">
                            <span>🔍</span>
                            <p>No results found. Try a different search!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SmartSearch;
