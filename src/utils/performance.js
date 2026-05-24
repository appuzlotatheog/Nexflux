// Performance detection utilities
// Detects low-end devices and adjusts features accordingly

/**
 * Check if the device is an iPad (including iPad Pro / Air / Mini).
 * iPads often report as "Macintosh" in desktop mode and need special handling.
 */
function isIPad() {
    const ua = navigator.userAgent.toLowerCase();
    // Classic iPad user agent
    if (/ipad/.test(ua)) return true;
    // iPad Pro in desktop mode (no "iPad" in UA, but touch + macintosh)
    if (/macintosh/.test(ua) && 'ontouchend' in document) return true;
    // Screen size heuristic for iPad-like tablets
    const w = window.screen?.width || window.innerWidth;
    const h = window.screen?.height || window.innerHeight;
    const minDim = Math.min(w, h);
    const maxDim = Math.max(w, h);
    // iPad-ish dimensions (between phone and desktop)
    if (minDim >= 768 && maxDim <= 1400 && 'ontouchstart' in window) return true;
    return false;
}

/**
 * Check if the device is a tablet (non-iPad Android tablets, Surface, etc.)
 */
function isTablet() {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet/.test(ua)) return true;
    if (/android/.test(ua) && !/mobile/.test(ua)) return true;
    // Large touch-only screen that isn't a phone
    const w = window.screen?.width || window.innerWidth;
    const h = window.screen?.height || window.innerHeight;
    const minDim = Math.min(w, h);
    if (minDim >= 600 && minDim < 1024 && 'ontouchstart' in window && navigator.maxTouchPoints <= 2) {
        return true;
    }
    return false;
}

// Check if device is low-end based on various signals
export function isLowEndDevice() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
    }

    // iPads should be treated as reduced-capability for heavy WebGL / blur effects
    // They have high-resolution screens but thermal-throttle easily and Safari
    // has poor backdrop-filter and WebGL performance compared to desktop.
    if (isIPad() || isTablet()) {
        return true;
    }

    // Check hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
        return true;
    }

    // Check device memory (Chrome only)
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
        return true;
    }

    // Check for mobile devices with small screens (often lower performance)
    if (window.innerWidth <= 768 && 'ontouchstart' in window) {
        return true;
    }

    // Check WebGL support and performance
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            return true;
        }
        // Check for software renderer (indicates no GPU)
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer.toLowerCase().includes('swiftshader') ||
                renderer.toLowerCase().includes('llvmpipe') ||
                renderer.toLowerCase().includes('software')) {
                return true;
            }
        }
    } catch (e) {
        return true;
    }

    return false;
}

// Check if we should use heavy blur effects
export function shouldUseBlur() {
    // Safari and iOS have poor backdrop-filter performance
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if ((isSafari || isIOS) && isLowEndDevice()) {
        return false;
    }

    return !isLowEndDevice();
}

// Check if we should use WebGL background
export function shouldUseWebGL() {
    if (isLowEndDevice()) {
        return false;
    }

    // Also check if frame rate is good (run after initial load)
    return true;
}

// Apply performance class to body
export function applyPerformanceClass() {
    if (isLowEndDevice()) {
        document.body.classList.add('low-end-device');
    }
    if (!shouldUseBlur()) {
        document.body.classList.add('no-blur');
    }
}

// Initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPerformanceClass);
    } else {
        applyPerformanceClass();
    }
}
