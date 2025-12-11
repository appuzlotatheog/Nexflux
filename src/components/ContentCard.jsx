import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/tmdb';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';
import './ContentCard.css';

function ContentCard({ item, isLarge = false, rank = null, showButtons = true }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    const ratingPercent = item.vote_average ? Math.round(item.vote_average * 10) : 0;

    // Responsive images: Portrait for mobile, Landscape for desktop
    const posterUrl = getImageUrl(item.poster_path, 'w342');  // Portrait
    const backdropUrl = getImageUrl(item.backdrop_path || item.poster_path, 'w500');  // Landscape

    // For isLarge cards, always use poster (portrait)
    const mobileImage = posterUrl;
    const desktopImage = isLarge ? posterUrl : backdropUrl;

    // Content object for buttons
    const contentData = {
        id: item.id,
        title: title,
        poster_path: item.poster_path,
        media_type: mediaType
    };

    // Need at least one image
    if (!item.poster_path && !item.backdrop_path) return null;

    const handleActionClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            className={`content-card ${isLarge ? 'content-card--large' : ''} ${rank ? 'content-card--has-rank' : ''} ${isHovered ? 'content-card--hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {rank && (
                <div className="content-card__rank">
                    <span className="content-card__rank-number">{rank}</span>
                </div>
            )}

            <Link to={`/details/${mediaType}/${item.id}`} className="content-card__link">
                <div className="content-card__image-wrapper">
                    {!imageLoaded && <div className="content-card__skeleton skeleton" />}

                    {/* Responsive Picture Element */}
                    <picture>
                        {/* Desktop: Landscape backdrop (768px+) */}
                        <source media="(min-width: 768px)" srcSet={desktopImage} />
                        {/* Mobile: Portrait poster (default) */}
                        <img
                            src={mobileImage}
                            alt={title}
                            className={`content-card__image ${imageLoaded ? 'content-card__image--loaded' : ''}`}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                        />
                    </picture>

                    {/* Gradient Overlay */}
                    <div className="content-card__gradient" />

                    {/* Hover Overlay with Play Button */}
                    <div className="content-card__overlay">
                        <div className="content-card__play">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Neon Border Effect */}
                    <div className="content-card__neon-border" />

                    {/* Badges - Bottom Left */}
                    <div className="content-card__badges">
                        {rating && (
                            <span className={`content-card__badge content-card__badge--rating ${ratingPercent >= 70 ? 'content-card__badge--good' : ratingPercent >= 50 ? 'content-card__badge--average' : 'content-card__badge--poor'}`}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                {rating}
                            </span>
                        )}
                        {mediaType === 'tv' && (
                            <span className="content-card__badge content-card__badge--type">TV</span>
                        )}
                    </div>

                    {/* Action Buttons - Top Right, Inside Image */}
                    {showButtons && (
                        <div
                            className={`content-card__actions ${isHovered ? 'content-card__actions--visible' : ''}`}
                            onClick={handleActionClick}
                        >
                            <FavoriteButton content={contentData} size="sm" />
                            <WatchlistButton content={contentData} size="sm" />
                        </div>
                    )}
                </div>

                {/* Info Section - Hidden on Mobile via CSS */}
                <div className="content-card__info">
                    <h3 className="content-card__title">{title}</h3>
                    <div className="content-card__meta">
                        {year && <span className="content-card__year">{year}</span>}
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default ContentCard;
