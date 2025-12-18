import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    // Password strength calculation with new requirements
    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '', requirements: {} };

        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        let score = 0;
        if (requirements.length) score++;
        if (requirements.uppercase) score++;
        if (requirements.lowercase) score++;
        if (requirements.number) score++;
        if (requirements.special) score++;

        let label, color;
        if (score <= 2) { label = 'Weak'; color = '#ff4444'; }
        else if (score === 3) { label = 'Fair'; color = '#ffaa00'; }
        else if (score === 4) { label = 'Strong'; color = '#00cc66'; }
        else { label = 'Excellent'; color = '#00ff88'; }

        return { score, label, color, requirements };
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter');
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError('Password must contain at least one lowercase letter');
            return;
        }

        if (!/[0-9]/.test(password)) {
            setError('Password must contain at least one number');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (!agreeTerms) {
            setError('Please agree to the Terms of Service');
            return;
        }

        setLoading(true);

        const result = await register(username, email, password);

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="auth">
            {/* Cinematic Background */}
            <div className="auth__bg">
                <div className="auth__bg-gradient"></div>
                <div className="auth__bg-pattern"></div>
                <div className="auth__bg-glow auth__bg-glow--1"></div>
                <div className="auth__bg-glow auth__bg-glow--2"></div>
            </div>

            <div className="auth__container">
                {/* Left Side - Branding */}
                <div className="auth__branding">
                    <Link to="/" className="auth__brand-logo">NEXFLUX</Link>
                    <h2 className="auth__brand-tagline">Start Your<br />Streaming Journey</h2>
                    <p className="auth__brand-desc">Join millions of viewers enjoying unlimited entertainment.</p>

                    <div className="auth__features">
                        <div className="auth__feature">
                            <div className="auth__feature-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <span>Free to join</span>
                        </div>
                        <div className="auth__feature">
                            <div className="auth__feature-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                </svg>
                            </div>
                            <span>Save your favorites</span>
                        </div>
                        <div className="auth__feature">
                            <div className="auth__feature-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <span>Personalized profile</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth__card">
                    <div className="auth__card-inner">
                        <div className="auth__header">
                            <h1 className="auth__title">Create Account</h1>
                            <p className="auth__subtitle">Fill in your details to get started</p>
                        </div>

                        {error && (
                            <div className="auth__error">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth__form" onSubmit={handleSubmit}>
                            <div className="auth__field">
                                <div className="auth__input-wrapper">
                                    <input
                                        type="text"
                                        id="username"
                                        className="auth__input"
                                        placeholder=" "
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        autoComplete="username"
                                        minLength={3}
                                        maxLength={30}
                                    />
                                    <label htmlFor="username" className="auth__label">Username</label>
                                    <div className="auth__input-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="auth__field">
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
                                    />
                                    <label htmlFor="email" className="auth__label">Email Address</label>
                                    <div className="auth__input-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="auth__field">
                                <div className="auth__input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="auth__input"
                                        placeholder=" "
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        minLength={8}
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
                                {password && (
                                    <>
                                        <div className="auth__password-strength">
                                            <div className="auth__strength-bar">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`auth__strength-segment ${level <= passwordStrength.score ? 'auth__strength-segment--active' : ''}`}
                                                        style={{ backgroundColor: level <= passwordStrength.score ? passwordStrength.color : undefined }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="auth__strength-label" style={{ color: passwordStrength.color }}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="auth__password-requirements">
                                            <div className={`auth__requirement ${passwordStrength.requirements.length ? 'auth__requirement--met' : ''}`}>
                                                {passwordStrength.requirements.length ? '✓' : '○'} 8+ characters
                                            </div>
                                            <div className={`auth__requirement ${passwordStrength.requirements.uppercase ? 'auth__requirement--met' : ''}`}>
                                                {passwordStrength.requirements.uppercase ? '✓' : '○'} Uppercase letter
                                            </div>
                                            <div className={`auth__requirement ${passwordStrength.requirements.lowercase ? 'auth__requirement--met' : ''}`}>
                                                {passwordStrength.requirements.lowercase ? '✓' : '○'} Lowercase letter
                                            </div>
                                            <div className={`auth__requirement ${passwordStrength.requirements.number ? 'auth__requirement--met' : ''}`}>
                                                {passwordStrength.requirements.number ? '✓' : '○'} Number
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="auth__field">
                                <div className="auth__input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        className={`auth__input ${confirmPassword && confirmPassword !== password ? 'auth__input--error' : ''}`}
                                        placeholder=" "
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <label htmlFor="confirmPassword" className="auth__label">Confirm Password</label>
                                    <div className="auth__input-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                        </svg>
                                    </div>
                                    {confirmPassword && confirmPassword === password && (
                                        <div className="auth__match-icon">
                                            <svg viewBox="0 0 24 24" fill="#00cc66" width="20" height="20">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="auth__options">
                                <label className="auth__checkbox">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                    />
                                    <span className="auth__checkbox-mark"></span>
                                    <span>I agree to the <a href="#" className="auth__link">Terms of Service</a> and <a href="#" className="auth__link">Privacy Policy</a></span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="auth__submit"
                                disabled={loading || !agreeTerms}
                            >
                                {loading ? (
                                    <div className="auth__spinner"></div>
                                ) : (
                                    <>
                                        Create Account
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth__divider">
                            <span>or sign up with</span>
                        </div>

                        <div className="auth__social">
                            <button className="auth__social-btn auth__social-btn--google" disabled>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button className="auth__social-btn auth__social-btn--github" disabled>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span>GitHub</span>
                            </button>
                        </div>

                        <div className="auth__footer">
                            <p>Already have an account? <Link to="/login" className="auth__link">Sign in</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
