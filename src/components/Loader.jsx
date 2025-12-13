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

// Splash screen component - shows full animation on first load
export const SplashScreen = ({ onComplete }) => {
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        // Animation duration: 4 seconds total
        const timer = setTimeout(() => {
            setIsAnimating(false);
            if (onComplete) onComplete();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isAnimating) return null;

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
