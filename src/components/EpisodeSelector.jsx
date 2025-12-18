import { useState, useRef, useEffect } from 'react';
import './EpisodeSelector.css';

function EpisodeSelector({
    seasons,
    currentSeason,
    currentEpisode,
    onSelectSeason,
    onSelectEpisode,
    episodes
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div className="episode-selector">
            <div className="episode-selector__seasons">
                <label className="episode-selector__label">Season</label>
                <div className="episode-selector__select-wrapper" ref={dropdownRef}>
                    <button
                        className="episode-selector__select"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                    >
                        {seasons.find(s => s.season_number === currentSeason)?.name || `Season ${currentSeason}`}
                    </button>

                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="episode-selector__select-icon">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>

                    {isOpen && (
                        <div className="episode-selector__dropdown">
                            {seasons.map((season) => (
                                <button
                                    key={season.season_number}
                                    className={`episode-selector__option ${season.season_number === currentSeason ? 'episode-selector__option--selected' : ''}`}
                                    onClick={() => {
                                        onSelectSeason(season.season_number);
                                        setIsOpen(false);
                                    }}
                                >
                                    {season.name || `Season ${season.season_number}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {episodes && episodes.length > 0 && (
                <div className="episode-selector__episodes">
                    <div className="episode-selector__list">
                        {episodes.map((ep) => (
                            <button
                                key={ep.episode_number}
                                className={`episode-selector__item ${ep.episode_number === currentEpisode ? 'episode-selector__item--active' : ''
                                    }`}
                                onClick={() => onSelectEpisode(ep.episode_number)}
                            >
                                <div className="episode-selector__item-number">
                                    <span>{ep.episode_number}</span>
                                </div>
                                <div className="episode-selector__item-info">
                                    <h5 className="episode-selector__item-title">{ep.name}</h5>
                                    <div className="episode-selector__item-meta">
                                        {ep.runtime && <span>{ep.runtime} min</span>}
                                        {ep.air_date && <span>{new Date(ep.air_date).getFullYear()}</span>}
                                    </div>
                                </div>
                                <div className="episode-selector__item-play">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EpisodeSelector;
