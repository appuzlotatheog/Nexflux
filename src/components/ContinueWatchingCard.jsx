import { Link } from 'react-router-dom';
import { getImageUrl, getBackdropUrl } from '../api/tmdb';
import './ContinueWatchingCard.css';

function ContinueWatchingCard({ item, type = 'continue' }) {
    const isTV = item.type === 'tv';
    const watchUrl = isTV && item.episodeInfo
        ? `/watch/tv/${item.id}/${item.episodeInfo.season}/${item.episodeInfo.episode}`
        : `/watch/${item.type}/${item.id}`;

    const progressPercent = Math.round((item.percentage || 0) * 100);

    return (
        <Link to={watchUrl} className={`cw-card cw-card--${type}`}>
            <div className="cw-card__image">
                <img
                    src={getBackdropUrl(item.backdrop_path) || getImageUrl(item.poster_path)}
                    alt={item.title}
                    loading="lazy"
                />
                <div className="cw-card__overlay">
                    <div className="cw-card__play">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Progress bar for continue watching */}
                {type === 'continue' && (
                    <div className="cw-card__progress">
                        <div
                            className="cw-card__progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                )}

                {/* Badge for watch again */}
                {type === 'again' && (
                    <div className="cw-card__badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="cw-card__info">
                <h4 className="cw-card__title">{item.title}</h4>
                {isTV && item.episodeInfo && (
                    <span className="cw-card__episode">
                        S{item.episodeInfo.season} E{item.episodeInfo.episode}
                    </span>
                )}
                {type === 'continue' && (
                    <span className="cw-card__time">
                        {formatTime(item.duration - item.progress)} left
                    </span>
                )}
            </div>
        </Link>
    );
}

function formatTime(seconds) {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
}

export default ContinueWatchingCard;
