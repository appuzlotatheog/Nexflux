const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image size helpers
export const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Fetch helper with authorization
const fetchTMDB = async (endpoint, params = {}) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
};

// ===== MOVIES =====

export const getTrending = async (mediaType = 'all', timeWindow = 'week') => {
    return fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
};

export const getPopularMovies = async (page = 1) => {
    return fetchTMDB('/movie/popular', { page });
};

export const getTopRatedMovies = async (page = 1) => {
    return fetchTMDB('/movie/top_rated', { page });
};

export const getUpcomingMovies = async (page = 1) => {
    return fetchTMDB('/movie/upcoming', { page });
};

export const getNowPlayingMovies = async (page = 1) => {
    return fetchTMDB('/movie/now_playing', { page });
};

export const getMovieDetails = async (movieId) => {
    return fetchTMDB(`/movie/${movieId}`, { append_to_response: 'videos,credits,similar,recommendations' });
};

export const getMoviesByGenre = async (genreId, page = 1) => {
    return fetchTMDB('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' });
};

// ===== TV SHOWS =====

export const getPopularTV = async (page = 1) => {
    return fetchTMDB('/tv/popular', { page });
};

export const getTopRatedTV = async (page = 1) => {
    return fetchTMDB('/tv/top_rated', { page });
};

export const getOnTheAirTV = async (page = 1) => {
    return fetchTMDB('/tv/on_the_air', { page });
};

export const getTVDetails = async (tvId) => {
    return fetchTMDB(`/tv/${tvId}`, { append_to_response: 'videos,credits,similar,recommendations' });
};

export const getTVSeasonDetails = async (tvId, seasonNumber) => {
    return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
};

export const getTVByGenre = async (genreId, page = 1) => {
    return fetchTMDB('/discover/tv', { with_genres: genreId, page, sort_by: 'popularity.desc' });
};

// ===== ANIME (Animation genre from Japan/Korea) =====

// Anime genre ID is 16 (Animation), filter by origin country
export const getPopularAnime = async (page = 1) => {
    return fetchTMDB('/discover/tv', {
        with_genres: 16, // Animation
        with_origin_country: 'JP',
        sort_by: 'popularity.desc',
        page,
    });
};

export const getTopRatedAnime = async (page = 1) => {
    return fetchTMDB('/discover/tv', {
        with_genres: 16,
        with_origin_country: 'JP',
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page,
    });
};

export const getTrendingAnime = async (page = 1) => {
    return fetchTMDB('/discover/tv', {
        with_genres: 16,
        with_origin_country: 'JP',
        sort_by: 'popularity.desc',
        'first_air_date.gte': new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        page,
    });
};

export const getNewAnime = async (page = 1) => {
    return fetchTMDB('/discover/tv', {
        with_genres: 16,
        with_origin_country: 'JP',
        sort_by: 'first_air_date.desc',
        'first_air_date.lte': new Date().toISOString().split('T')[0],
        page,
    });
};

export const searchAnime = async (query, page = 1) => {
    // Search TV and filter for animation genre
    const results = await fetchTMDB('/search/tv', { query, page });
    // Filter results to only include anime (animation genre)
    if (results.results) {
        results.results = results.results.filter(item =>
            item.genre_ids?.includes(16) && item.origin_country?.includes('JP')
        );
    }
    return results;
};

// ===== SEARCH =====

export const searchMulti = async (query, page = 1) => {
    return fetchTMDB('/search/multi', { query, page });
};

export const searchMovies = async (query, page = 1) => {
    return fetchTMDB('/search/movie', { query, page });
};

export const searchTV = async (query, page = 1) => {
    return fetchTMDB('/search/tv', { query, page });
};

// ===== GENRES =====

export const getGenres = async (mediaType = 'movie') => {
    return fetchTMDB(`/genre/${mediaType}/list`);
};

export const getMovieGenres = async () => {
    return fetchTMDB('/genre/movie/list');
};

export const getTVGenres = async () => {
    return fetchTMDB('/genre/tv/list');
};

// ===== RECOMMENDATIONS =====

export const getMovieRecommendations = async (movieId) => {
    return fetchTMDB(`/movie/${movieId}/recommendations`);
};

export const getTVRecommendations = async (tvId) => {
    return fetchTMDB(`/tv/${tvId}/recommendations`);
};

/**
 * Get personalized recommendations based on watch history
 * Fetches recommendations from the most recently watched items
 */
export const getPersonalizedRecommendations = async (watchHistory, limit = 20) => {
    if (!watchHistory || watchHistory.length === 0) {
        return [];
    }

    // Get unique IDs from watch history (most recent first)
    const uniqueItems = [];
    const seenIds = new Set();

    for (const item of watchHistory) {
        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
        }
        if (uniqueItems.length >= 5) break; // Only use top 5 for performance
    }

    try {
        // Fetch recommendations for each watched item
        const recommendationPromises = uniqueItems.map(item => {
            if (item.type === 'tv') {
                return getTVRecommendations(item.id).catch(() => ({ results: [] }));
            }
            return getMovieRecommendations(item.id).catch(() => ({ results: [] }));
        });

        const results = await Promise.all(recommendationPromises);

        // Combine and deduplicate recommendations
        const allRecommendations = [];
        const seenRecommendationIds = new Set(watchHistory.map(h => h.id));

        for (const result of results) {
            if (result.results) {
                for (const item of result.results) {
                    if (!seenRecommendationIds.has(item.id) && item.poster_path) {
                        seenRecommendationIds.add(item.id);
                        // Add media_type if not present
                        item.media_type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                        allRecommendations.push(item);
                    }
                }
            }
        }

        // Sort by popularity and return top items
        return allRecommendations
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        return [];
    }
};

// ===== VIDKING HELPERS =====

export const getVidkingMovieUrl = (tmdbId, options = {}) => {
    const baseUrl = `https://www.vidking.net/embed/movie/${tmdbId}`;
    const params = new URLSearchParams();

    if (options.color) params.append('color', options.color);
    if (options.autoPlay) params.append('autoPlay', 'true');
    if (options.progress) params.append('progress', options.progress);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const getVidkingTVUrl = (tmdbId, season, episode, options = {}) => {
    const baseUrl = `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}`;
    const params = new URLSearchParams();

    if (options.color) params.append('color', options.color);
    if (options.autoPlay) params.append('autoPlay', 'true');
    if (options.nextEpisode) params.append('nextEpisode', 'true');
    if (options.episodeSelector) params.append('episodeSelector', 'true');
    if (options.progress) params.append('progress', options.progress);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
