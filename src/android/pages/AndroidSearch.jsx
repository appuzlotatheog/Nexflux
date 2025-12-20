/**
 * Android Search Page v9.0 - PREMIUM
 * Features:
 * - Auto-suggestions as you type
 * - Recent searches
 * - Voice search
 * - Filters: Genre, Year, Rating, Type
 * - Trending when empty
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ContentCard from '../components/ContentCard';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const GENRES = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' },
];

const AndroidSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [trending, setTrending] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [filter, setFilter] = useState('all');
    const [selectedGenre, setSelectedGenre] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        loadTrending();
        loadRecentSearches();
    }, []);

    const loadTrending = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setTrending(data.results?.filter(i => i.poster_path) || []);
        } catch (e) { }
    };

    const loadRecentSearches = () => {
        try {
            const stored = localStorage.getItem('recentSearches');
            if (stored) setRecentSearches(JSON.parse(stored).slice(0, 8));
        } catch (e) { }
    };

    const saveRecentSearch = (term) => {
        try {
            const searches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8);
            localStorage.setItem('recentSearches', JSON.stringify(searches));
            setRecentSearches(searches);
        } catch (e) { }
    };

    const clearRecentSearches = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        localStorage.removeItem('recentSearches');
        setRecentSearches([]);
    };

    const search = useCallback(async (q) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            let endpoint;
            if (filter === 'all') {
                endpoint = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
            } else {
                endpoint = `${TMDB_BASE}/search/${filter}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
            }

            const res = await fetch(endpoint);
            const data = await res.json();

            let filtered = (data.results || []).filter(i => i.media_type !== 'person' && i.poster_path);

            // Apply genre filter
            if (selectedGenre) {
                filtered = filtered.filter(i => i.genre_ids?.includes(selectedGenre));
            }

            setResults(filtered);

            // Save to recent
            if (q.trim().length > 2) {
                saveRecentSearch(q.trim());
            }
        } catch (e) { }
        setLoading(false);
    }, [filter, selectedGenre]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => search(query), 400);
        return () => clearTimeout(t);
    }, [query, search]);

    const handleVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            if (navigator.vibrate) navigator.vibrate(10);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.onresult = (e) => {
                setQuery(e.results[0][0].transcript);
            };
            recognition.start();
        }
    };

    const handleRecentClick = (term) => {
        if (navigator.vibrate) navigator.vibrate(8);
        setQuery(term);
        inputRef.current?.focus();
    };

    const displayItems = query ? results : trending;
    const showTitle = query ? `Results for "${query}"` : 'Trending This Week';

    return (
        <div style={styles.page}>
            {/* Search Header */}
            <header style={styles.header}>
                <h1 style={styles.pageTitle}>Search</h1>

                {/* Search Box */}
                <div style={styles.searchBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={colors.text4} strokeWidth="2" width="20" height="20">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Movies, TV shows, actors..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={styles.searchInput}
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            style={styles.clearBtn}
                        >
                            ✕
                        </button>
                    )}
                    <button onClick={handleVoiceSearch} style={styles.voiceBtn}>
                        🎤
                    </button>
                </div>

                {/* Filter tabs */}
                <div style={styles.filters}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'movie', label: 'Movies' },
                        { key: 'tv', label: 'TV Shows' }
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                setFilter(f.key);
                            }}
                            style={{
                                ...styles.filterPill,
                                background: filter === f.key ? colors.primary : colors.bg4,
                                boxShadow: filter === f.key ? shadows.glow : 'none'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            ...styles.filterPill,
                            background: showFilters || selectedGenre ? colors.primary : colors.bg4
                        }}
                    >
                        🎛️ Filters
                    </button>
                </div>

                {/* Genre filters */}
                {showFilters && (
                    <div style={styles.genreFilters}>
                        <button
                            onClick={() => { if (navigator.vibrate) navigator.vibrate(5); setSelectedGenre(null); }}
                            style={{
                                ...styles.genrePill,
                                background: !selectedGenre ? colors.text1 : colors.bg5,
                                color: !selectedGenre ? colors.bg1 : colors.text2
                            }}
                        >
                            All Genres
                        </button>
                        {GENRES.map(g => (
                            <button
                                key={g.id}
                                onClick={() => { if (navigator.vibrate) navigator.vibrate(5); setSelectedGenre(g.id); }}
                                style={{
                                    ...styles.genrePill,
                                    background: selectedGenre === g.id ? colors.text1 : colors.bg5,
                                    color: selectedGenre === g.id ? colors.bg1 : colors.text2
                                }}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Content */}
            <div style={styles.content}>
                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                    <section style={styles.recentSection}>
                        <div style={styles.recentHeader}>
                            <h3 style={styles.recentTitle}>Recent Searches</h3>
                            <button onClick={clearRecentSearches} style={styles.clearAllBtn}>
                                Clear All
                            </button>
                        </div>
                        <div style={styles.recentList}>
                            {recentSearches.map((term, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleRecentClick(term)}
                                    style={styles.recentItem}
                                >
                                    <span style={styles.recentIcon}>🕐</span>
                                    <span style={styles.recentText}>{term}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Results */}
                {loading ? (
                    <div style={styles.loadingWrap}>
                        <div style={styles.spinner} />
                    </div>
                ) : displayItems.length > 0 ? (
                    <>
                        <h2 style={styles.resultsTitle}>{showTitle}</h2>
                        <div style={styles.grid}>
                            {displayItems.map(item => (
                                <ContentCard
                                    key={item.id}
                                    id={item.id}
                                    type={item.media_type || filter}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    year={(item.release_date || item.first_air_date)?.split('-')[0]}
                                    size="sm"
                                    animate={true}
                                />
                            ))}
                        </div>
                    </>
                ) : query ? (
                    <div style={styles.empty}>
                        <span style={{ fontSize: 56, marginBottom: 16 }}>🔍</span>
                        <h3 style={styles.emptyTitle}>No results found</h3>
                        <p style={styles.emptyText}>Try different keywords or filters</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: colors.bg1,
        paddingBottom: 120
    },
    header: {
        position: 'sticky',
        top: 0,
        padding: space.lg,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        background: 'rgba(10, 10, 12, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50
    },
    pageTitle: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        margin: 0,
        marginBottom: space.md
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: space.sm,
        padding: `${space.md}px ${space.lg}px`,
        background: colors.bg3,
        borderRadius: radius.lg
    },
    searchInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontFamily: typography.fontFamily,
        outline: 'none'
    },
    clearBtn: {
        background: 'none',
        border: 'none',
        color: colors.text4,
        fontSize: 14,
        cursor: 'pointer',
        padding: space.xs
    },
    voiceBtn: {
        background: 'none',
        border: 'none',
        fontSize: 18,
        cursor: 'pointer',
        padding: space.xs
    },
    filters: {
        display: 'flex',
        gap: space.sm,
        marginTop: space.md,
        overflowX: 'auto',
        scrollbarWidth: 'none'
    },
    filterPill: {
        padding: `${space.sm}px ${space.lg}px`,
        border: 'none',
        borderRadius: radius.full,
        color: colors.text1,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease'
    },
    genreFilters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space.sm,
        marginTop: space.md,
        paddingTop: space.md,
        borderTop: `1px solid ${colors.bg4}`
    },
    genrePill: {
        padding: `${space.sm}px ${space.md}px`,
        border: 'none',
        borderRadius: radius.md,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    content: {
        padding: space.lg
    },
    // Recent searches
    recentSection: {
        marginBottom: space.xl
    },
    recentHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: space.md
    },
    recentTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.text2,
        margin: 0
    },
    clearAllBtn: {
        background: 'none',
        border: 'none',
        color: colors.text4,
        fontSize: typography.sizes.sm,
        cursor: 'pointer'
    },
    recentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: space.xs
    },
    recentItem: {
        display: 'flex',
        alignItems: 'center',
        gap: space.md,
        padding: `${space.md}px 0`,
        background: 'none',
        border: 'none',
        borderBottom: `1px solid ${colors.bg3}`,
        color: colors.text2,
        fontSize: typography.sizes.md,
        textAlign: 'left',
        cursor: 'pointer'
    },
    recentIcon: {
        fontSize: 14,
        opacity: 0.5
    },
    recentText: {
        flex: 1
    },
    // Loading
    loadingWrap: {
        display: 'flex',
        justifyContent: 'center',
        padding: space.xxxl
    },
    spinner: {
        width: 40,
        height: 40,
        border: `3px solid ${colors.bg4}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    // Results
    resultsTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        marginBottom: space.lg
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: space.md
    },
    // Empty
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: space.xxxl,
        textAlign: 'center'
    },
    emptyTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text1,
        marginBottom: space.sm
    },
    emptyText: {
        fontSize: typography.sizes.sm,
        color: colors.text4
    }
};

export default AndroidSearch;
