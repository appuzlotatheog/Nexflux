/**
 * Android API Service
 * Handles all API calls to the Nexflux backend for Android app
 */

const API_BASE_URL = 'https://nexflux-backend-production.up.railway.app/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'nexflux_access_token';
const REFRESH_TOKEN_KEY = 'nexflux_refresh_token';
const USER_KEY = 'nexflux_user';

/**
 * Get stored access token
 */
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * Get stored user
 */
export const getStoredUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

/**
 * Store auth tokens and user
 */
export const storeAuth = (accessToken, refreshToken, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear auth data
 */
export const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => !!getAccessToken();

/**
 * API request helper with auth handling
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAccessToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        // Handle 401 - try refresh token
        if (response.status === 401 && getRefreshToken()) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry request with new token
                headers['Authorization'] = `Bearer ${getAccessToken()}`;
                const retryResponse = await fetch(url, { ...options, headers });
                return retryResponse.json();
            } else {
                clearAuth();
                throw new Error('Session expired');
            }
        }

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (data.success) {
            localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

// ============ AUTH API ============

/**
 * Register new user
 */
export const register = async (username, email, password) => {
    const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });

    if (data.success) {
        storeAuth(data.accessToken, data.refreshToken, data.user);
    }
    return data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data.success) {
        storeAuth(data.accessToken, data.refreshToken, data.user);
    }
    return data;
};

/**
 * Logout user
 */
export const logout = async () => {
    try {
        await apiRequest('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: getRefreshToken() }),
        });
    } finally {
        clearAuth();
    }
};

// ============ USER API ============

/**
 * Get user profile
 */
export const getProfile = () => apiRequest('/user/profile');

/**
 * Update user profile
 */
export const updateProfile = (data) =>
    apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });

// ============ WATCHLIST API ============

/**
 * Get watchlist
 */
export const getWatchlist = () => apiRequest('/user/watchlist');

/**
 * Add to watchlist
 */
export const addToWatchlist = (contentId, contentType, title, posterPath) =>
    apiRequest('/user/watchlist', {
        method: 'POST',
        body: JSON.stringify({ contentId, contentType, title, posterPath }),
    });

/**
 * Remove from watchlist
 */
export const removeFromWatchlist = (contentId, contentType) =>
    apiRequest(`/user/watchlist/${contentId}/${contentType}`, {
        method: 'DELETE',
    });

// ============ CONTINUE WATCHING API ============

/**
 * Get continue watching list
 */
export const getContinueWatching = () => apiRequest('/user/continue-watching');

/**
 * Update watch progress
 */
export const saveWatchProgress = (contentId, contentType, title, posterPath, progress, duration, season, episode) =>
    apiRequest('/user/continue-watching', {
        method: 'POST',
        body: JSON.stringify({ contentId, contentType, title, posterPath, progress, duration, season, episode }),
    });

/**
 * Remove from continue watching
 */
export const removeFromContinueWatching = (contentId, contentType) =>
    apiRequest(`/user/continue-watching/${contentId}/${contentType}`, {
        method: 'DELETE',
    });

// ============ FAVORITES API ============

/**
 * Get favorites
 */
export const getFavorites = () => apiRequest('/user/favorites');

/**
 * Add to favorites
 */
export const addToFavorites = (contentId, contentType, title, posterPath) =>
    apiRequest('/user/favorites', {
        method: 'POST',
        body: JSON.stringify({ contentId, contentType, title, posterPath }),
    });

/**
 * Remove from favorites
 */
export const removeFromFavorites = (contentId, contentType) =>
    apiRequest(`/user/favorites/${contentId}/${contentType}`, {
        method: 'DELETE',
    });

export default {
    // Auth
    register,
    login,
    logout,
    isAuthenticated,
    getStoredUser,
    clearAuth,
    // User
    getProfile,
    updateProfile,
    // Watchlist
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    // Continue Watching
    getContinueWatching,
    saveWatchProgress,
    removeFromContinueWatching,
    // Favorites
    getFavorites,
    addToFavorites,
    removeFromFavorites,
};
