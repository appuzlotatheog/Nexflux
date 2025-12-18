/**
 * Android Search Page v4.0
 * Uses a- prefix classes
 */
import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../components/ContentCard';
import '../styles/android.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const AndroidSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`)
            .then(r => r.json())
            .then(d => setTrending(d.results || []))
            .catch(() => { });
    }, []);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            const endpoint = filter === 'all' ? `${TMDB_BASE}/search/multi` : `${TMDB_BASE}/search/${filter}`;
            const res = await fetch(`${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults((data.results || []).filter(i => i.media_type !== 'person' && (i.poster_path || i.backdrop_path)));
        } catch (e) { }
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
        <div style={{ minHeight: '100vh', background: 'var(--a-bg-1)', paddingTop: 'var(--a-safe-t)' }}>
            {/* Header */}
            <header style={{ position: 'sticky', top: 0, padding: 'var(--a-4)', background: 'var(--a-glass)', backdropFilter: 'blur(20px)', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--a-2)', padding: '14px 16px', background: 'var(--a-bg-3)', borderRadius: 'var(--a-r-md)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--a-text-4)" strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search movies, TV shows..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        style={{ flex: 1, background: 'none', border: 'none', color: 'var(--a-text-1)', fontSize: 'var(--a-fs-md)', outline: 'none' }}
                    />
                    {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--a-text-4)', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
                    <button onClick={handleVoice} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🎤</button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--a-2)', marginTop: 'var(--a-2)', overflowX: 'auto' }}>
                    {['all', 'movie', 'tv'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 18px',
                                background: filter === f ? 'var(--a-primary)' : 'var(--a-bg-3)',
                                border: 'none',
                                borderRadius: 'var(--a-r-full)',
                                color: filter === f ? 'white' : 'var(--a-text-3)',
                                fontSize: 'var(--a-fs-sm)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ padding: 'var(--a-4)' }}>
                {loading ? (
                    <div className="a-loading" style={{ minHeight: '50vh' }}><div className="a-spinner" /></div>
                ) : query && results.length > 0 ? (
                    <>
                        <h2 style={{ fontSize: 'var(--a-fs-lg)', fontWeight: 700, marginBottom: 'var(--a-4)' }}>Results</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--a-3)' }}>
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
                    <div className="a-empty">
                        <span className="a-empty__icon">🔍</span>
                        <h3 className="a-empty__title">No results found</h3>
                        <p className="a-empty__text">Try a different search term</p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: 'var(--a-fs-lg)', fontWeight: 700, marginBottom: 'var(--a-4)' }}>Trending</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--a-3)' }}>
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
