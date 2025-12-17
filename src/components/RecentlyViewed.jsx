import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentRow from './ContentRow';
import './RecentlyViewed.css';

/**
 * RecentlyViewed - Shows recently viewed content from local storage
 */
const RecentlyViewed = () => {
    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        // Load from localStorage
        const loadRecent = () => {
            try {
                const stored = localStorage.getItem('nexflux_recently_viewed');
                if (stored) {
                    const items = JSON.parse(stored);
                    // Filter out items without essential data
                    const validItems = items.filter(item =>
                        item && item.id && (item.poster_path || item.backdrop_path)
                    );
                    setRecentItems(validItems.slice(0, 20)); // Max 20 items
                }
            } catch (error) {
                console.error('Error loading recently viewed:', error);
            }
        };

        loadRecent();

        // Listen for custom event when new item is viewed
        const handleUpdate = () => loadRecent();
        window.addEventListener('recentlyViewedUpdate', handleUpdate);
        return () => window.removeEventListener('recentlyViewedUpdate', handleUpdate);
    }, []);

    if (recentItems.length === 0) return null;

    return (
        <div className="recently-viewed">
            <ContentRow
                title="Continue Watching"
                items={recentItems}
                icon="🕐"
            />
        </div>
    );
};

/**
 * Helper function to add an item to recently viewed
 * Call this when user visits a details page
 */
export const addToRecentlyViewed = (item) => {
    try {
        const stored = localStorage.getItem('nexflux_recently_viewed');
        let items = stored ? JSON.parse(stored) : [];

        // Remove if already exists (to move to front)
        items = items.filter(i => !(i.id === item.id && i.media_type === item.media_type));

        // Add to front with timestamp
        items.unshift({
            ...item,
            viewedAt: Date.now()
        });

        // Keep only last 50
        items = items.slice(0, 50);

        localStorage.setItem('nexflux_recently_viewed', JSON.stringify(items));

        // Dispatch event for reactivity
        window.dispatchEvent(new CustomEvent('recentlyViewedUpdate'));
    } catch (error) {
        console.error('Error saving to recently viewed:', error);
    }
};

/**
 * Clear recently viewed history
 */
export const clearRecentlyViewed = () => {
    localStorage.removeItem('nexflux_recently_viewed');
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdate'));
};

export default RecentlyViewed;
