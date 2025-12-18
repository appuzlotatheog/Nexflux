/**
 * Android Content Card v4.0
 * Uses a- prefix classes
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/android.css';

const ContentCard = ({ id, type = 'movie', title, posterPath, rating, year, progress, size = 'md' }) => {
    const navigate = useNavigate();
    const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : null;

    const handleClick = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(`/${type}/${id}`);
    };

    return (
        <article className={`a-card a-card--${size}`} onClick={handleClick}>
            <div className="a-card__poster">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} loading="lazy" className="a-card__img" />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--a-bg-4)', fontSize: '32px' }}>🎬</div>
                )}

                {rating > 0 && (
                    <div className="a-card__rating">
                        <span className="a-card__star">★</span>
                        {rating.toFixed(1)}
                    </div>
                )}

                <div className="a-card__play">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>

                {progress > 0 && (
                    <div className="a-card__progress">
                        <div className="a-card__progress-bar" style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                )}
            </div>

            <div className="a-card__info">
                <h3 className="a-card__title">{title}</h3>
                {year && <span className="a-card__year">{year}</span>}
            </div>
        </article>
    );
};

export default ContentCard;
