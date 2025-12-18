/**
 * Android Search Page v3.0
 * Search with voice support and filters
 */
import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../components/ContentCard';
import '../styles/theme.css';
import '../styles/android.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'movie', label: 'Movies' },
        { id: 'tv', label: 'TV Shows' },
    ];

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        try {
            const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            setTrending(data.results || []);
        } catch (err) { }
    };

    const search = useCallback(async (q) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const endpoint = filter === 'all'
                ? `${TMDB_BASE}/search/multi`
                : `${TMDB_BASE}/search/${filter}`;
            const res = await fetch(`${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults((data.results || []).filter(i => i.media_type !== 'person' && (i.poster_path || i.backdrop_path)));
        } catch (err) { }
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        const t = setTimeout(() => search(query), 400);
        return () => clearTimeout(t);
    }, [query, search]);

    const handleVoice = () => {
        if ('webkitSpeechRecognition' in window) {
            const rec = new window.webkitSpeechRecognition();
            rec.lang = 'en-US';
            rec.onresult = (e) => setQuery(e.results[0][0].transcript);
            rec.start();
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--nx-bg-primary)', paddingTop: 'var(--nx-safe-top)' }}>
            {/* Header */}
            <header style={{ position: 'sticky', top: 0, padding: 'var(--nx-md)', background: 'var(--nx-glass-bg)', backdropFilter: 'blur(20px)', zIndex: 100 }}>
                {/* Search Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nx-sm)', padding: '12px 16px', background: 'var(--nx-bg-elevated)', borderRadius: 'var(--nx-radius-md)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted)" strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search movies, TV shows..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        style={{ flex: 1, background: 'none', border: 'none', color: 'var(--nx-text-primary)', fontSize: 'var(--nx-font-md)', outline: 'none' }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--nx-text-muted)', cursor: 'pointer' }}>✕</button>
                    )}
                    <button onClick={handleVoice} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>🎤</button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 'var(--nx-sm)', marginTop: 'var(--nx-sm)', overflowX: 'auto' }}>
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            style={{
                                padding: '8px 16px',
                                background: filter === f.id ? 'var(--nx-primary)' : 'var(--nx-bg-elevated)',
                                border: 'none',
                                borderRadius: 'var(--nx-radius-full)',
                                color: filter === f.id ? 'white' : 'var(--nx-text-secondary)',
                                fontSize: 'var(--nx-font-sm)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <div style={{ padding: 'var(--nx-md)' }}>
                {loading ? (
                    <div className="nx-loading" style={{ minHeight: '50vh' }}>
                        <div className="nx-spinner" />
                    </div>
                ) : query && results.length > 0 ? (
                    <>
                        <h2 style={{ fontSize: 'var(--nx-font-lg)', fontWeight: 700, marginBottom: 'var(--nx-md)' }}>Results</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--nx-md)' }}>
                            {results.map(item => (
                                <ContentCard
                                    key={item.id}
                                    id={item.id}
                                    type={item.media_type || filter}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    year={(item.release_date || item.first_air_date)?.split('-')[0]}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </>
                ) : query ? (
                    <div className="nx-empty">
                        <span className="nx-empty-icon">🔍</span>
                        <h3 className="nx-empty-title">No results found</h3>
                        <p className="nx-empty-text">Try a different search term</p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: 'var(--nx-font-lg)', fontWeight: 700, marginBottom: 'var(--nx-md)' }}>Trending</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--nx-md)' }}>
                            {trending.slice(0, 12).map(item => (
                                <ContentCard
                                    key={item.id}
                                    id={item.id}
                                    type={item.media_type}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AndroidSearch;
