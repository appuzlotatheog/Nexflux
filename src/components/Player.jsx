import { useEffect, useRef, useState } from 'react';
import './Player.css';

// Player sources URLs (UI is in Watch.jsx)
const PLAYER_SOURCES = {
    xenon: {
        getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`,
        getTvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}?autoPlay=true`,
        getAnimeUrl: (id, e) => `https://vidsrc.cc/v2/embed/tv/${id}/1/${e}?autoPlay=true`,
    },
    helium: {
        getMovieUrl: (id) => `https://vidfast.pro/movie/${id}?autoPlay=true&theme=E50914`,
        getTvUrl: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true&theme=E50914`,
        getAnimeUrl: (id, e) => `https://vidfast.pro/tv/${id}/1/${e}?autoPlay=true&theme=E50914`,
    },
    neon: {
        getMovieUrl: (id) => `https://www.vidking.net/embed/movie/${id}?color=E50914&autoPlay=true`,
        getTvUrl: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=E50914&autoPlay=true&nextEpisode=false&episodeSelector=true`,
        getAnimeUrl: (id, e) => `https://www.vidking.net/embed/tv/${id}/1/${e}?color=E50914&autoPlay=true`,
    },
    argon: {
        getMovieUrl: (id) => `https://111movies.com/movie/${id}`,
        getTvUrl: (id, s, e) => `https://111movies.com/tv/${id}/${s}/${e}`,
        getAnimeUrl: (id, e) => `https://111movies.com/tv/${id}/1/${e}`,
    },
};

function Player({
    type,
    tmdbId,
    season = 1,
    episode = 1,
    onProgress,
    activeSource = 'xenon'
}) {
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentSource = PLAYER_SOURCES[activeSource] || PLAYER_SOURCES.xenon;

    // Generate player URL based on content type
    const getPlayerUrl = () => {
        if (type === 'movie') {
            return currentSource.getMovieUrl(tmdbId);
        } else if (type === 'anime') {
            return currentSource.getAnimeUrl(tmdbId, episode);
        } else {
            return currentSource.getTvUrl(tmdbId, season, episode);
        }
    };

    const playerUrl = getPlayerUrl();

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    // Reset loading when source changes
    useEffect(() => {
        setIsLoading(true);
    }, [activeSource]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (typeof event.data === 'string') {
                try {
                    const data = JSON.parse(event.data);
                    if (onProgress && data.progress) {
                        onProgress(data.progress);
                    }
                } catch (e) {
                    // Not a JSON message
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onProgress]);

    // Ad blocker
    useEffect(() => {
        const originalOpen = window.open;

        window.open = function (url, ...args) {
            if (url) {
                const urlStr = url.toString().toLowerCase();
                if (urlStr.includes('vidsrc') ||
                    urlStr.includes('vidfast') ||
                    urlStr.includes('vidking') ||
                    urlStr.includes('111movies') ||
                    urlStr.includes(window.location.hostname) ||
                    urlStr.includes('themoviedb')) {
                    return originalOpen.apply(this, [url, ...args]);
                }
            }
            console.log('Blocked popup:', url);
            return null;
        };

        const handleClick = (e) => {
            if (e.target.tagName === 'A' && e.target.target === '_blank') {
                const href = e.target.href?.toLowerCase() || '';
                if (!href.includes('vidsrc') &&
                    !href.includes('vidfast') &&
                    !href.includes('vidking') &&
                    !href.includes('111movies') &&
                    !href.includes(window.location.hostname)) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Blocked ad link:', href);
                }
            }
        };

        document.addEventListener('click', handleClick, true);

        return () => {
            window.open = originalOpen;
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return (
        <div className="player">
            {/* Loading indicator */}
            {isLoading && (
                <div className="player__loading">
                    <div className="player__loading-spinner"></div>
                    <span>Loading...</span>
                </div>
            )}

            {/* Player iframe */}
            <iframe
                ref={iframeRef}
                key={activeSource}
                src={playerUrl}
                className="player__iframe"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                title="Video Player"
                referrerPolicy="no-referrer"
                onLoad={handleIframeLoad}
            />
        </div>
    );
}

export default Player;
