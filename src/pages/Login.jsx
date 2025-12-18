import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stepper, { Step } from '../components/Stepper';
import './Auth.css';
import './AuthSplit.css';

// Lazy load GridMotion for performance
const GridMotion = lazy(() => import('../components/GridMotion'));

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate(from, { replace: true });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate, from]);

    const validateStep = async (step) => {
        setError('');

        if (step === 1) {
            if (!email) {
                setError('Email is required');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
                setError('Please enter a valid email address');
                return false;
            }
            return true;
        }

        if (step === 2) {
            if (!password) {
                setError('Password is required');
                return false;
            }

            setLoading(true);
            try {
                const result = await login(email, password);
                setLoading(false);

                if (result.success) {
                    setSuccess(true);
                    return true;
                } else {
                    setError(result.error || 'Failed to login');
                    return false;
                }
            } catch (err) {
                setLoading(false);
                setError('An unexpected error occurred');
                return false;
            }
        }

        return true;
    };

    return (
        <div className="auth auth--split">
            {/* Left Side - Form */}
            <div className="auth__form-side">
                <div className="auth__form-container">
                    {/* Logo */}
                    <Link to="/" className="auth__logo">
                        <span className="auth__logo-text">NEXFLUX</span>
                    </Link>

                    <div className="auth__form-content">
                        <div className="auth__header">
                            <h1 className="auth__title">Welcome Back</h1>
                            <p className="auth__subtitle">Sign in to continue your journey</p>
                        </div>

                        {error && (
                            <div className="auth__error">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="auth__stepper-wrapper">
                            <Stepper
                                initialStep={1}
                                onBeforeNext={validateStep}
                                backButtonText="Back"
                                nextButtonText={loading ? "Signing In..." : "Next"}
                                disableStepIndicators={false}
                            >
                                <Step>
                                    <div className="auth__step-content">
                                        <h3 className="auth__step-title">What's your email?</h3>
                                        <div className="auth__input-wrapper">
                                            <input
                                                type="email"
                                                id="email"
                                                className="auth__input"
                                                placeholder=" "
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                                autoFocus
                                            />
                                            <label htmlFor="email" className="auth__label">Email Address</label>
                                            <div className="auth__input-icon">
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Step>

                                <Step>
                                    <div className="auth__step-content">
                                        <h3 className="auth__step-title">Enter your password</h3>
                                        <div className="auth__input-wrapper">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                className="auth__input"
                                                placeholder=" "
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                autoComplete="current-password"
                                                autoFocus
                                            />
                                            <label htmlFor="password" className="auth__label">Password</label>
                                            <div className="auth__input-icon">
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                                </svg>
                                            </div>
                                            <button
                                                type="button"
                                                className="auth__toggle-password"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <div className="auth__options">
                                            <label className="auth__checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                />
                                                <span className="auth__checkbox-mark"></span>
                                                <span>Remember me</span>
                                            </label>
                                            <Link to="/forgot-password" className="auth__forgot">Forgot password?</Link>
                                        </div>
                                    </div>
                                </Step>

                                <Step>
                                    <div className="auth__success-step">
                                        <div className="auth__success-icon">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                        </div>
                                        <h2 className="auth__success-title">Welcome Back!</h2>
                                        <p className="auth__success-desc">Redirecting you to your dashboard...</p>
                                    </div>
                                </Step>
                            </Stepper>
                        </div>

                        <div className="auth__divider">
                            <span>or continue with</span>
                        </div>

                        <div className="auth__social">
                            <button className="auth__social-btn auth__social-btn--google" disabled title="Coming soon">
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button className="auth__social-btn auth__social-btn--github" disabled title="Coming soon">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span>GitHub</span>
                            </button>
                        </div>

                        <div className="auth__footer">
                            <p>Don't have an account? <Link to="/register" className="auth__link">Create one</Link></p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="auth__form-footer">
                        <span>© Nexflux 2024</span>
                        <span>•</span>
                        <a href="mailto:support@nexflux.com">support@nexflux.com</a>
                    </div>
                </div>
            </div>

            {/* Right Side - Movie Poster Grid */}
            <div className="auth__grid-side">
                <Suspense fallback={<div className="auth__grid-loading" />}>
                    <GridMotion />
                </Suspense>
            </div>
        </div>
    );
};

export default Login;
