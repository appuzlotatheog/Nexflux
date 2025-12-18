/**
 * Android App Root v3.0
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { initVASTOnAppOpen } from './services/vastAds';
import './styles/theme.css';
import './styles/android.css';

// Lazy load pages
const AndroidHome = lazy(() => import('./pages/AndroidHome'));
const AndroidSearch = lazy(() => import('./pages/AndroidSearch'));
const AndroidDetails = lazy(() => import('./pages/AndroidDetails'));
const AndroidWatch = lazy(() => import('./pages/AndroidWatch'));
const AndroidMyList = lazy(() => import('./pages/AndroidMyList'));
const AndroidProfile = lazy(() => import('./pages/AndroidProfile'));
const AndroidLogin = lazy(() => import('./pages/AndroidLogin'));

// Loading fallback
const PageLoader = () => (
    <div className="nx-loading">
        <div className="nx-spinner" />
    </div>
);

const AndroidApp = () => {
    useEffect(() => {
        // Initialize VAST ads on app open
        initVASTOnAppOpen();

        // Set status bar color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = '#0A0A0C';
    }, []);

    return (
        <div className="android-app">
            <main className="android-main">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<AndroidHome />} />
                        <Route path="/search" element={<AndroidSearch />} />
                        <Route path="/movie/:id" element={<AndroidDetails type="movie" />} />
                        <Route path="/tv/:id" element={<AndroidDetails type="tv" />} />
                        <Route path="/watch/:type/:id" element={<AndroidWatch />} />
                        <Route path="/watch/:type/:id/:season/:episode" element={<AndroidWatch />} />
                        <Route path="/my-list" element={<AndroidMyList />} />
                        <Route path="/profile" element={<AndroidProfile />} />
                        <Route path="/login" element={<AndroidLogin />} />
                    </Routes>
                </Suspense>
            </main>
            <BottomNav />
        </div>
    );
};

export default AndroidApp;
