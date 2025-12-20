/**
 * Android Profile Page v7.0
 * Premium profile with stats and navigation
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, isAuthenticated, getWatchlist, getFavorites, getContinueWatching } from '../services/api';
import { colors, space, typography, shadows, radius, commonStyles } from '../styles/designSystem';

const AndroidProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ watchlist: 0, favorites: 0, watching: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [navigate]);

    const loadProfile = async () => {
        try {
            const [p, wl, fav, cw] = await Promise.all([
                getProfile(),
                getWatchlist(),
                getFavorites(),
                getContinueWatching()
            ]);
            if (p.success) setUser(p.user);
            setStats({
                watchlist: wl.watchlist?.length || 0,
                favorites: fav.favorites?.length || 0,
                watching: cw.continueWatching?.length || 0
            });
        } catch (e) { }
        setLoading(false);
    };

    const handleLogout = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={commonStyles.centerContainer}>
                <div style={commonStyles.spinner} />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Profile header */}
            <div style={styles.headerSection}>
                <div style={styles.avatar}>
                    <span style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <h1 style={styles.username}>{user?.username || 'User'}</h1>
                <p style={styles.email}>{user?.email}</p>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                {[
                    { label: 'Watchlist', value: stats.watchlist, icon: '📑' },
                    { label: 'Favorites', value: stats.favorites, icon: '❤️' },
                    { label: 'Watching', value: stats.watching, icon: '▶️' }
                ].map(stat => (
                    <div key={stat.label} style={styles.statCard}>
                        <span style={styles.statIcon}>{stat.icon}</span>
                        <span style={styles.statValue}>{stat.value}</span>
                        <span style={styles.statLabel}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Menu */}
            <div style={styles.menu}>
                <MenuItem
                    icon="📑"
                    label="My List"
                    onClick={() => { if (navigator.vibrate) navigator.vibrate(8); navigate('/my-list'); }}
                />
                <MenuItem
                    icon="🔍"
                    label="Search"
                    onClick={() => { if (navigator.vibrate) navigator.vibrate(8); navigate('/search'); }}
                />
                <MenuItem
                    icon="🏠"
                    label="Home"
                    onClick={() => { if (navigator.vibrate) navigator.vibrate(8); navigate('/'); }}
                />
            </div>

            {/* Logout */}
            <button style={styles.logoutBtn} onClick={handleLogout}>
                Sign Out
            </button>

            {/* App version */}
            <p style={styles.version}>Nexflux Android v7.0</p>
        </div>
    );
};

const MenuItem = ({ icon, label, onClick }) => (
    <button style={styles.menuItem} onClick={onClick}>
        <span style={styles.menuIcon}>{icon}</span>
        <span style={styles.menuLabel}>{label}</span>
        <span style={styles.menuArrow}>›</span>
    </button>
);

const styles = {
    page: {
        minHeight: '100vh',
        background: colors.bg1,
        padding: space.lg,
        paddingTop: 'max(32px, env(safe-area-inset-top))',
        paddingBottom: 120
    },
    headerSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: space.xxl
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: space.lg,
        boxShadow: shadows.glow
    },
    avatarText: {
        fontSize: 36,
        fontWeight: typography.weights.bold,
        color: colors.text1
    },
    username: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        margin: 0,
        marginBottom: space.xs
    },
    email: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        margin: 0
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: space.md,
        marginBottom: space.xxl
    },
    statCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: space.lg,
        background: colors.bg3,
        borderRadius: radius.lg,
        textAlign: 'center'
    },
    statIcon: {
        fontSize: 22,
        marginBottom: space.sm
    },
    statValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text1
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text4,
        marginTop: 2
    },
    menu: {
        background: colors.bg3,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: space.xxl
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: space.lg,
        width: '100%',
        padding: space.lg,
        background: 'none',
        border: 'none',
        borderBottom: `1px solid ${colors.bg4}`,
        color: colors.text2,
        fontSize: typography.sizes.md,
        fontFamily: typography.fontFamily,
        textAlign: 'left',
        cursor: 'pointer'
    },
    menuIcon: {
        fontSize: 20
    },
    menuLabel: {
        flex: 1
    },
    menuArrow: {
        fontSize: 20,
        color: colors.text4
    },
    logoutBtn: {
        width: '100%',
        padding: space.lg,
        background: 'rgba(255, 59, 48, 0.12)',
        border: `1px solid rgba(255, 59, 48, 0.3)`,
        borderRadius: radius.md,
        color: colors.error,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer'
    },
    version: {
        textAlign: 'center',
        color: colors.text4,
        fontSize: typography.sizes.xs,
        marginTop: space.xxl
    }
};

export default AndroidProfile;
