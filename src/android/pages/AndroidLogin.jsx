/**
 * Android Login Page v7.0
 * Premium authentication with glassmorphism
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { colors, space, typography, shadows, radius, commonStyles } from '../styles/designSystem';

const AndroidLogin = () => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = isRegister
                ? await register(username, email, password)
                : await login(email, password);

            if (res.success) {
                if (navigator.vibrate) navigator.vibrate(10);
                navigate('/');
            } else {
                setError(res.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    const toggleMode = () => {
        if (navigator.vibrate) navigator.vibrate(8);
        setIsRegister(!isRegister);
        setError('');
    };

    return (
        <div style={styles.page}>
            {/* Logo */}
            <div style={styles.logoSection}>
                <div style={styles.logo}>N</div>
                <h1 style={styles.brandName}>NEXFLUX</h1>
            </div>

            {/* Form card */}
            <div style={styles.card}>
                <h2 style={styles.title}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={styles.subtitle}>
                    {isRegister ? 'Start your streaming journey' : 'Sign in to continue'}
                </p>

                {/* Error message */}
                {error && (
                    <div style={styles.error}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                {/* Toggle mode */}
                <div style={styles.toggleSection}>
                    <span style={styles.toggleText}>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button style={styles.toggleBtn} onClick={toggleMode}>
                        {isRegister ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>

            {/* Guest option */}
            <button style={styles.guestBtn} onClick={() => navigate('/')}>
                Browse as Guest
            </button>
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
        padding: space.xl,
        background: colors.bg1
    },
    logoSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: space.xxxl
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: radius.lg,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        fontWeight: typography.weights.black,
        color: colors.text1,
        marginBottom: space.md,
        boxShadow: shadows.glow
    },
    brandName: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.black,
        color: colors.text1,
        letterSpacing: 3,
        margin: 0
    },
    card: {
        width: '100%',
        maxWidth: 380,
        padding: space.xxl,
        background: colors.bg3,
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: radius.xl
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text1,
        margin: 0,
        marginBottom: space.xs,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.text4,
        margin: 0,
        marginBottom: space.xl,
        textAlign: 'center'
    },
    error: {
        padding: space.md,
        background: 'rgba(255, 59, 48, 0.15)',
        border: `1px solid rgba(255, 59, 48, 0.3)`,
        borderRadius: radius.sm,
        color: colors.error,
        fontSize: typography.sizes.sm,
        marginBottom: space.lg,
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: space.md
    },
    input: {
        width: '100%',
        padding: space.lg,
        background: colors.bg4,
        border: `2px solid transparent`,
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontFamily: typography.fontFamily,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 200ms ease'
    },
    submitBtn: {
        width: '100%',
        padding: `${space.lg}px`,
        marginTop: space.sm,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        border: 'none',
        borderRadius: radius.md,
        color: colors.text1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        boxShadow: shadows.glow
    },
    toggleSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        marginTop: space.xl
    },
    toggleText: {
        fontSize: typography.sizes.sm,
        color: colors.text4
    },
    toggleBtn: {
        background: 'none',
        border: 'none',
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer'
    },
    guestBtn: {
        marginTop: space.xl,
        background: 'none',
        border: 'none',
        color: colors.text4,
        fontSize: typography.sizes.sm,
        cursor: 'pointer'
    }
};

export default AndroidLogin;
