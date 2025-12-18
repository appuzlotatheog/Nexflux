/**
 * Android My List Page
 * User's watchlist and favorites
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AndroidContentCard from '../components/ContentCard';
import { getWatchlist, getFavorites, isAuthenticated } from '../services/api';
import './AndroidMyList.css';

const AndroidMyList = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('watchlist');
    const [watchlist, setWatchlist] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [watchlistRes, favoritesRes] = await Promise.all([
                getWatchlist(),
                getFavorites(),
            ]);

            if (watchlistRes.success) {
                setWatchlist(watchlistRes.watchlist || []);
            }
            if (favoritesRes.success) {
                setFavorites(favoritesRes.favorites || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentItems = activeTab === 'watchlist' ? watchlist : favorites;

    if (isLoading) {
        return (
            <div className="android-mylist android-loading">
                <div className="android-loading__spinner" />
            </div>
        );
    }

    return (
        <div className="android-mylist">
            {/* Header */}
            <header className="android-mylist__header">
                <h1 className="android-mylist__title">My List</h1>

                {/* Tabs */}
                <div className="android-mylist__tabs">
                    <button
                        className={`android-mylist__tab ${activeTab === 'watchlist' ? 'android-mylist__tab--active' : ''}`}
                        onClick={() => setActiveTab('watchlist')}
                    >
                        Watchlist ({watchlist.length})
                    </button>
                    <button
                        className={`android-mylist__tab ${activeTab === 'favorites' ? 'android-mylist__tab--active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        Favorites ({favorites.length})
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="android-mylist__content">
                {currentItems.length > 0 ? (
                    <div className="android-mylist__grid">
                        {currentItems.map((item, index) => (
                            <AndroidContentCard
                                key={item.contentId || index}
                                id={item.contentId}
                                type={item.contentType}
                                title={item.title}
                                posterPath={item.posterPath}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="android-mylist__empty">
                        <span className="android-mylist__empty-icon">
                            {activeTab === 'watchlist' ? '📋' : '❤️'}
                        </span>
                        <h2>No {activeTab === 'watchlist' ? 'watchlist' : 'favorites'} yet</h2>
                        <p>Start adding movies and shows to your {activeTab}!</p>
                        <button
                            className="android-btn android-btn-primary"
                            onClick={() => navigate('/search')}
                        >
                            Browse Content
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AndroidMyList;
