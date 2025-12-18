/**
 * Watch Analytics Utility
 * Tracks viewing patterns, stats, and mood data using localStorage
 */

const STORAGE_KEYS = {
    WATCH_HISTORY: 'nexflux_watch_history',
    WATCH_STATS: 'nexflux_watch_stats',
    MOOD_LOG: 'nexflux_mood_log',
    REACTIONS: 'nexflux_reactions'
};

// ===== WATCH HISTORY =====

export const getWatchHistory = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const addToWatchHistory = (item) => {
    const history = getWatchHistory();

    // Remove existing entry if same content
    const filtered = history.filter(h => !(h.id === item.id && h.type === item.type));

    // Add new entry at the beginning
    const newEntry = {
        ...item,
        watchedAt: Date.now(),
        watchTime: item.watchTime || 0 // in minutes
    };

    filtered.unshift(newEntry);

    // Keep only last 100 entries
    const trimmed = filtered.slice(0, 100);

    localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(trimmed));

    // Update stats
    updateWatchStats(newEntry);

    return trimmed;
};

// ===== WATCH STATS =====

const getDefaultStats = () => ({
    totalWatchTime: 0, // minutes
    moviesWatched: 0,
    showsWatched: 0,
    episodesWatched: 0,
    genreCount: {},
    watchByDayOfWeek: [0, 0, 0, 0, 0, 0, 0], // Sun-Sat
    watchByHour: new Array(24).fill(0),
    streakDays: 0,
    lastWatchDate: null,
    longestMovie: null,
    mostWatchedGenre: null,
    favoriteDecade: null
});

export const getWatchStats = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.WATCH_STATS);
        return saved ? JSON.parse(saved) : getDefaultStats();
    } catch {
        return getDefaultStats();
    }
};

export const updateWatchStats = (entry) => {
    const stats = getWatchStats();
    const now = new Date();

    // Update totals
    stats.totalWatchTime += entry.watchTime || 0;

    if (entry.type === 'movie') {
        stats.moviesWatched++;
    } else if (entry.type === 'tv') {
        stats.episodesWatched++;
        // Count unique shows
        const history = getWatchHistory();
        const uniqueShows = new Set(history.filter(h => h.type === 'tv').map(h => h.id));
        stats.showsWatched = uniqueShows.size;
    }

    // Track genres
    if (entry.genres) {
        entry.genres.forEach(genre => {
            stats.genreCount[genre] = (stats.genreCount[genre] || 0) + 1;
        });

        // Update most watched genre
        const topGenre = Object.entries(stats.genreCount)
            .sort((a, b) => b[1] - a[1])[0];
        if (topGenre) {
            stats.mostWatchedGenre = topGenre[0];
        }
    }

    // Track watching patterns
    stats.watchByDayOfWeek[now.getDay()]++;
    stats.watchByHour[now.getHours()]++;

    // Track streak
    const lastWatch = stats.lastWatchDate ? new Date(stats.lastWatchDate) : null;
    const isConsecutiveDay = lastWatch &&
        (now.getTime() - lastWatch.getTime()) < 48 * 60 * 60 * 1000 &&
        now.getDate() !== lastWatch.getDate();

    if (isConsecutiveDay) {
        stats.streakDays++;
    } else if (!lastWatch || (now.getTime() - lastWatch.getTime()) > 48 * 60 * 60 * 1000) {
        stats.streakDays = 1;
    }

    stats.lastWatchDate = now.toISOString();

    localStorage.setItem(STORAGE_KEYS.WATCH_STATS, JSON.stringify(stats));

    return stats;
};

// ===== MOOD TRACKING =====

export const getMoodLog = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.MOOD_LOG);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const logMood = (mood, contentId = null, isBefore = true) => {
    const log = getMoodLog();

    log.push({
        mood, // 1-5 scale or emoji
        contentId,
        isBefore,
        timestamp: Date.now()
    });

    // Keep last 200 entries
    const trimmed = log.slice(-200);

    localStorage.setItem(STORAGE_KEYS.MOOD_LOG, JSON.stringify(trimmed));

    return trimmed;
};

export const getMoodAnalysis = () => {
    const log = getMoodLog();
    const history = getWatchHistory();

    // Calculate mood improvements after watching
    const moodChanges = [];

    for (let i = 0; i < log.length - 1; i++) {
        const before = log[i];
        const after = log[i + 1];

        if (before.contentId === after.contentId &&
            before.isBefore && !after.isBefore) {
            moodChanges.push({
                contentId: before.contentId,
                change: after.mood - before.mood,
                content: history.find(h => h.id === before.contentId)
            });
        }
    }

    // Find content that improves mood most
    const moodBoosters = moodChanges
        .filter(m => m.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 5);

    return {
        totalEntries: log.length,
        averageMood: log.length > 0
            ? log.reduce((sum, l) => sum + l.mood, 0) / log.length
            : 3,
        moodBoosters,
        recentMoods: log.slice(-10)
    };
};

// ===== LIVE REACTIONS =====

export const getReactions = (contentId) => {
    try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.REACTIONS) || '{}');
        return all[contentId] || [];
    } catch {
        return [];
    }
};

export const addReaction = (contentId, reaction, timestamp) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.REACTIONS) || '{}');

    if (!all[contentId]) {
        all[contentId] = [];
    }

    all[contentId].push({
        emoji: reaction,
        time: timestamp,
        addedAt: Date.now()
    });

    // Keep last 50 reactions per content
    all[contentId] = all[contentId].slice(-50);

    localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(all));

    return all[contentId];
};

// ===== HELPER FUNCTIONS =====

export const formatWatchTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
};

export const getTopGenres = (limit = 5) => {
    const stats = getWatchStats();
    return Object.entries(stats.genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([genre, count]) => ({ genre, count }));
};

export const getPeakWatchingTime = () => {
    const stats = getWatchStats();
    const peakHour = stats.watchByHour.indexOf(Math.max(...stats.watchByHour));
    const peakDay = stats.watchByDayOfWeek.indexOf(Math.max(...stats.watchByDayOfWeek));

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeLabel = peakHour < 12 ? `${peakHour || 12} AM` : `${peakHour - 12 || 12} PM`;

    return {
        hour: peakHour,
        hourLabel: timeLabel,
        day: peakDay,
        dayLabel: days[peakDay]
    };
};

export default {
    getWatchHistory,
    addToWatchHistory,
    getWatchStats,
    getMoodLog,
    logMood,
    getMoodAnalysis,
    getReactions,
    addReaction,
    formatWatchTime,
    getTopGenres,
    getPeakWatchingTime
};
