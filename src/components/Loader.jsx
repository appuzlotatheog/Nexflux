import { useState, useEffect } from 'react';
import './Loader.css';

// Helper component for fur spans (desktop only)
const FurSpans = () => (
    <>
        {[...Array(31)].map((_, i) => (
            <span key={i} className={`fur-${31 - i}`}></span>
        ))}
    </>
);

// Helper component for lamp spans (desktop only)
const LampSpans = () => (
    <>
        {[...Array(28)].map((_, i) => (
            <span key={i} className={`lamp-${i + 1}`}></span>
        ))}
    </>
);

// Detect if actual mobile device (not just screen size)
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    // Check for touch device AND mobile user agent
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    // Must be touch device with mobile UA or very small screen with mobile UA
    return (hasTouchScreen && isMobileUA) || (isSmallScreen && isMobileUA);
};

// Simple mobile splash - just N logo
const MobileSplash = () => (
    <div className="nexflux-splash nexflux-splash--mobile">
        <div className="nexflux-mobile-logo">N</div>
    </div>
);

// Full desktop splash - Netflix style animation
const DesktopSplash = () => (
    <div className="nexflux-splash nexflux-splash--desktop">
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

// Splash screen component
export const SplashScreen = ({ onComplete }) => {
    const [visible, setVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check device type on mount
        setIsMobile(isMobileDevice());
    }, []);

    useEffect(() => {
        // Mobile: 2.5s, Desktop: 4s
        const duration = isMobile ? 2500 : 4000;
        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [onComplete, isMobile]);

    if (!visible) return null;

    // Return appropriate splash based on device
    return isMobile ? <MobileSplash /> : <DesktopSplash />;
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
