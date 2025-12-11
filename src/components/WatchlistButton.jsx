import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import './WatchlistButton.css';

/**
 * WatchlistButton - Adds content to watchlist with animation
 * @param {Object} content - Content object with id, title, poster_path, media_type
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showLabel - Show text label (default: false)
 */
const WatchlistButton = ({ content, size = 'md', showLabel = false }) => {
    const { isAuthenticated, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const inWatchlist = content && isInWatchlist(content.id, content.media_type || 'movie');

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please sign in to add to watchlist');
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            if (inWatchlist) {
                await removeFromWatchlist(content.id, content.media_type || 'movie');
                toast.watchlist(`Removed "${content.title}" from My List`);
            } else {
                await addToWatchlist(content);
                toast.watchlist(`Added "${content.title}" to My List`);
            }
        } catch (error) {
            toast.error('Something went wrong');
        }

        setLoading(false);
    };

    return (
        <button
            className={`watchlist-btn watchlist-btn--${size} ${inWatchlist ? 'watchlist-btn--active' : ''} ${loading ? 'watchlist-btn--loading' : ''}`}
            onClick={handleClick}
            disabled={loading}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
            <span className="watchlist-btn__icon">
                {inWatchlist ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                )}
            </span>
            {showLabel && (
                <span className="watchlist-btn__label">
                    {inWatchlist ? 'In List' : 'My List'}
                </span>
            )}
        </button>
    );
};

export default WatchlistButton;

