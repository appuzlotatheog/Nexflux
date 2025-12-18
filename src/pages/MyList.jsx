import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/tmdb';
import './MyList.css';

// Get watchlist from localStorage
const getWatchlist = () => {
    try {
        return JSON.parse(localStorage.getItem('nexflux-watchlist') || '[]');
    } catch {
        return [];
    }
};

// Save watchlist to localStorage
const saveWatchlist = (list) => {
    localStorage.setItem('nexflux-watchlist', JSON.stringify(list));
};

function MyList() {
    const [watchlist, setWatchlist] = useState([]);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        setWatchlist(getWatchlist());

        // Listen for storage changes from other tabs
        const handleStorage = (e) => {
            if (e.key === 'nexflux-watchlist') {
                setWatchlist(getWatchlist());
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const removeItem = (id, type) => {
        const updated = watchlist.filter(item => !(item.id === id && item.type === type));
        saveWatchlist(updated);
        setWatchlist(updated);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    return (
        <div className="my-list container">
            {/* Toast */}
            <div className={`my-list__toast ${showToast ? 'my-list__toast--visible' : ''}`}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Removed from Watchlist
            </div>

            {/* Header */}
            <div className="my-list__header">
                <h1 className="my-list__title">My Watchlist</h1>
                <p className="my-list__count">{watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'}</p>
            </div>

            {/* Empty State */}
            {watchlist.length === 0 ? (
                <div className="my-list__empty">
                    <div className="my-list__empty-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                        </svg>
                    </div>
                    <h2>Your watchlist is empty</h2>
                    <p>Save movies and TV shows to watch later by clicking the bookmark icon on any title.</p>
                    <Link to="/" className="btn btn-primary">
                        Browse Content
                    </Link>
                </div>
            ) : (
                /* Grid */
                <div className="my-list__grid">
                    {watchlist.map((item, index) => {
                        const rating = item.rating ? Math.round(item.rating * 10) : null;

                        return (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="my-list__item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <Link to={`/details/${item.type}/${item.id}`} className="my-list__item-link">
                                    <div className="my-list__item-poster">
                                        {item.poster ? (
                                            <img src={getImageUrl(item.poster, 'w342')} alt={item.title} loading="lazy" />
                                        ) : (
                                            <div className="my-list__item-no-image">
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                                                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="my-list__item-overlay">
                                            <div className="my-list__item-play">
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="my-list__item-type">
                                            {item.type === 'movie' ? '🎬' : '📺'}
                                        </span>
                                        {rating && (
                                            <span className={`my-list__item-rating ${rating >= 70 ? 'my-list__item-rating--good' : ''}`}>
                                                {rating}%
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <div className="my-list__item-info">
                                    <div className="my-list__item-text">
                                        <h3 className="my-list__item-title">{item.title}</h3>
                                        {item.year && <span className="my-list__item-year">{item.year}</span>}
                                    </div>
                                    <button
                                        className="my-list__remove-btn"
                                        onClick={() => removeItem(item.id, item.type)}
                                        aria-label="Remove from watchlist"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyList;
