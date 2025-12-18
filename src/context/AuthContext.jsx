import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            // Only try to get user if we have a token
            if (authApi.isAuthenticated()) {
                try {
                    // Add timeout to prevent hanging if backend is down
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);

                    const response = await authApi.getCurrentUser();
                    clearTimeout(timeoutId);

                    if (response.success) {
                        setUser(response.user);
                    } else {
                        authApi.clearTokens();
                    }
                } catch (err) {
                    console.error('Auth init error:', err);
                    // Don't clear tokens on network error - might be temporary
                    if (err.name !== 'AbortError') {
                        authApi.clearTokens();
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const register = async (username, email, password) => {
        setError(null);
        try {
            const response = await authApi.register(username, email, password);
            if (response.success) {
                setUser(response.user);
                return { success: true };
            } else {
                setError(response.message || response.errors?.[0]);
                return { success: false, error: response.message || response.errors?.[0] };
            }
        } catch (err) {
            const errorMsg = 'Registration failed. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await authApi.login(email, password);
            if (response.success) {
                setUser(response.user);
                return { success: true };
            } else {
                setError(response.message);
                return { success: false, error: response.message };
            }
        } catch (err) {
            const errorMsg = 'Login failed. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        setError(null);
    };

    const updateProfile = async (updates) => {
        try {
            const response = await authApi.updateProfile(updates);
            if (response.success) {
                setUser(response.user);
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: 'Failed to update profile' };
        }
    };

    // Watchlist helpers
    const isInWatchlist = (contentId, contentType) => {
        return user?.watchlist?.some(
            item => item.contentId === contentId && item.contentType === contentType
        );
    };

    const addToWatchlist = async (content) => {
        if (!user) return { success: false, error: 'Please login first' };
        const response = await authApi.addToWatchlist(content);
        if (response.success) {
            setUser(prev => ({ ...prev, watchlist: response.watchlist }));
        }
        return response;
    };

    const removeFromWatchlist = async (contentId, contentType) => {
        if (!user) return { success: false, error: 'Please login first' };
        const response = await authApi.removeFromWatchlist(contentId, contentType);
        if (response.success) {
            setUser(prev => ({ ...prev, watchlist: response.watchlist }));
        }
        return response;
    };

    // Favorites helpers
    const isInFavorites = (contentId, contentType) => {
        return user?.favorites?.some(
            item => item.contentId === contentId && item.contentType === contentType
        );
    };

    const addToFavorites = async (content) => {
        if (!user) return { success: false, error: 'Please login first' };
        const response = await authApi.addToFavorites(content);
        if (response.success) {
            setUser(prev => ({ ...prev, favorites: response.favorites }));
        }
        return response;
    };

    const removeFromFavorites = async (contentId, contentType) => {
        if (!user) return { success: false, error: 'Please login first' };
        const response = await authApi.removeFromFavorites(contentId, contentType);
        if (response.success) {
            setUser(prev => ({ ...prev, favorites: response.favorites }));
        }
        return response;
    };

    // Continue Watching helper
    const updateWatchProgress = async (content, progress, duration, season, episode) => {
        if (!user) return;
        await authApi.updateWatchProgress(content, progress, duration, season, episode);
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        // Watchlist
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        // Favorites
        isInFavorites,
        addToFavorites,
        removeFromFavorites,
        // Continue Watching
        updateWatchProgress,
        getContinueWatching: authApi.getContinueWatching,
        getWatchlist: authApi.getWatchlist,
        getFavorites: authApi.getFavorites
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
