// API utility for backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'nexflux_access_token';
const REFRESH_TOKEN_KEY = 'nexflux_refresh_token';

// Get stored tokens
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Store tokens
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Clear tokens
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Base fetch with auth and timeout
const authFetch = async (endpoint, options = {}) => {
    const accessToken = getAccessToken();

    // Add timeout of 5 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const config = {
        ...options,
        signal: controller.signal,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        }
    };

    try {
        let response = await fetch(`${API_URL}${endpoint}`, config);
        clearTimeout(timeoutId);

        // If token expired, try to refresh
        if (response.status === 401 && getRefreshToken()) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry with new token
                config.headers.Authorization = `Bearer ${getAccessToken()}`;
                response = await fetch(`${API_URL}${endpoint}`, config);
            }
        }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        // Return a fake response for network errors
        if (error.name === 'AbortError') {
            console.warn('API request timed out');
        }
        return {
            ok: false,
            status: 0,
            json: async () => ({ success: false, message: 'Network error - backend may be offline' })
        };
    }
};

// Refresh access token
const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;

        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            clearTokens();
            return false;
        }

        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearTokens();
        return false;
    }
};

// ================== AUTH API ==================

export const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (data.success) {
        setTokens(data.accessToken, data.refreshToken);
    }

    return data;
};

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
        setTokens(data.accessToken, data.refreshToken);
    }

    return data;
};

export const logout = async () => {
    try {
        const refreshToken = getRefreshToken();
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearTokens();
    }
};

export const getCurrentUser = async () => {
    const response = await authFetch('/user/profile');
    return response.json();
};

// ================== USER API ==================

export const updateProfile = async (updates) => {
    const response = await authFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    return response.json();
};

// Watchlist
export const getWatchlist = async () => {
    const response = await authFetch('/user/watchlist');
    return response.json();
};

export const addToWatchlist = async (content) => {
    const response = await authFetch('/user/watchlist', {
        method: 'POST',
        body: JSON.stringify({
            contentId: content.id,
            contentType: content.media_type || 'movie',
            title: content.title || content.name,
            posterPath: content.poster_path
        })
    });
    return response.json();
};

export const removeFromWatchlist = async (contentId, contentType) => {
    const response = await authFetch(`/user/watchlist/${contentId}/${contentType}`, {
        method: 'DELETE'
    });
    return response.json();
};

// Continue Watching
export const getContinueWatching = async () => {
    const response = await authFetch('/user/continue-watching');
    return response.json();
};

export const updateWatchProgress = async (content, progress, duration, season, episode) => {
    const response = await authFetch('/user/continue-watching', {
        method: 'POST',
        body: JSON.stringify({
            contentId: content.id,
            contentType: content.media_type || 'movie',
            title: content.title || content.name,
            posterPath: content.poster_path,
            progress,
            duration,
            season,
            episode
        })
    });
    return response.json();
};

export const removeFromContinueWatching = async (contentId, contentType) => {
    const response = await authFetch(`/user/continue-watching/${contentId}/${contentType}`, {
        method: 'DELETE'
    });
    return response.json();
};

// Favorites
export const getFavorites = async () => {
    const response = await authFetch('/user/favorites');
    return response.json();
};

export const addToFavorites = async (content) => {
    const response = await authFetch('/user/favorites', {
        method: 'POST',
        body: JSON.stringify({
            contentId: content.id,
            contentType: content.media_type || 'movie',
            title: content.title || content.name,
            posterPath: content.poster_path
        })
    });
    return response.json();
};

export const removeFromFavorites = async (contentId, contentType) => {
    const response = await authFetch(`/user/favorites/${contentId}/${contentType}`, {
        method: 'DELETE'
    });
    return response.json();
};

// Check if user is logged in
export const isAuthenticated = () => {
    return !!getAccessToken();
};
