// Performance detection utilities
// Detects low-end devices and adjusts features accordingly

// Check if device is low-end based on various signals
export function isLowEndDevice() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
