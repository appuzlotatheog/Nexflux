import React, { useEffect, useState } from 'react';
import './MobileLoader.css';

const MobileLoader = ({ onComplete }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        // Simple 2.5 second loader
        const timer = setTimeout(() => {
            setExiting(true);
            // Short delay for fade out
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 500);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`mobile-splash ${exiting ? 'mobile-splash-exit' : ''}`}>
            <div className="mobile-logo-n">
                <span className="mobile-logo-letter">N</span>
            </div>
            <div className="mobile-brand">NEXFLUX</div>
            <div className="mobile-loading-bar">
                <div className="mobile-loading-bar-fill"></div>
            </div>
            <div className="mobile-loading-text">LOADING</div>
        </div>
    );
};

export default MobileLoader;
