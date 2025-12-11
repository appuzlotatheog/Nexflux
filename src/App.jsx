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
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
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
import ColorBends from './components/ColorBends';
import './App.css';

function AppContent() {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

    return (
        <div className="app">
            <ColorBends
                colors={["#000000", "#111111", "#222222"]}
                speed={0.1}
                noise={0.05}
            />
            {!isAuthPage && <Navbar />}
            <main className={`main-content ${isAuthPage ? 'main-content--auth' : ''}`}>
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
            {!isAuthPage && <ChatBot />}
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

