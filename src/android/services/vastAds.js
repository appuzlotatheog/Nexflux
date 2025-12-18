/**
 * VAST Video Ads Manager
 * Handles VAST video ads with 3-hour cooldown
 */

const VAST_CONFIG = {
    url: 'https://motherly-entrance.com/dSm/FEzqd.GrNVv_Z/GIUH/Iebm/9CulZ/UFlik/PPT/Yk3rM/jCYL2/NZDmYutSNQjncqy/N/jbYX0CNKwG',
    cooldownMs: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    storageKey: 'nexflux_last_ad_time',
};

/**
 * Get last ad shown time
 */
const getLastAdTime = () => {
    const time = localStorage.getItem(VAST_CONFIG.storageKey);
    return time ? parseInt(time, 10) : 0;
};

/**
 * Set last ad shown time
 */
const setLastAdTime = () => {
    localStorage.setItem(VAST_CONFIG.storageKey, Date.now().toString());
};

/**
 * Check if enough time has passed to show another ad
 */
export const canShowAd = () => {
    const lastTime = getLastAdTime();
    const elapsed = Date.now() - lastTime;
    return elapsed >= VAST_CONFIG.cooldownMs;
};

/**
 * Get time remaining before next ad can be shown (in ms)
 */
export const getTimeUntilNextAd = () => {
    const lastTime = getLastAdTime();
    const elapsed = Date.now() - lastTime;
    const remaining = VAST_CONFIG.cooldownMs - elapsed;
    return Math.max(0, remaining);
};

/**
 * Get VAST tag URL
 */
export const getVASTUrl = () => VAST_CONFIG.url;

/**
 * Mark that an ad was shown
 */
export const markAdShown = () => {
    setLastAdTime();
    console.log('[VAST] Ad shown, next ad available in 3 hours');
};

/**
 * Create VAST video player
 * Returns a promise that resolves when ad completes or is skipped
 */
export const showVASTAd = () => {
    return new Promise((resolve) => {
        if (!canShowAd()) {
            console.log('[VAST] Cooldown not complete, skipping ad');
            resolve({ shown: false, reason: 'cooldown' });
            return;
        }

        // Create ad container
        const container = document.createElement('div');
        container.id = 'vast-ad-container';
        container.innerHTML = `
            <div class="vast-ad-overlay">
                <div class="vast-ad-loading">
                    <div class="vast-spinner"></div>
                    <p>Loading ad...</p>
                </div>
                <video id="vast-video" playsinline webkit-playsinline></video>
                <div class="vast-ad-controls">
                    <span class="vast-skip-timer" id="vast-timer"></span>
                    <button class="vast-close-btn" id="vast-close" style="display:none;">Skip Ad ✕</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .vast-ad-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #000;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .vast-ad-loading {
                color: white;
                text-align: center;
            }
            .vast-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255,255,255,0.3);
                border-top-color: #E50914;
                border-radius: 50%;
                animation: vast-spin 1s linear infinite;
            }
            @keyframes vast-spin {
                to { transform: rotate(360deg); }
            }
            #vast-video {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            .vast-ad-controls {
                position: absolute;
                top: 20px;
                right: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .vast-skip-timer {
                color: white;
                font-size: 14px;
                background: rgba(0,0,0,0.7);
                padding: 8px 16px;
                border-radius: 4px;
            }
            .vast-close-btn {
                background: rgba(0,0,0,0.7);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .vast-close-btn:hover {
                background: rgba(255,255,255,0.1);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(container);

        // Try to fetch and parse VAST XML
        fetchVASTAd(container, resolve);
    });
};

/**
 * Fetch and parse VAST ad
 */
const fetchVASTAd = async (container, resolve) => {
    const closeAd = (shown = true) => {
        container.remove();
        if (shown) markAdShown();
        resolve({ shown, reason: shown ? 'completed' : 'error' });
    };

    try {
        const response = await fetch(VAST_CONFIG.url);
        const vastXml = await response.text();

        // Parse VAST XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(vastXml, 'text/xml');

        // Find media file
        const mediaFile = doc.querySelector('MediaFile');
        if (!mediaFile) {
            console.log('[VAST] No media file found');
            closeAd(false);
            return;
        }

        const videoUrl = mediaFile.textContent.trim();
        const video = container.querySelector('#vast-video');
        const loading = container.querySelector('.vast-ad-loading');
        const timer = container.querySelector('#vast-timer');
        const closeBtn = container.querySelector('#vast-close');

        video.src = videoUrl;
        video.load();

        video.onloadeddata = () => {
            loading.style.display = 'none';
            video.play();
        };

        // Show skip button after 5 seconds
        let skipCountdown = 5;
        const skipInterval = setInterval(() => {
            skipCountdown--;
            timer.textContent = `Skip in ${skipCountdown}s`;
            if (skipCountdown <= 0) {
                clearInterval(skipInterval);
                timer.style.display = 'none';
                closeBtn.style.display = 'block';
            }
        }, 1000);

        closeBtn.onclick = () => {
            clearInterval(skipInterval);
            closeAd(true);
        };

        video.onended = () => {
            clearInterval(skipInterval);
            closeAd(true);
        };

        video.onerror = () => {
            clearInterval(skipInterval);
            closeAd(false);
        };

    } catch (error) {
        console.error('[VAST] Error loading ad:', error);
        closeAd(false);
    }
};

/**
 * Initialize VAST ads for app open
 */
export const initVASTOnAppOpen = () => {
    if (canShowAd()) {
        // Slight delay to let app load first
        setTimeout(() => {
            showVASTAd();
        }, 1500);
    }
};

export default {
    canShowAd,
    getTimeUntilNextAd,
    showVASTAd,
    markAdShown,
    getVASTUrl,
    initVASTOnAppOpen,
};
