/**
 * Android Profile Page v9.0 - PREMIUM
 * Features:
 * - Animated avatar with gradient border
 * - Stats cards with icons
 * - Recent activity section
 * - Settings quick links
 * - Premium styling
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, isAuthenticated, getWatchlist, getFavorites, getContinueWatching } from '../services/api';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

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
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Header with avatar */}
            <header style={styles.header}>
                <div style={styles.avatarWrap}>
                    <div style={styles.avatar}>
                        <span style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                </div>
                <h1 style={styles.username}>{user?.username || 'User'}</h1>
                <p style={styles.email}>{user?.email}</p>
                <p style={styles.memberSince}>Member since 2024</p>
            </header>

            {/* Stats cards */}
            <div style={styles.statsRow}>
                <StatCard icon="📑" value={stats.watchlist} label="Watchlist" />
                <StatCard icon="❤️" value={stats.favorites} label="Favorites" />
                <StatCard icon="▶️" value={stats.watching} label="Watching" />
            </div>

            {/* Quick actions */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Quick Actions</h2>
                <div style={styles.actionsGrid}>
                    <ActionButton icon="📑" label="My List" onClick={() => navigate('/my-list')} />
                    <ActionButton icon="🔍" label="Search" onClick={() => navigate('/search')} />
                    <ActionButton icon="🏠" label="Home" onClick={() => navigate('/')} />
                    <ActionButton icon="⚙️" label="Settings" onClick={() => { }} />
                </div>
            </div>

            {/* Menu items */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Account</h2>
                <div style={styles.menu}>
                    <MenuItem icon="👤" label="Edit Profile" />
                    <MenuItem icon="🔔" label="Notifications" badge="2" />
                    <MenuItem icon="🎬" label="Playback Settings" />
                    <MenuItem icon="📱" label="Downloads" />
                    <MenuItem icon="🌙" label="Theme" value="Dark" />
                </div>
            </div>

            {/* About section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>About</h2>
                <div style={styles.menu}>
                    <MenuItem icon="ℹ️" label="About Nexflux" />
                    <MenuItem icon="📜" label="Privacy Policy" />
                    <MenuItem icon="📋" label="Terms of Service" />
                </div>
            </div>

            {/* Logout button */}
            <button style={styles.logoutBtn} onClick={handleLogout}>
                <span style={styles.logoutIcon}>🚪</span>
                Sign Out
            </button>

            {/* App version */}
            <p style={styles.version}>Nexflux v9.2.0 • Made with ❤️</p>
        </div>
    );
};

const StatCard = ({ icon, value, label }) => (
    <div style={styles.statCard}>
        <span style={styles.statIcon}>{icon}</span>
        <span style={styles.statValue}>{value}</span>
        <span style={styles.statLabel}>{label}</span>
    </div>
);

const ActionButton = ({ icon, label, onClick }) => (
    <button style={styles.actionBtn} onClick={() => { if (navigator.vibrate) navigator.vibrate(8); onClick?.(); }}>
        <span style={styles.actionIcon}>{icon}</span>
        <span style={styles.actionLabel}>{label}</span>
    </button>
);

const MenuItem = ({ icon, label, value, badge }) => (
    <button style={styles.menuItem}>
        <span style={styles.menuIcon}>{icon}</span>
        <span style={styles.menuLabel}>{label}</span>
        {value && <span style={styles.menuValue}>{value}</span>}
        {badge && <span style={styles.menuBadge}>{badge}</span>}
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
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.bg1
    },
    spinner: {
        width: 48,
        height: 48,
        border: `3px solid ${colors.bg4}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: space.xxl
    },
    avatarWrap: {
        padding: 4,
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.gold}, ${colors.primary})`,
        borderRadius: '50%',
        marginBottom: space.lg
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: colors.bg1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarText: {
        fontSize: 42,
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
        color: colors.text3,
        margin: 0
    },
    memberSince: {
        fontSize: typography.sizes.xs,
        color: colors.text4,
        marginTop: space.sm
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
        fontSize: 24,
        marginBottom: space.sm
    },
    statValue: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.text1
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text4,
        marginTop: 2
    },
    section: {
        marginBottom: space.xxl
    },
    sectionTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.text2,
        marginBottom: space.md
    },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: space.sm
    },
    actionBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: space.md,
        background: colors.bg3,
        border: 'none',
        borderRadius: radius.md,
        cursor: 'pointer'
    },
    actionIcon: {
        fontSize: 22
    },
    actionLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text2
    },
    menu: {
        background: colors.bg3,
        borderRadius: radius.lg,
        overflow: 'hidden'
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: space.md,
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
        fontSize: 18,
        width: 24,
        textAlign: 'center'
    },
    menuLabel: {
        flex: 1
    },
    menuValue: {
        fontSize: typography.sizes.sm,
        color: colors.text4
    },
    menuBadge: {
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        background: colors.primary,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    menuArrow: {
        fontSize: 20,
        color: colors.text4
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        width: '100%',
        padding: space.lg,
        background: 'rgba(239, 68, 68, 0.1)',
        border: `1px solid rgba(239, 68, 68, 0.3)`,
        borderRadius: radius.md,
        color: '#EF4444',
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer'
    },
    logoutIcon: {
        fontSize: 18
    },
    version: {
        textAlign: 'center',
        color: colors.text4,
        fontSize: typography.sizes.xs,
        marginTop: space.xxl
    }
};

export default AndroidProfile;
