/**
 * Nexflux Ad Integration Module
 * Manages VAST, Multitag, and Underpop ad scripts
 * 
 * @author appuzlota
 */

// Configuration
const ADS_CONFIG = {
    enabled: true, // Master switch for all ads
    vast: {
        enabled: true,
        url: 'https://motherly-entrance.com/dSm/FEzqd.GrNVv_Z/GIUH/Iebm/9CulZ/UFlik/PPT/Yk3rM/jCYL2/NZDmYutSNQjncqy/N/jbYX0CNKwG'
    },
    multitag: {
        enabled: true,
        src: '//grotesquephilosophy.com/blX.VDsRdcG/l/0/YRWVcK/he_mY9fuzZ/UplskePDT/YA3XMOjJYX2/MPzCYttdN/jVcMy/NjjVYwzbNSwY'
    },
    underpop: {
        enabled: true,
        src: '//motherly-entrance.com/coDM9/6Ib.2B5tl-S_WCQB9RNNjxcFyLMzzzYQ3iNQiD0y2wN/ziIIz/NqjYcK3s'
    }
};

/**
 * Check if we're in production environment
 */
const isProduction = () => {
    const hostname = window.location.hostname;
    return !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname) &&
        !hostname.includes('192.168.') &&
        !hostname.includes('.local');
};

/**
 * Initialize VAST Video Ads
 */
const initVAST = () => {
    if (!ADS_CONFIG.vast.enabled) return;

    try {
        // VAST ads are typically handled by video players
        // Store the URL for use with video ad integrations
        window.NEXFLUX_VAST_URL = ADS_CONFIG.vast.url;
        console.log('[Ads] VAST URL configured');
    } catch (error) {
        console.error('[Ads] VAST init error:', error);
    }
};

/**
 * Initialize Multitag In-Page Ads
 */
const initMultitag = () => {
    if (!ADS_CONFIG.multitag.enabled) return;

    try {
        const d = document;
        const s = d.createElement('script');
        const l = d.scripts[d.scripts.length - 1];

        s.settings = {};
        s.src = ADS_CONFIG.multitag.src;
        s.async = true;
        s.referrerPolicy = 'no-referrer-when-downgrade';

        if (l && l.parentNode) {
            l.parentNode.insertBefore(s, l);
        } else {
            document.head.appendChild(s);
        }

        console.log('[Ads] Multitag initialized');
    } catch (error) {
        console.error('[Ads] Multitag init error:', error);
    }
};

/**
 * Initialize Underpop Ads
 */
const initUnderpop = () => {
    if (!ADS_CONFIG.underpop.enabled) return;

    try {
        const d = document;
        const s = d.createElement('script');
        const l = d.scripts[d.scripts.length - 1];

        s.settings = {};
        s.src = ADS_CONFIG.underpop.src;
        s.async = true;
        s.referrerPolicy = 'no-referrer-when-downgrade';

        if (l && l.parentNode) {
            l.parentNode.insertBefore(s, l);
        } else {
            document.head.appendChild(s);
        }

        console.log('[Ads] Underpop initialized');
    } catch (error) {
        console.error('[Ads] Underpop init error:', error);
    }
};

/**
 * Initialize all ad scripts
 * Only runs in production environment
 */
export const initAds = () => {
    // Skip ads for localhost/development
    if (!isProduction()) {
        console.log('[Ads] Development mode - ads disabled');
        return;
    }

    if (!ADS_CONFIG.enabled) {
        console.log('[Ads] Ads are disabled via config');
        return;
    }

    // Wait for page to be interactive
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initVAST();
            initMultitag();
            initUnderpop();
        });
    } else {
        initVAST();
        initMultitag();
        initUnderpop();
    }

    console.log('[Ads] Ad scripts initialized');
};

/**
 * Get VAST URL for video player integration
 */
export const getVASTUrl = () => {
    return ADS_CONFIG.vast.enabled ? ADS_CONFIG.vast.url : null;
};

/**
 * Disable all ads (useful for premium users)
 */
export const disableAds = () => {
    ADS_CONFIG.enabled = false;
    console.log('[Ads] All ads disabled');
};

/**
 * Enable all ads
 */
export const enableAds = () => {
    ADS_CONFIG.enabled = true;
    initAds();
};

export default {
    init: initAds,
    getVASTUrl,
    disable: disableAds,
    enable: enableAds,
    config: ADS_CONFIG
};
