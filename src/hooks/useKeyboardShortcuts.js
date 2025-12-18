import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * useKeyboardShortcuts - Global keyboard navigation for Nexflux
 * 
 * Shortcuts:
 * - Escape: Go back / Close modals
 * - / or Ctrl+K: Focus search
 * - H: Go home
 * - B: Go to browse
 * - M: Go to my list
 * - P: Go to profile
 * - R: Random movie/show
 * - Space: Play/Pause (on watch page)
 * - Arrow Left/Right: Seek (on watch page)
 * - F: Fullscreen toggle (on watch page)
 */
export const useKeyboardShortcuts = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleKeyDown = useCallback((e) => {
        // Don't trigger if user is typing in an input
        const target = e.target;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // Only allow Escape to work in inputs
            if (e.key !== 'Escape') return;
        }

        // Prevent shortcuts when modals are open
        const modalOpen = document.querySelector('[role="dialog"]');
        if (modalOpen && e.key !== 'Escape') return;

        switch (e.key) {
            case 'Escape':
                // Close any open modals or go back
                const chatbotOpen = document.querySelector('.chatbot--open');
                if (chatbotOpen) {
                    const closeBtn = chatbotOpen.querySelector('.chatbot__close');
                    if (closeBtn) closeBtn.click();
                } else if (window.history.length > 1) {
                    navigate(-1);
                }
                break;

            case '/':
                // Focus search
                e.preventDefault();
                const searchInput = document.querySelector('.navbar__search-input') ||
                    document.querySelector('.smart-search__input') ||
                    document.querySelector('[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                } else {
                    navigate('/search');
                }
                break;

            case 'k':
            case 'K':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    navigate('/search');
                }
                break;

            case 'h':
            case 'H':
                if (!e.ctrlKey && !e.metaKey) {
                    navigate('/');
                }
                break;

            case 'b':
            case 'B':
                if (!e.ctrlKey && !e.metaKey) {
                    navigate('/browse');
                }
                break;

            case 'm':
            case 'M':
                if (!e.ctrlKey && !e.metaKey) {
                    navigate('/my-list');
                }
                break;

            case 'p':
            case 'P':
                if (!e.ctrlKey && !e.metaKey) {
                    navigate('/profile');
                }
                break;

            case 'r':
            case 'R':
                if (!e.ctrlKey && !e.metaKey) {
                    // Random content - navigate to a random trending item
                    triggerRandomContent();
                }
                break;

            case '?':
                // Show keyboard shortcuts help
                showShortcutsHelp();
                break;

            default:
                break;
        }
    }, [navigate, location]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Trigger random content navigation
const triggerRandomContent = async () => {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/trending/all/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const item = data.results[randomIndex];
            const type = item.media_type === 'tv' ? 'tv' : 'movie';
            window.location.href = `/details/${type}/${item.id}`;
        }
    } catch (error) {
        console.error('Error fetching random content:', error);
    }
};

// Show shortcuts help modal
const showShortcutsHelp = () => {
    // Check if modal already exists
    if (document.getElementById('shortcuts-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        ">
            <div style="
                background: #1a1a1a;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                color: white;
            ">
                <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 700;">⌨️ Keyboard Shortcuts</h2>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Search</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">/</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Home</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">H</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Browse</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">B</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">My List</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">M</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Profile</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">P</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Random Content</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">R</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Go Back</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Esc</kbd>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="opacity: 0.7;">Show Shortcuts</span>
                        <kbd style="background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace;">?</kbd>
                    </div>
                </div>
                <button id="close-shortcuts" style="
                    margin-top: 20px;
                    width: 100%;
                    padding: 12px;
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeModal = () => modal.remove();
    modal.querySelector('#close-shortcuts').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal.firstElementChild) closeModal();
    });
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
};

export default useKeyboardShortcuts;
