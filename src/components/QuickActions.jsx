import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

/**
 * QuickActions - Floating Action Button with quick access menu
 * Features:
 * - Random movie/show
 * - Quick search
 * - Scroll to top
 * - Share current page
 */
const QuickActions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Show FAB after scrolling down
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Random content
    const handleRandom = async () => {
        setIsLoading(true);
        setIsOpen(false);
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
            );
            const data = await response.json();
            if (data.results?.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.results.length);
                const item = data.results[randomIndex];
                const type = item.media_type === 'tv' ? 'tv' : 'movie';
                navigate(`/details/${type}/${item.id}`);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Scroll to top
    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsOpen(false);
    };

    // Share
    const handleShare = async () => {
        setIsOpen(false);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Nexflux',
                    text: 'Check out Nexflux - Stream Movies & TV Shows',
                    url: window.location.href
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            // Show toast
            const toast = document.createElement('div');
            toast.className = 'quick-toast';
            toast.textContent = '✓ Link copied!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }
    };

    // Search
    const handleSearch = () => {
        setIsOpen(false);
        navigate('/search');
    };

    if (!isVisible) return null;

    return (
        <div className={`quick-actions ${isOpen ? 'quick-actions--open' : ''}`} ref={menuRef}>
            {/* Menu Items */}
            <div className="quick-actions__menu">
                <button
                    className="quick-actions__item"
                    onClick={handleRandom}
                    disabled={isLoading}
                    title="Random Movie/Show"
                >
                    <span className="quick-actions__icon">🎲</span>
                    <span className="quick-actions__label">Random</span>
                </button>

                <button
                    className="quick-actions__item"
                    onClick={handleSearch}
                    title="Quick Search"
                >
                    <span className="quick-actions__icon">🔍</span>
                    <span className="quick-actions__label">Search</span>
                </button>

                <button
                    className="quick-actions__item"
                    onClick={handleShare}
                    title="Share Page"
                >
                    <span className="quick-actions__icon">📤</span>
                    <span className="quick-actions__label">Share</span>
                </button>

                <button
                    className="quick-actions__item"
                    onClick={handleScrollTop}
                    title="Scroll to Top"
                >
                    <span className="quick-actions__icon">⬆️</span>
                    <span className="quick-actions__label">Top</span>
                </button>
            </div>

            {/* Main FAB Button */}
            <button
                className={`quick-actions__fab ${isLoading ? 'quick-actions__fab--loading' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Quick actions menu"
            >
                <span className="quick-actions__fab-icon">
                    {isLoading ? '⏳' : isOpen ? '✕' : '⚡'}
                </span>
            </button>
        </div>
    );
};

export default QuickActions;
