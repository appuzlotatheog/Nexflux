// Watch History Utilities
// Stores watch progress in localStorage

const WATCH_HISTORY_KEY = 'nexflux_watch_history';
const COMPLETED_THRESHOLD = 0.9; // 90% completion = "Watch Again"
const MAX_HISTORY_ITEMS = 20;

/**
 * Get all watch history from localStorage
 */
export const getWatchHistory = () => {
    try {
        const history = localStorage.getItem(WATCH_HISTORY_KEY);
        return history ? JSON.parse(history) : {};
    } catch {
        return {};
    }
};

/**
 * Save watch progress for an item
 * @param {Object} item - Media item with id, type, title, poster, etc.
 * @param {number} progress - Current watch time in seconds
 * @param {number} duration - Total duration in seconds
 * @param {Object} episodeInfo - For TV: { season, episode, episodeName }
 */
export const saveWatchProgress = (item, progress, duration, episodeInfo = null) => {
    const history = getWatchHistory();
    const key = episodeInfo
        ? `tv-${item.id}-s${episodeInfo.season}-e${episodeInfo.episode}`
        : `${item.type || 'movie'}-${item.id}`;

    const percentage = duration > 0 ? progress / duration : 0;

    history[key] = {
        id: item.id,
        type: item.type || (episodeInfo ? 'tv' : 'movie'),
        title: item.title || item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        progress,
        duration,
        percentage,
        episodeInfo,
        lastWatched: Date.now(),
    };

    // Clean up old entries if too many
    const entries = Object.entries(history);
    if (entries.length > MAX_HISTORY_ITEMS) {
        entries.sort((a, b) => b[1].lastWatched - a[1].lastWatched);
        const newHistory = Object.fromEntries(entries.slice(0, MAX_HISTORY_ITEMS));
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(newHistory));
    } else {
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
    }
};

/**
 * Get watch progress for a specific item
 */
export const getWatchProgress = (type, id, season = null, episode = null) => {
    const history = getWatchHistory();
    const key = season !== null
        ? `tv-${id}-s${season}-e${episode}`
        : `${type}-${id}`;
    return history[key] || null;
};

/**
 * Get items to continue watching (< 90% complete, > 5% watched)
 */
export const getContinueWatching = () => {
    const history = getWatchHistory();
    return Object.values(history)
        .filter(item => item.percentage > 0.05 && item.percentage < COMPLETED_THRESHOLD)
        .sort((a, b) => b.lastWatched - a.lastWatched)
        .slice(0, 10);
};

/**
 * Get items to watch again (>= 90% complete)
 */
export const getWatchAgain = () => {
    const history = getWatchHistory();
    return Object.values(history)
        .filter(item => item.percentage >= COMPLETED_THRESHOLD)
        .sort((a, b) => b.lastWatched - a.lastWatched)
        .slice(0, 10);
};

/**
 * Get next episode for a TV show
 */
export const getNextEpisodeInfo = (tvId, currentSeason, currentEpisode, seasons) => {
    if (!seasons || seasons.length === 0) return null;

    // Find current season
    const seasonData = seasons.find(s => s.season_number === currentSeason);
    if (!seasonData) return null;

    // Check if there's a next episode in current season
    if (currentEpisode < seasonData.episode_count) {
        return {
            season: currentSeason,
            episode: currentEpisode + 1,
        };
    }

    // Check for next season
    const nextSeason = seasons.find(s => s.season_number === currentSeason + 1);
    if (nextSeason && nextSeason.episode_count > 0) {
        return {
            season: currentSeason + 1,
            episode: 1,
        };
    }

    return null; // No more episodes
};

/**
 * Mark item as completed
 */
export const markAsCompleted = (type, id, episodeInfo = null) => {
    const history = getWatchHistory();
    const key = episodeInfo
        ? `tv-${id}-s${episodeInfo.season}-e${episodeInfo.episode}`
        : `${type}-${id}`;

    if (history[key]) {
        history[key].percentage = 1;
        history[key].lastWatched = Date.now();
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
    }
};

/**
 * Clear watch history
 */
export const clearWatchHistory = () => {
    localStorage.removeItem(WATCH_HISTORY_KEY);
};
