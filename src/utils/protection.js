// Anti-dev-tools and source protection utilities
// This makes it harder (not impossible) to inspect/copy source code

// Disable right-click context menu
export const disableContextMenu = () => {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
};

// Disable common dev tools keyboard shortcuts
export const disableDevToolsShortcuts = () => {
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I (Dev Tools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }

        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
    });
};

// Detect dev tools open (basic detection)
export const detectDevTools = () => {
    const threshold = 160;

    const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            // Dev tools might be open - you can add custom behavior here
            document.body.classList.add('dev-tools-open');
        } else {
            document.body.classList.remove('dev-tools-open');
        }
    };

    // Check periodically
    setInterval(checkDevTools, 1000);
    checkDevTools();
};

// Disable text selection on sensitive elements
export const disableTextSelection = () => {
    const style = document.createElement('style');
    style.textContent = `
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Allow selection in input fields */
        input, textarea, [contenteditable="true"] {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    `;
    document.head.appendChild(style);
};

// Disable print screen (limited effectiveness)
export const disablePrintScreen = () => {
    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
        }
    });
};

// Disable drag and drop of images
export const disableImageDrag = () => {
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
};

// Console warning message
export const addConsoleWarning = () => {
    if (import.meta.env.PROD) {
        // Clear console
        console.clear();

        // Add warning message
        console.log(
            '%c⚠️ STOP!',
            'color: red; font-size: 60px; font-weight: bold; text-shadow: 2px 2px 0 #000;'
        );
        console.log(
            '%cThis is a protected application. Attempting to access or copy source code is prohibited.',
            'color: #ff6b6b; font-size: 16px; font-weight: bold;'
        );
    }
};

// Initialize all protections
export const initializeProtection = () => {
    if (typeof window === 'undefined') return;

    // Only enable in production
    if (import.meta.env.PROD) {
        disableContextMenu();
        disableDevToolsShortcuts();
        detectDevTools();
        disableTextSelection();
        disablePrintScreen();
        disableImageDrag();
        addConsoleWarning();
    }
};
