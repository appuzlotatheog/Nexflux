/**
 * Android Login Page v9.0 - PREMIUM
 * Features:
 * - Animated gradient background
 * - Glassmorphic card
 * - Smooth input focus states
 * - Password visibility toggle
 * - Loading states
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { colors, space, typography, shadows, radius } from '../styles/designSystem';

const AndroidLogin = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!username || !password || (!isLogin && !email)) {
            setError('Please fill in all fields');
            return;
        }

        if (navigator.vibrate) navigator.vibrate(10);
        setError('');
        setLoading(true);

        try {
            const action = isLogin
                ? await login(username, password)
                : await register(username, email, password);

            if (action.success) navigate('/');
            else setError(action.message || 'Something went wrong');
        } catch (e) {
            setError('Connection error. Please try again.');
        }

        setLoading(false);
    };

    const handleGuestBrowse = () => {
        if (navigator.vibrate) navigator.vibrate(8);
        navigate('/');
    };

    return (
        <div style={styles.page}>
            {/* Animated background */}
            <div style={styles.bgPattern} />
            <div style={styles.bgGradient} />

            {/* Logo */}
            <div style={styles.logo}>
                <span style={styles.logoText}>N</span>
            </div>

            {/* Card */}
            <div style={styles.card}>
                <h1 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p style={styles.subtitle}>
                    {isLogin ? 'Sign in to continue watching' : 'Join us for unlimited entertainment'}
                </p>

                {/* Form */}
                <form style={styles.form} onSubmit={handleSubmit}>
                    {/* Username */}
                    <div style={{
                        ...styles.inputWrap,
                        borderColor: focusedField === 'username' ? colors.primary : colors.bg5
                    }}>
                        <span style={styles.inputIcon}>👤</span>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setFocusedField('username')}
                            onBlur={() => setFocusedField(null)}
                            style={styles.input}
                            autoCapitalize="none"
                        />
                    </div>

                    {/* Email (only for register) */}
                    {!isLogin && (
                        <div style={{
                            ...styles.inputWrap,
                            borderColor: focusedField === 'email' ? colors.primary : colors.bg5
                        }}>
                            <span style={styles.inputIcon}>✉️</span>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                style={styles.input}
                                autoCapitalize="none"
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div style={{
                        ...styles.inputWrap,
                        borderColor: focusedField === 'password' ? colors.primary : colors.bg5
                    }}>
                        <span style={styles.inputIcon}>🔒</span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            style={styles.input}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.eyeBtn}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>

                    {/* Error */}
                    {error && <p style={styles.error}>{error}</p>}

                    {/* Submit button */}
                    <button
                        type="submit"
                        style={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <div style={styles.spinner} />
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <p style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        style={styles.toggleBtn}
                        onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(8);
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>

                {/* Divider */}
                <div style={styles.divider}>
                    <span style={styles.dividerText}>or</span>
                </div>

                {/* Guest button */}
                <button style={styles.guestBtn} onClick={handleGuestBrowse}>
                    Browse as Guest
                </button>
            </div>

            {/* Terms */}
            <p style={styles.terms}>
                By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: space.lg,
        paddingTop: 'max(32px, env(safe-area-inset-top))',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        background: colors.bg1,
        position: 'relative',
        overflow: 'hidden'
    },
    bgPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 20% 30%, ${colors.primaryGlow} 0%, transparent 50%),
                     radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)`,
        opacity: 0.7
    },
    bgGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(180deg, transparent 0%, ${colors.bg1} 100%)`
    },
    logo: {
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.primary,
        borderRadius: radius.lg,
        marginBottom: space.xxl,
        boxShadow: shadows.glow,
        position: 'relative',
        zIndex: 10
    },
    logoText: {
        fontSize: 48,
        fontWeight: typography.weights.black,
        color: colors.text1
    },
    card: {
        width: '100%',
        maxWidth: 380,
        padding: space.xl,
        background: 'rgba(20, 20, 25, 0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${colors.bg4}`,
        borderRadius: radius.xl,
        position: 'relative',
        zIndex: 10
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        textAlign: 'center',
        marginBottom: space.sm
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        textAlign: 'center',
        marginBottom: space.xl
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: space.md
    },
    inputWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: space.sm,
        padding: `${space.md}px ${space.lg}px`,
        background: colors.bg3,
        border: '2px solid',
        borderRadius: radius.md,
        transition: 'border-color 0.2s ease'
    },
    inputIcon: {
        fontSize: 16,
        opacity: 0.7
    },
    input: {
        flex: 1,
        background: 'none',
        border: 'none',
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontFamily: typography.fontFamily,
        outline: 'none'
    },
    eyeBtn: {
        background: 'none',
        border: 'none',
        fontSize: 16,
        cursor: 'pointer',
        padding: 0
    },
    error: {
        color: '#EF4444',
        fontSize: typography.sizes.sm,
        textAlign: 'center',
        marginTop: space.sm
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${space.lg}px`,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        boxShadow: shadows.glow,
        minHeight: 56,
        marginTop: space.sm
    },
    spinner: {
        width: 24,
        height: 24,
        border: '2px solid rgba(255,255,255,0.2)',
        borderTopColor: colors.text1,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    toggleText: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        textAlign: 'center',
        marginTop: space.lg
    },
    toggleBtn: {
        background: 'none',
        border: 'none',
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer',
        padding: 0
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: space.md,
        margin: `${space.lg}px 0`
    },
    dividerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: typography.sizes.sm,
        color: colors.text4
    },
    guestBtn: {
        width: '100%',
        padding: `${space.lg}px`,
        background: 'transparent',
        border: `1px solid ${colors.bg5}`,
        borderRadius: radius.md,
        color: colors.text2,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer'
    },
    terms: {
        fontSize: 11,
        color: colors.text4,
        textAlign: 'center',
        maxWidth: 280,
        marginTop: space.xl,
        lineHeight: 1.5,
        position: 'relative',
        zIndex: 10
    }
};

export default AndroidLogin;
