import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LANGUAGES } from '../utils/i18n.jsx';
import { useAuth } from '../context/AuthContext';
import SmartSearch from './SmartSearch';
import './Navbar.css';

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [smartSearchOpen, setSmartSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [langOpen, setLangOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const langRef = useRef(null);
    const userMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { language, setLanguage, t } = useLanguage();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: t('nav.home'), icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
        { to: '/browse/tv', label: 'Shows', icon: 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z' },
        { to: '/browse/movie', label: t('nav.movies'), icon: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z' },
        { to: '/browse/anime', label: 'Anime', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
        { to: '/my-list', label: t('nav.myList'), icon: 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z' },
        { to: '/stats', label: 'Stats', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    ];

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
                <div className="navbar__left">
                    <Link to="/" className="navbar__logo">
                        <span className="navbar__logo-text">NEXFLUX</span>
                    </Link>

                    <ul className="navbar__links">
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="navbar__right">
                    <form
                        className={`navbar__search ${searchOpen ? 'navbar__search--open' : ''}`}
                        onSubmit={handleSearch}
                    >
                        <button
                            type="button"
                            className="navbar__search-btn"
                            onClick={() => setSearchOpen(!searchOpen)}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            className="navbar__search-input"
                            placeholder={t('nav.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Language Selector */}
                    <div className="navbar__lang" ref={langRef}>
                        <button
                            className="navbar__lang-btn"
                            onClick={() => setLangOpen(!langOpen)}
                            aria-label="Select language"
                        >
                            <span className="navbar__lang-flag">{LANGUAGES[language].flag}</span>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M7 10l5 5 5-5z" />
                            </svg>
                        </button>
                        {langOpen && (
                            <div className="navbar__lang-dropdown">
                                {Object.values(LANGUAGES).map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`navbar__lang-option ${language === lang.code ? 'navbar__lang-option--active' : ''}`}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setLangOpen(false);
                                        }}
                                    >
                                        <span className="navbar__lang-flag">{lang.flag}</span>
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Profile / Login */}
                    {isAuthenticated ? (
                        <div className="navbar__profile" ref={userMenuRef}>
                            <button
                                className="navbar__avatar-btn"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="navbar__avatar">
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                        alt={user?.username}
                                    />
                                </div>
                            </button>
                            {userMenuOpen && (
                                <div className="navbar__user-menu">
                                    <div className="navbar__user-info">
                                        <strong>{user?.username}</strong>
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="navbar__user-divider"></div>
                                    <Link to="/profile" className="navbar__user-item" onClick={() => setUserMenuOpen(false)}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <Link to="/my-list" className="navbar__user-item" onClick={() => setUserMenuOpen(false)}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                        </svg>
                                        My List
                                    </Link>
                                    <Link to="/stats" className="navbar__user-item" onClick={() => setUserMenuOpen(false)}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                                        </svg>
                                        Stats
                                    </Link>
                                    <div className="navbar__user-divider"></div>
                                    <button className="navbar__user-item navbar__user-item--logout" onClick={handleLogout}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="navbar__login-btn">
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <nav className="bottom-nav">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
                        }
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d={link.icon} />
                        </svg>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
                <button
                    className={`bottom-nav__item ${location.pathname === '/search' ? 'bottom-nav__item--active' : ''}`}
                    onClick={() => navigate('/search')}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <span>{t('nav.search')}</span>
                </button>
            </nav>

            {/* Smart Search Modal */}
            {smartSearchOpen && (
                <SmartSearch onClose={() => setSmartSearchOpen(false)} />
            )}
        </>
    );
}

export default Navbar;
