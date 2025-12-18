import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import ContinueWatchingRow from '../components/ContinueWatchingRow';
import Loader from '../components/Loader';
import DiscordPopup from '../components/DiscordPopup';
import { getContinueWatching, getWatchAgain, getWatchHistory } from '../utils/watchHistory';
import {
    getTrending,
    getPopularMovies,
    getTopRatedMovies,
    getPopularTV,
    getTopRatedTV,
    getNowPlayingMovies,
    getMoviesByGenre,
    getPersonalizedRecommendations,
    getPopularAnime,
} from '../api/tmdb';
import './Home.css';

function Home() {
    const [loading, setLoading] = useState(true);
    const [continueWatching, setContinueWatching] = useState([]);
    const [watchAgain, setWatchAgain] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [content, setContent] = useState({
        trending: [],
        top10: [],
        popularMovies: [],
        topRatedMovies: [],
        nowPlaying: [],
        popularTV: [],
        topRatedTV: [],
        action: [],
        comedy: [],
        sciFi: [],
        thriller: [],
        romance: [],
        animation: [],
        anime: [],
    });

    // Load watch history and get recommendations
    useEffect(() => {
        const loadWatchHistory = async () => {
            const continuing = getContinueWatching();
            const watchAgainItems = getWatchAgain();
            setContinueWatching(continuing);
            setWatchAgain(watchAgainItems);

            // Get personalized recommendations based on all watch history
            const allHistory = Object.values(getWatchHistory());
            if (allHistory.length > 0) {
                const recs = await getPersonalizedRecommendations(allHistory);
                setRecommendations(recs);
            }
        };

        loadWatchHistory();

        // Listen for storage changes (from Watch page)
        window.addEventListener('storage', loadWatchHistory);
        window.addEventListener('focus', loadWatchHistory);

        return () => {
            window.removeEventListener('storage', loadWatchHistory);
            window.removeEventListener('focus', loadWatchHistory);
        };
    }, []);

    useEffect(() => {
        const fetchAllContent = async () => {
            try {
                const [
                    trendingRes,
                    popularMoviesRes,
                    topRatedMoviesRes,
                    nowPlayingRes,
                    popularTVRes,
                    topRatedTVRes,
                    actionRes,
                    comedyRes,
                    sciFiRes,
                    thrillerRes,
                    romanceRes,
                    animationRes,
                    animeRes,
                ] = await Promise.all([
                    getTrending('all', 'week'),
                    getPopularMovies(),
                    getTopRatedMovies(),
                    getNowPlayingMovies(),
                    getPopularTV(),
                    getTopRatedTV(),
                    getMoviesByGenre(28), // Action
                    getMoviesByGenre(35), // Comedy
                    getMoviesByGenre(878), // Sci-Fi
                    getMoviesByGenre(53), // Thriller
                    getMoviesByGenre(10749), // Romance
                    getMoviesByGenre(16), // Animation
                    getPopularAnime(), // Anime from Japan
                ]);

                setContent({
                    trending: trendingRes.results,
                    top10: trendingRes.results.slice(0, 10),
                    popularMovies: popularMoviesRes.results,
                    topRatedMovies: topRatedMoviesRes.results,
                    nowPlaying: nowPlayingRes.results,
                    popularTV: popularTVRes.results,
                    topRatedTV: topRatedTVRes.results,
                    action: actionRes.results,
                    comedy: comedyRes.results,
                    sciFi: sciFiRes.results,
                    thriller: thrillerRes.results,
                    romance: romanceRes.results,
                    animation: animationRes.results,
                    anime: animeRes.results,
                });
            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllContent();
    }, []);

    if (loading) {
        return <Loader fullPage />;
    }

    return (
        <div className="home">
            <DiscordPopup />
            <Hero />

            <div className="home__content">
                {/* Continue Watching - only show if has items */}
                {continueWatching.length > 0 && (
                    <ContinueWatchingRow
                        title="Continue Watching"
                        items={continueWatching}
                        type="continue"
                    />
                )}

                {/* Watch Again - only show if has items */}
                {watchAgain.length > 0 && (
                    <ContinueWatchingRow
                        title="Watch Again"
                        items={watchAgain}
                        type="again"
                    />
                )}

                {/* Personalized Recommendations - only show if has watch history */}
                {recommendations.length > 0 && (
                    <ContentRow
                        title="Recommended For You"
                        items={recommendations}
                        isLargeRow={true}
                    />
                )}

                <ContentRow
                    title="Top 10 This Week"
                    items={content.top10}
                    showRanks={true}
                />
                <ContentRow title="Trending Now" items={content.trending} />
                <ContentRow title="Popular Movies" items={content.popularMovies} isLargeRow={true} />
                <ContentRow title="Popular TV Shows" items={content.popularTV} />
                <ContentRow title="Now Playing in Theaters" items={content.nowPlaying} />
                <ContentRow title="Top Rated Movies" items={content.topRatedMovies} />
                <ContentRow title="Top Rated TV Shows" items={content.topRatedTV} isLargeRow={true} />
                <ContentRow title="Action & Adventure" items={content.action} />
                <ContentRow title="Comedy" items={content.comedy} />
                <ContentRow title="Sci-Fi & Fantasy" items={content.sciFi} />
                <ContentRow title="Thrillers" items={content.thriller} />
                <ContentRow title="Romance" items={content.romance} />
                <ContentRow title="Animation" items={content.animation} isLargeRow={true} />
                <ContentRow title="Popular Anime" items={content.anime} />
            </div>

            {/* Premium Footer */}
            <footer className="footer">
                <div className="footer__glow" />
                <div className="footer__content container">
                    <div className="footer__brand">
                        <h2 className="footer__logo">NEXFLUX</h2>
                        <p className="footer__tagline">Your Cinema, Your Way</p>
                        <div className="footer__social">
                            <a href="#" className="footer__social-link" aria-label="Twitter">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.58-2.11-9.96-5.02-.42.72-.66 1.56-.66 2.46 0 1.68.85 3.16 2.14 4.02-.79-.02-1.53-.24-2.18-.6v.06c0 2.35 1.67 4.31 3.88 4.76-.4.1-.83.16-1.27.16-.31 0-.62-.03-.92-.08.63 1.96 2.45 3.39 4.61 3.43-1.69 1.32-3.83 2.1-6.15 2.1-.4 0-.8-.02-1.19-.07 2.19 1.4 4.78 2.22 7.57 2.22 9.07 0 14.02-7.52 14.02-14.02 0-.21 0-.42-.01-.63.96-.69 1.79-1.56 2.45-2.55z" />
                                </svg>
                            </a>
                            <a href="#" className="footer__social-link" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="footer__social-link" aria-label="YouTube">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            <a href="https://discord.gg/X3GByG2jTv" target="_blank" rel="noopener noreferrer" className="footer__social-link footer__social-link--discord" aria-label="Discord">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer__links">
                        <div className="footer__column">
                            <h4>Browse</h4>
                            <a href="/">Home</a>
                            <a href="/browse/movie">Movies</a>
                            <a href="/browse/tv">TV Shows</a>
                            <a href="/my-list">My List</a>
                        </div>
                        <div className="footer__column">
                            <h4>Genres</h4>
                            <a href="/browse/movie?genre=28">Action</a>
                            <a href="/browse/movie?genre=35">Comedy</a>
                            <a href="/browse/movie?genre=27">Horror</a>
                            <a href="/browse/movie?genre=10749">Romance</a>
                        </div>
                        <div className="footer__column">
                            <h4>Support</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Contact Us</a>
                            <a href="#">FAQ</a>
                            <a href="#">Community</a>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom container">
                    <div className="footer__credits">
                        <p>© 2024 Nexflux. Built with React</p>
                        <p className="footer__attribution">
                            Data provided by <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>
                        </p>
                    </div>
                    <div className="footer__badges">
                        <span className="footer__badge">4K UHD</span>
                        <span className="footer__badge">Dolby Atmos</span>
                        <span className="footer__badge">All Devices</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
