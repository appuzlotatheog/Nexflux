/**
 * Android Content Card v3.0
 * Premium glassmorphic content card
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';
import '../styles/android.css';

const ContentCard = ({
    id,
    type = 'movie',
    title,
    posterPath,
    rating,
    year,
    progress,
    size = 'md'
}) => {
    const navigate = useNavigate();

    const imageUrl = posterPath
        ? `https://image.tmdb.org/t/p/w342${posterPath}`
        : null;

    const handleClick = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(`/${type}/${id}`);
    };

    return (
        <article
            className={`nx-content-card nx-content-card--${size}`}
            onClick={handleClick}
        >
            <div className="nx-content-card__poster">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        className="nx-content-card__img"
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--nx-bg-elevated)',
                        fontSize: '32px'
                    }}>
                        🎬
                    </div>
                )}

                {/* Overlay */}
                <div className="nx-content-card__overlay" />

                {/* Rating */}
                {rating > 0 && (
                    <div className="nx-content-card__rating">
                        <span className="nx-content-card__star">★</span>
                        {rating.toFixed(1)}
                    </div>
                )}

                {/* Play button */}
                <div className="nx-content-card__play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                {/* Progress */}
                {progress > 0 && (
                    <div className="nx-content-card__progress">
                        <div
                            className="nx-content-card__progress-bar"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="nx-content-card__info">
                <h3 className="nx-content-card__title">{title}</h3>
                {year && <span className="nx-content-card__year">{year}</span>}
            </div>
        </article>
    );
};

export default ContentCard;
