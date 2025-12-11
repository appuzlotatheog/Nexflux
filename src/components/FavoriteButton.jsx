import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import './FavoriteButton.css';

/**
 * FavoriteButton - Adds content to favorites with heart animation
 * @param {Object} content - Content object with id, title, poster_path, media_type
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 */
const FavoriteButton = ({ content, size = 'md' }) => {
    const { isAuthenticated, isInFavorites, addToFavorites, removeFromFavorites } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [animating, setAnimating] = useState(false);

    const isFavorite = content && isInFavorites(content.id, content.media_type || 'movie');

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please sign in to add favorites');
            navigate('/login');
            return;
        }

        setAnimating(true);

        try {
            if (isFavorite) {
                await removeFromFavorites(content.id, content.media_type || 'movie');
                toast.favorite(`Removed "${content.title}" from favorites`);
            } else {
                await addToFavorites(content);
                toast.favorite(`Added "${content.title}" to favorites`);
            }
        } catch (error) {
            toast.error('Something went wrong');
        }

        setTimeout(() => setAnimating(false), 300);
    };

    return (
        <button
            className={`favorite-btn favorite-btn--${size} ${isFavorite ? 'favorite-btn--active' : ''} ${animating ? 'favorite-btn--animating' : ''}`}
            onClick={handleClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                viewBox="0 0 24 24"
                className="favorite-btn__icon"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {animating && <span className="favorite-btn__burst"></span>}
        </button>
    );
};

export default FavoriteButton;

