/**
 * Android Premium Content Card
 * Glassmorphic card with animations for content display
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ContentCard.css';

const AndroidContentCard = ({
    id,
    type = 'movie',
    title,
    posterPath,
    rating,
    year,
    progress,
    size = 'normal' // 'small', 'normal', 'large'
}) => {
    const navigate = useNavigate();

    const imageUrl = posterPath
        ? `https://image.tmdb.org/t/p/w342${posterPath}`
        : '/placeholder-poster.jpg';

    const handleClick = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(`/${type}/${id}`);
    };

    return (
        <article
            className={`android-content-card android-content-card--${size}`}
            onClick={handleClick}
        >
            <div className="android-content-card__image-wrapper">
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    className="android-content-card__image"
                />

                {/* Rating Badge */}
                {rating > 0 && (
                    <div className="android-content-card__rating">
                        <span className="android-content-card__star">★</span>
                        <span>{rating.toFixed(1)}</span>
                    </div>
                )}

                {/* Play Indicator */}
                <div className="android-content-card__play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                    <div className="android-content-card__progress">
                        <div
                            className="android-content-card__progress-bar"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="android-content-card__gradient" />
            </div>

            {/* Title */}
            <div className="android-content-card__info">
                <h3 className="android-content-card__title">{title}</h3>
                {year && (
                    <span className="android-content-card__year">{year}</span>
                )}
            </div>
        </article>
    );
};

export default AndroidContentCard;
