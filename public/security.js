/**
 * NEXFLUX SECURITY SHIELD
 * Maximum Protection Against Dev Tools & Inspection
 * @author appuzlota
 */

(function () {
    'use strict';

    // ===== CONFIGURATION =====
    const CONFIG = {
        blockDevTools: true,
        blockRightClick: true,
        blockKeyboardShortcuts: true,
        blockSelection: true,
        blockDrag: true,
        debuggerLoop: true,
        consoleWarning: true,
        redirectOnDetect: false, // Set to URL string to redirect
        maxDetections: 3
    };

    let detectionCount = 0;

    // ===== CONSOLE OVERRIDE =====
    if (CONFIG.consoleWarning) {
        const warning = [
            '%c⚠️ STOP!',
            'color: red; font-size: 60px; font-weight: bold; text-shadow: 2px 2px 0 black;'
        ];
        const message = [
            '%cThis browser feature is intended for developers. If someone told you to copy-paste something here, it is likely a scam and will give them access to your account.',
            'font-size: 16px; color: #f0f0f0;'
        ];

        console.log(...warning);
        console.log(...message);
        console.log('%cNexflux Security System Active 🛡️', 'color: #00ff00; font-size: 14px;');
    }

    // ===== DEVTOOLS DETECTION =====
    const devToolsDetector = {
        isOpen: false,
        orientation: undefined,

        check() {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!this.isOpen) {
                    this.isOpen = true;
                    this.onDetect();
                }
                this.orientation = widthThreshold ? 'vertical' : 'horizontal';
            } else {
                this.isOpen = false;
            }
        },

        onDetect() {
            detectionCount++;
            console.clear();
            console.log('%c🚨 Developer Tools Detected!', 'color: red; font-size: 20px;');

            if (CONFIG.redirectOnDetect && detectionCount >= CONFIG.maxDetections) {
                window.location.href = CONFIG.redirectOnDetect;
            }
        }
    };

    // Check periodically
    setInterval(() => devToolsDetector.check(), 500);

    // ===== DEBUGGER LOOP =====
    if (CONFIG.debuggerLoop) {
        (function loop() {
            setInterval(() => {
                const start = performance.now();
                debugger;
                const end = performance.now();
                if (end - start > 100) {
                    devToolsDetector.onDetect();
                }
            }, 1000);
        })();
    }

    // ===== KEYBOARD SHORTCUTS =====
    if (CONFIG.blockKeyboardShortcuts) {
        document.addEventListener('keydown', function (e) {
            // F12
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+S (Save)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+P (Print)
            if (e.ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+K (Firefox Console)
            if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Cmd+Option+I (Mac DevTools)
            if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Cmd+Option+J (Mac Console)
            if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Cmd+Option+U (Mac View Source)
            if (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);
    }

    // ===== RIGHT CLICK =====
    if (CONFIG.blockRightClick) {
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
    }

    // ===== TEXT SELECTION =====
    if (CONFIG.blockSelection) {
        document.addEventListener('selectstart', function (e) {
            // Allow selection in inputs and textareas
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
            return false;
        });

        // CSS to prevent selection
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }
            input, textarea {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== DRAG PREVENTION =====
    if (CONFIG.blockDrag) {
        document.addEventListener('dragstart', function (e) {
            e.preventDefault();
            return false;
        });
    }

    // ===== COPY PREVENTION =====
    document.addEventListener('copy', function (e) {
        // Allow copy in inputs
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    });

    // ===== CONSOLE CLEAR LOOP =====
    setInterval(() => {
        if (devToolsDetector.isOpen) {
            console.clear();
            console.log('%c🛡️ Nexflux Security Active', 'color: #00ff00; font-size: 20px;');
        }
    }, 2000);

    // ===== IFRAME PROTECTION =====
    if (window.self !== window.top) {
        // We're in an iframe, break out
        window.top.location = window.self.location;
    }

    // ===== MUTATION OBSERVER =====
    // Detect if someone adds script tags dynamically
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'SCRIPT' && node.src && !node.src.includes(window.location.hostname)) {
                    node.remove();
                }
            });
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // ===== WINDOW BLUR DETECTION =====
    // Detect when user switches to DevTools window
    let blurCount = 0;
    window.addEventListener('blur', () => {
        blurCount++;
        if (blurCount > 5) {
            // Possible DevTools usage
            console.clear();
        }
    });

    window.addEventListener('focus', () => {
        blurCount = 0;
    });

    console.log('%c✅ Nexflux Security Shield Loaded', 'color: #00ff00; font-size: 12px;');
})();
