/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    NEXFLUX ANDROID v7.0 - PREMIUM UI SYSTEM
 *                    Complete inline styles - No CSS conflicts
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Design Tokens
export const colors = {
    // Brand
    primary: '#E50914',
    primaryDark: '#B20710',
    primaryGlow: 'rgba(229, 9, 20, 0.4)',

    // Backgrounds
    bg1: '#000000',
    bg2: '#0A0A0C',
    bg3: '#141418',
    bg4: '#1C1C22',
    bg5: '#28282F',

    // Text
    text1: '#FFFFFF',
    text2: '#E8E8EC',
    text3: '#A0A0A8',
    text4: '#6E6E78',

    // Semantic
    gold: '#FFBC00',
    success: '#00C853',
    warning: '#FF9100',
    error: '#FF3D00',

    // Glass
    glass: 'rgba(20, 20, 24, 0.92)',
    glassLight: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.12)'
};

// Spacing scale
export const space = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 40
};

// Typography
export const typography = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    sizes: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 17,
        xl: 20,
        xxl: 26,
        xxxl: 34,
        display: 42
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '800'
    }
};

// Shadows
export const shadows = {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
    glow: `0 0 20px ${colors.primaryGlow}`,
    card: '0 4px 20px rgba(0, 0, 0, 0.35)'
};

// Border radius
export const radius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 100
};

// Animation durations (in ms)
export const duration = {
    fast: 150,
    normal: 300,
    slow: 500
};

// Common component styles
export const commonStyles = {
    // Container
    page: {
        minHeight: '100vh',
        background: colors.bg1,
        color: colors.text1,
        fontFamily: typography.fontFamily,
        WebkitFontSmoothing: 'antialiased'
    },

    // Safe area padding
    safeTop: {
        paddingTop: 'max(16px, env(safe-area-inset-top))'
    },
    safeBottom: {
        paddingBottom: 'max(80px, calc(env(safe-area-inset-bottom) + 70px))'
    },

    // Glass card
    glassCard: {
        background: colors.glass,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: radius.lg
    },

    // Primary button
    primaryButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        padding: `${space.lg}px ${space.xl}px`,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        boxShadow: shadows.glow,
        transition: `transform ${duration.fast}ms ease, box-shadow ${duration.fast}ms ease`
    },

    // Secondary button
    secondaryButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        padding: `${space.lg}px ${space.xl}px`,
        background: colors.glassLight,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer'
    },

    // Icon button
    iconButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        padding: 0,
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(16px)',
        border: 'none',
        borderRadius: '50%',
        color: colors.text1,
        cursor: 'pointer'
    },

    // Section header
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${space.lg}px ${space.md}px`
    },

    // Section title
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        margin: 0
    },

    // Horizontal scroll
    horizontalScroll: {
        display: 'flex',
        gap: space.md,
        padding: `${space.xs}px ${space.lg}px`,
        overflowX: 'auto',
        scrollSnapType: 'x proximity',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },

    // Loading spinner
    spinner: {
        width: 40,
        height: 40,
        border: `3px solid ${colors.bg4}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },

    // Full center container
    centerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: space.xl,
        background: colors.bg1,
        textAlign: 'center'
    },

    // Input field
    input: {
        width: '100%',
        padding: space.lg,
        background: colors.bg3,
        border: `2px solid transparent`,
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.lg,
        fontFamily: typography.fontFamily,
        outline: 'none',
        transition: `border-color ${duration.normal}ms ease`
    },

    // Badge
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: `5px ${space.md}px`,
        background: colors.glassLight,
        backdropFilter: 'blur(8px)',
        borderRadius: radius.sm,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.text1,
        letterSpacing: 0.3
    },

    // Gold badge
    goldBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: `5px ${space.md}px`,
        background: `linear-gradient(135deg, ${colors.gold}, #FF9500)`,
        borderRadius: radius.sm,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: '#000',
        letterSpacing: 0.3
    }
};

// Add keyframes CSS to document
if (typeof document !== 'undefined') {
    const styleId = 'android-design-system';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            /* Hide scrollbars but allow scrolling */
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `;
        document.head.appendChild(style);
    }
}

export default {
    colors,
    space,
    typography,
    shadows,
    radius,
    duration,
    commonStyles
};
