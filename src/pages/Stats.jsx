import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatchStats, getWatchHistory, formatWatchTime, getTopGenres, getPeakWatchingTime, getMoodAnalysis } from '../utils/analytics';
import { getImageUrl } from '../api/tmdb';
import { Icon } from '../components/Icon';
import './Stats.css';

function Stats() {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [peakTime, setPeakTime] = useState(null);
    const [moodData, setMoodData] = useState(null);

    useEffect(() => {
        setStats(getWatchStats());
        setHistory(getWatchHistory().slice(0, 10));
        setTopGenres(getTopGenres(5));
        setPeakTime(getPeakWatchingTime());
        setMoodData(getMoodAnalysis());
    }, []);

    if (!stats) return null;

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxDayValue = Math.max(...stats.watchByDayOfWeek, 1);

    const getMoodIcon = (mood) => {
        if (mood >= 4) return 'moodGreat';
        if (mood >= 3) return 'moodHappy';
        return 'moodNeutral';
    };

    return (
        <div className="stats page-transition">
            <div className="stats__header container">
                <h1 className="stats__title">Your Stats</h1>
                <p className="stats__subtitle">Your personal viewing journey</p>
            </div>

            <div className="stats__content container">
                {/* Main Stats Grid */}
                <div className="stats__grid">
                    <div className="stats__card stats__card--primary">
                        <div className="stats__card-icon"><Icon name="clock" size={32} /></div>
                        <div className="stats__card-value">{formatWatchTime(stats.totalWatchTime)}</div>
                        <div className="stats__card-label">Total Watch Time</div>
                    </div>

                    <div className="stats__card">
                        <div className="stats__card-icon"><Icon name="movie" size={32} /></div>
                        <div className="stats__card-value">{stats.moviesWatched}</div>
                        <div className="stats__card-label">Movies Watched</div>
                    </div>

                    <div className="stats__card">
                        <div className="stats__card-icon"><Icon name="tv" size={32} /></div>
                        <div className="stats__card-value">{stats.showsWatched}</div>
                        <div className="stats__card-label">TV Shows</div>
                    </div>

                    <div className="stats__card">
                        <div className="stats__card-icon"><Icon name="target" size={32} /></div>
                        <div className="stats__card-value">{stats.episodesWatched}</div>
                        <div className="stats__card-label">Episodes</div>
                    </div>

                    <div className="stats__card stats__card--streak">
                        <div className="stats__card-icon"><Icon name="fire" size={32} /></div>
                        <div className="stats__card-value">{stats.streakDays}</div>
                        <div className="stats__card-label">Day Streak</div>
                    </div>
                </div>

                {/* Top Genres */}
                {topGenres.length > 0 && (
                    <div className="stats__section">
                        <h2 className="stats__section-title">
                            <Icon name="comedy" size={24} /> Your Top Genres
                        </h2>
                        <div className="stats__genres">
                            {topGenres.map((item, index) => (
                                <div key={item.genre} className="stats__genre">
                                    <span className="stats__genre-rank">#{index + 1}</span>
                                    <span className="stats__genre-name">{item.genre}</span>
                                    <div className="stats__genre-bar">
                                        <div
                                            className="stats__genre-fill"
                                            style={{ width: `${(item.count / topGenres[0].count) * 100}%` }}
                                        />
                                    </div>
                                    <span className="stats__genre-count">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Watching Patterns */}
                <div className="stats__section">
                    <h2 className="stats__section-title">
                        <Icon name="chart" size={24} /> Watching Patterns
                    </h2>
                    <div className="stats__patterns">
                        <div className="stats__pattern-chart">
                            <h3>By Day of Week</h3>
                            <div className="stats__bars">
                                {stats.watchByDayOfWeek.map((value, index) => (
                                    <div key={index} className="stats__bar-container">
                                        <div
                                            className={`stats__bar ${index === peakTime?.day ? 'stats__bar--peak' : ''}`}
                                            style={{ height: `${(value / maxDayValue) * 100}%` }}
                                        />
                                        <span className="stats__bar-label">{dayLabels[index]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {peakTime && (
                            <div className="stats__peak-time">
                                <div className="stats__peak-icon"><Icon name="bolt" size={28} /></div>
                                <div className="stats__peak-info">
                                    <span className="stats__peak-label">Peak Watching</span>
                                    <span className="stats__peak-value">
                                        {peakTime.dayLabel}s at {peakTime.hourLabel}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mood Insights */}
                {moodData && moodData.totalEntries > 0 && (
                    <div className="stats__section">
                        <h2 className="stats__section-title">
                            <Icon name="moodHappy" size={24} /> Mood Insights
                        </h2>
                        <div className="stats__mood">
                            <div className="stats__mood-avg">
                                <span className="stats__mood-emoji">
                                    <Icon name={getMoodIcon(moodData.averageMood)} size={40} />
                                </span>
                                <span className="stats__mood-label">Average Mood: {moodData.averageMood.toFixed(1)}/5</span>
                            </div>
                            {moodData.moodBoosters.length > 0 && (
                                <div className="stats__mood-boosters">
                                    <h4>Content that boosted your mood:</h4>
                                    {moodData.moodBoosters.map((item, i) => (
                                        <span key={i} className="stats__mood-booster">
                                            {item.content?.title || 'Unknown'} (+{item.change})
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent History */}
                {history.length > 0 && (
                    <div className="stats__section">
                        <h2 className="stats__section-title">
                            <Icon name="history" size={24} /> Recently Watched
                        </h2>
                        <div className="stats__history">
                            {history.map((item) => (
                                <Link
                                    key={`${item.id}-${item.watchedAt}`}
                                    to={`/details/${item.type}/${item.id}`}
                                    className="stats__history-item"
                                >
                                    {item.poster && (
                                        <img
                                            src={getImageUrl(item.poster, 'w92')}
                                            alt={item.title}
                                            className="stats__history-poster"
                                        />
                                    )}
                                    <div className="stats__history-info">
                                        <span className="stats__history-title">{item.title}</span>
                                        <span className="stats__history-meta">
                                            <Icon name={item.type === 'movie' ? 'movie' : 'tv'} size={14} />
                                            {new Date(item.watchedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {stats.totalWatchTime === 0 && (
                    <div className="stats__empty">
                        <span className="stats__empty-icon"><Icon name="chart" size={64} /></span>
                        <h3>No Stats Yet</h3>
                        <p>Start watching to see your personalized stats!</p>
                        <Link to="/" className="btn btn-primary">Browse Content</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Stats;
