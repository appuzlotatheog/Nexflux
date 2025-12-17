import { useState, useEffect } from 'react';
import './Loader.css';
import MobileLoader from './MobileLoader';

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

// Robust device detection
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;

    // 1. Check screen width (most reliable for responsive design)
    if (window.innerWidth <= 768) return true;

    // 2. Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) return true;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return true;

    // 3. Check touch points
    if (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) return true;

    return false;
};

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
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Check device type immediately
        const mobile = isMobileDevice();
        setIsMobile(mobile);
        setChecked(true);

        // Desktop duration: 4s (animation)
        // Mobile duration is handled inside MobileLoader component
        if (!mobile) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onComplete) onComplete();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [onComplete]);

    if (!visible) return null;
    if (!checked) return null; // Prevent flash of wrong loader

    // Return appropriate splash based on device
    return isMobile ?
        <MobileLoader onComplete={onComplete} /> :
        <DesktopSplash />;
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
