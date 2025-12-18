/* Premium SVG Icon Library for Nexflux */

// Icon component with consistent sizing and styling
export const Icon = ({ name, size = 24, className = '', ...props }) => {
    const icons = {
        // Media types
        movie: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
            </svg>
        ),
        tv: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
            </svg>
        ),

        // Stats icons
        clock: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
        ),
        fire: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
            </svg>
        ),
        target: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
        ),
        theater: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
            </svg>
        ),
        bolt: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z" />
            </svg>
        ),
        history: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
        ),

        // Star/ratings
        star: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ),
        starOutline: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
            </svg>
        ),

        // Actions
        sparkle: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M12 3L14.39 8.25L20 9.24L16 13.47L16.78 19L12 16.27L7.22 19L8 13.47L4 9.24L9.61 8.25L12 3Z" />
                <path d="M19 2L20 5L23 6L20 7L19 10L18 7L15 6L18 5L19 2Z" opacity="0.7" />
            </svg>
        ),
        play: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M8 5v14l11-7z" />
            </svg>
        ),
        search: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
        ),
        heart: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ),
        lightbulb: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
            </svg>
        ),

        // Mood icons (stylized faces)
        moodSad: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
                <path d="M8 16c1.5-2 5.5-2 7 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        moodNeutral: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
                <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        moodHappy: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
                <path d="M8 14c1.5 2 5.5 2 7 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        moodGreat: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M7 10c0.5-1 1.5-1 2 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15 10c0.5-1 1.5-1 2 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 14c2 3 7 3 9 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),

        // Category icons
        action: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z" />
            </svg>
        ),
        comedy: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
        ),

        // 4K badge
        quality4k: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="12" y="14" fontSize="7" fontWeight="bold" textAnchor="middle" fill="currentColor">4K</text>
            </svg>
        ),

        // Reactions trigger
        reactions: (
            <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <circle cx="15.5" cy="9.5" r="1.5" />
                <path d="M7 13.5C8 16.5 15 16.5 17 13.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    };

    return icons[name] || null;
};

export default Icon;
