/**
 * Platform Detection Utility
 * Detects if running in Android/Capacitor or Web browser
 */

/**
 * Check if Capacitor is available
 */
const getCapacitor = () => {
    try {
        if (typeof window !== 'undefined' && window.Capacitor) {
            return window.Capacitor;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Check if running on Android via Capacitor
 */
export const isAndroid = () => {
    const cap = getCapacitor();
    if (cap?.isNativePlatform?.() && cap?.getPlatform?.() === 'android') {
        return true;
    }
    // Fallback: Check user agent for Capacitor Android WebView
    if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent.toLowerCase();
        // Capacitor sets specific user agent markers
        if (ua.includes('capacitor') && ua.includes('android')) {
            return true;
        }
    }
    return false;
};

/**
 * Check if running on iOS via Capacitor
 */
export const isIOS = () => {
    const cap = getCapacitor();
    return cap?.isNativePlatform?.() && cap?.getPlatform?.() === 'ios';
};

/**
 * Check if running as native app (Android or iOS)
 */
export const isNative = () => {
    const cap = getCapacitor();
    if (cap?.isNativePlatform?.()) return true;
    // Fallback check
    if (typeof navigator !== 'undefined') {
        return navigator.userAgent.toLowerCase().includes('capacitor');
    }
    return false;
};

/**
 * Check if running in web browser
 */
export const isWeb = () => {
    return !isNative();
};

/**
 * Check if mobile device (native or mobile browser)
 */
export const isMobile = () => {
    if (isNative()) return true;
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|ipod|mobile/i.test(ua);
};

/**
 * Get current platform name
 */
export const getPlatform = () => {
    if (isAndroid()) return 'android';
    if (isIOS()) return 'ios';
    return 'web';
};

/**
 * Check if should use Android-specific UI
 */
export const useAndroidUI = () => {
    return isAndroid();
};

export default {
    isAndroid,
    isIOS,
    isNative,
    isWeb,
    isMobile,
    getPlatform,
    useAndroidUI
};
