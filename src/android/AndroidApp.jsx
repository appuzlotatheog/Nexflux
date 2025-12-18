/**
 * Android App Wrapper
 * Root component for Android-specific UI
 */
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Android Components
import BottomNav from './components/BottomNav';

// Android Pages
import AndroidHome from './pages/AndroidHome';
import AndroidSearch from './pages/AndroidSearch';
import AndroidDetails from './pages/AndroidDetails';
import AndroidWatch from './pages/AndroidWatch';
import AndroidMyList from './pages/AndroidMyList';
import AndroidProfile from './pages/AndroidProfile';
import AndroidLogin from './pages/AndroidLogin';

// Services
import { initVASTOnAppOpen } from './services/vastAds';
import { isAuthenticated } from './services/api';

// Styles
import './styles/theme.css';
import './styles/android.css';

const AndroidApp = () => {
    const location = useLocation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize VAST ads on app open
        initVASTOnAppOpen();

        // Mark app as ready
        setIsReady(true);

        // Set status bar color for Android
        if (window.StatusBar) {
            window.StatusBar.backgroundColorByHexString('#0A0A0A');
            window.StatusBar.styleLightContent();
        }
    }, []);

    // Show splash while loading
    if (!isReady) {
        return (
            <div className="android-splash">
                <div className="android-splash__logo">N</div>
            </div>
        );
    }

    // Check if on full-screen page (hide nav)
    const isFullscreen = location.pathname.startsWith('/watch');

    return (
        <div className="android-app">
            <main className="android-main">
                <Routes>
                    <Route path="/" element={<AndroidHome />} />
                    <Route path="/search" element={<AndroidSearch />} />
                    <Route path="/my-list" element={<AndroidMyList />} />
                    <Route path="/profile" element={<AndroidProfile />} />
                    <Route path="/login" element={<AndroidLogin />} />
                    <Route path="/movie/:id" element={<AndroidDetails type="movie" />} />
                    <Route path="/tv/:id" element={<AndroidDetails type="tv" />} />
                    <Route path="/watch/:type/:id" element={<AndroidWatch />} />
                    <Route path="/watch/:type/:id/:season/:episode" element={<AndroidWatch />} />
                </Routes>
            </main>

            {!isFullscreen && <BottomNav />}
        </div>
    );
};

export default AndroidApp;
