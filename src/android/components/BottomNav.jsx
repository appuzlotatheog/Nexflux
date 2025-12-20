/**
 * Android Bottom Navigation v9.0 - PREMIUM
 * Features:
 * - Glass effect with blur
 * - Smooth slide indicator
 * - Badge support
 * - Haptic feedback
 * - Animated icon transitions
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

const navItems = [
    {
        id: 'home',
        label: 'Home',
        path: '/',
        icon: (active) => (
            <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? "0" : "2"} width="24" height="24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )
    },
    {
        id: 'search',
        label: 'Search',
        path: '/search',
        icon: (active) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} width="24" height="24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
        )
    },
    {
        id: 'mylist',
        label: 'My List',
        path: '/my-list',
        icon: (active) => (
            <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? "0" : "2"} width="24" height="24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
        ),
        badge: 0 // Can be set dynamically
    },
    {
        id: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: (active) => (
            <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? "0" : "2"} width="24" height="24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    }
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);

    // Calculate active index
    useEffect(() => {
        const idx = navItems.findIndex(item => {
            if (item.path === '/') return location.pathname === '/';
            return location.pathname.startsWith(item.path);
        });
        if (idx !== -1) setActiveIndex(idx);
    }, [location.pathname]);

    const handleClick = (path, index) => {
        if (navigator.vibrate) navigator.vibrate(10);
        setActiveIndex(index);
        navigate(path);
    };

    // Hide on certain pages
    const hiddenPaths = ['/watch', '/movie', '/tv', '/login'];
    if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                {/* Sliding indicator */}
                <div style={{
                    ...styles.indicator,
                    left: `calc(${activeIndex * 25}% + 12.5% - 16px)`
                }} />

                {/* Nav items */}
                {navItems.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <button
                            key={item.id}
                            style={styles.item}
                            onClick={() => handleClick(item.path, index)}
                            aria-label={item.label}
                        >
                            <div style={{
                                ...styles.iconWrap,
                                color: isActive ? colors.text1 : colors.text4,
                                transform: isActive ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                {item.icon(isActive)}

                                {/* Badge */}
                                {item.badge > 0 && (
                                    <span style={styles.badge}>{item.badge > 9 ? '9+' : item.badge}</span>
                                )}
                            </div>
                            <span style={{
                                ...styles.label,
                                color: isActive ? colors.text1 : colors.text4,
                                opacity: isActive ? 1 : 0.7
                            }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: `0 ${space.md}px ${space.md}px`,
        paddingBottom: `max(${space.md}px, env(safe-area-inset-bottom))`,
        zIndex: 1000,
        pointerEvents: 'none'
    },
    container: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        maxWidth: 420,
        margin: '0 auto',
        padding: `${space.sm}px ${space.md}px`,
        background: 'rgba(18, 18, 22, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: radius.xl,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto'
    },
    indicator: {
        position: 'absolute',
        top: 8,
        width: 32,
        height: 3,
        background: colors.primary,
        borderRadius: 2,
        boxShadow: `0 0 10px ${colors.primaryGlow}`,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        padding: `${space.sm}px`,
        paddingTop: space.md,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent'
    },
    iconWrap: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -8,
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        background: colors.primary,
        borderRadius: 8,
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: {
        fontSize: 11,
        fontWeight: typography.weights.medium,
        transition: 'all 0.2s ease'
    }
};

export default BottomNav;
