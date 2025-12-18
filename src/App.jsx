/**
 * ██████╗ ██╗   ██╗     █████╗ ██████╗ ██████╗ ██╗   ██╗███████╗██╗      ██████╗ ████████╗ █████╗
 * ██╔══██╗╚██╗ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗██║   ██║╚══███╔╝██║     ██╔═══██╗╚══██╔══╝██╔══██╗
 * ██████╔╝ ╚████╔╝     ███████║██████╔╝██████╔╝██║   ██║  ███╔╝ ██║     ██║   ██║   ██║   ███████║
 * ██╔══██╗  ╚██╔╝      ██╔══██║██╔═══╝ ██╔═══╝ ██║   ██║ ███╔╝  ██║     ██║   ██║   ██║   ██╔══██║
 * ██████╔╝   ██║       ██║  ██║██║     ██║     ╚██████╔╝███████╗███████╗╚██████╔╝   ██║   ██║  ██║
 * ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝     ╚═╝      ╚═════╝ ╚══════╝╚══════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝
 * 
 * @author appuzlota
 * @signature 0x4150505A4C4F5441
 */
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import QuickActions from './components/QuickActions';
import ProtectedRoute from './components/ProtectedRoute';
import { SplashScreen } from './components/Loader';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAndroidUI } from './utils/platform';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Details from './pages/Details';
import MyList from './pages/MyList';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { shouldUseWebGL } from './utils/performance';
import './App.css';

// Lazy load heavy components
const ColorBends = lazy(() => import('./components/ColorBends'));
// Android App (lazy loaded for web builds)
const AndroidApp = lazy(() => import('./android/AndroidApp'));

function AppContent() {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
    const isWatchPage = location.pathname.startsWith('/watch');
    const [useWebGL, setUseWebGL] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [showSplash, setShowSplash] = useState(() => {
        // Show splash on first load (check session storage)
        const hasShownSplash = sessionStorage.getItem('nexflux_splash_shown');
        return !hasShownSplash;
    });

    // Enable keyboard shortcuts (web only)
    useKeyboardShortcuts();

    useEffect(() => {
        // Check device performance after mount
        setUseWebGL(shouldUseWebGL());

        // Check if running on Android
        setIsAndroid(useAndroidUI());
    }, []);


    const handleSplashComplete = () => {
        setShowSplash(false);
        sessionStorage.setItem('nexflux_splash_shown', 'true');
    };

    return (
        <div className="app">
            {/* Splash Screen - overlays content while it loads in background */}
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

            {/* Render Android App for native Android devices */}
            {isAndroid ? (
                <Suspense fallback={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        background: '#0A0A0A'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '900',
                            color: '#E50914'
                        }}>N</div>
                    </div>
                }>
                    <AndroidApp />
                </Suspense>
            ) : (
                <>
                    {/* Content loads in background during splash */}
                    {useWebGL && !isWatchPage && (
                        <Suspense fallback={null}>
                            <ColorBends
                                colors={["#000000", "#111111", "#222222"]}
                                speed={0.08}
                                noise={0.03}
                            />
                        </Suspense>
                    )}
                    {!isAuthPage && !isWatchPage && <Navbar className={showSplash ? 'navbar--hidden' : ''} />}
                    <main className={`main-content ${isAuthPage ? 'main-content--auth' : ''} ${isWatchPage ? 'main-content--watch' : ''}`}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/watch/:type/:id" element={<Watch />} />
                            <Route path="/watch/:type/:id/:season/:episode" element={<Watch />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/browse/:type" element={<Browse />} />
                            <Route path="/browse/:type/:genreId" element={<Browse />} />
                            <Route path="/details/:type/:id" element={<Details />} />

                            {/* Protected Routes - Require Authentication */}
                            <Route path="/my-list" element={
                                <ProtectedRoute>
                                    <MyList />
                                </ProtectedRoute>
                            } />
                            <Route path="/stats" element={
                                <ProtectedRoute>
                                    <Stats />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                    {!isAuthPage && !showSplash && <ChatBot />}
                    {!isAuthPage && !isWatchPage && !showSplash && <QuickActions />}
                </>
            )}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
