import React, { useEffect, useState } from 'react';
import './MobileLoader.css';

const MobileLoader = ({ onComplete }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        // Total duration ~2.5s
        const timer = setTimeout(() => {
            setExiting(true);
            // Wait for exit animation
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 600);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`mobile-splash ${exiting ? 'mobile-splash-exit' : ''}`}>
            {/* Floating Particles */}
            <div className="mobile-particles">
                <div className="mobile-particle"></div>
                <div className="mobile-particle"></div>
                <div className="mobile-particle"></div>
                <div className="mobile-particle"></div>
                <div className="mobile-particle"></div>
                <div className="mobile-particle"></div>
            </div>

            {/* Main Logo Container */}
            <div className="mobile-logo-container">
                {/* N Logo with Effects */}
                <div className="mobile-logo-n">
                    {/* Progress Ring */}
                    <div className="mobile-progress-ring">
                        <svg viewBox="0 0 130 130">
                            <circle className="mobile-progress-bg" cx="65" cy="65" r="63" />
                            <circle className="mobile-progress-fill" cx="65" cy="65" r="63" />
                        </svg>
                    </div>

                    {/* Orbiting Dots */}
                    <div className="mobile-orbit">
                        <div className="mobile-orbit-dot"></div>
                        <div className="mobile-orbit-dot"></div>
                        <div className="mobile-orbit-dot"></div>
                    </div>

                    {/* Letter N */}
                    <span className="mobile-logo-letter">N</span>
                </div>

                {/* Brand Name */}
                <div className="mobile-brand">NEXFLUX</div>

                {/* Loading Bar */}
                <div className="mobile-loading-bar">
                    <div className="mobile-loading-bar-fill"></div>
                </div>

                {/* Loading Text */}
                <div className="mobile-loading-text">Loading your experience...</div>
            </div>
        </div>
    );
};

export default MobileLoader;
