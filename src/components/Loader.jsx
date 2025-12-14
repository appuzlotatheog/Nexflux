import { useState, useEffect } from 'react';
import './Loader.css';

// Helper component for fur spans
const FurSpans = () => (
    <>
        {[...Array(31)].map((_, i) => (
            <span key={i} className={`fur-${31 - i}`}></span>
        ))}
    </>
);

// Helper component for lamp spans
const LampSpans = () => (
    <>
        {[...Array(28)].map((_, i) => (
            <span key={i} className={`lamp-${i + 1}`}></span>
        ))}
    </>
);

// Check if mobile device
const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 480 || /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Simple mobile splash - just logo fade
const MobileSplash = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="nexflux-splash nexflux-splash--mobile">
            <div className="nexflux-mobile-logo">N</div>
        </div>
    );
};

// Splash screen component - shows full animation on first load
export const SplashScreen = ({ onComplete }) => {
    const [isAnimating, setIsAnimating] = useState(true);
    const [mobile] = useState(() => isMobile());

    useEffect(() => {
        // Shorter duration on mobile
        const duration = mobile ? 2000 : 4000;
        const timer = setTimeout(() => {
            setIsAnimating(false);
            if (onComplete) onComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [onComplete, mobile]);

    if (!isAnimating) return null;

    // Simple animation for mobile
    if (mobile) {
        return <MobileSplash onComplete={onComplete} />;
    }

    // Full animation for desktop
    return (
        <div className="nexflux-splash" id="container">
            <div className="nexflux-intro" data-letter="N">
                <div className="helper-1">
                    <div className="effect-brush">
                        <FurSpans />
                    </div>
                    <div className="effect-lumieres">
                        <LampSpans />
                    </div>
                </div>
                <div className="helper-2">
                    <div className="effect-brush">
                        <FurSpans />
                    </div>
                </div>
                <div className="helper-3">
                    <div className="effect-brush">
                        <FurSpans />
                    </div>
                </div>
                <div className="helper-4">
                    <div className="effect-brush">
                        <FurSpans />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Regular loader for page transitions
const Loader = ({ fullPage = false }) => {
    return (
        <div className={`nexflux-loader ${fullPage ? 'nexflux-loader--fullpage' : ''}`}>
            <div className="nexflux-loader__simple">
                <div className="nexflux-loader__ring"></div>
                <span className="nexflux-loader__text">N</span>
            </div>
        </div>
    );
};

export default Loader;
