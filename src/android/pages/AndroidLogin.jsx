/**
 * Android Login Page v3.0
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import '../styles/theme.css';
import '../styles/android.css';

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
                navigate('/');
            } else {
                setError(res.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--nx-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--nx-lg)'
        }}>
            {/* Logo */}
            <div style={{
                fontSize: '48px',
                fontWeight: 900,
                color: 'var(--nx-primary)',
                marginBottom: 'var(--nx-xl)',
                textShadow: '0 0 30px var(--nx-primary-glow)'
            }}>
                NEXFLUX
            </div>

            {/* Form Card */}
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--nx-bg-card)',
                borderRadius: 'var(--nx-radius-lg)',
                padding: 'var(--nx-xl)',
                border: '1px solid var(--nx-glass-border)'
            }}>
                <h1 style={{ fontSize: 'var(--nx-font-xl)', fontWeight: 700, marginBottom: 'var(--nx-lg)', textAlign: 'center' }}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>

                {error && (
                    <div style={{
                        padding: 'var(--nx-md)',
                        background: 'rgba(255, 82, 82, 0.15)',
                        border: '1px solid rgba(255, 82, 82, 0.3)',
                        borderRadius: 'var(--nx-radius-sm)',
                        color: '#FF5252',
                        fontSize: 'var(--nx-font-sm)',
                        marginBottom: 'var(--nx-md)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="nx-input"
                            style={{ marginBottom: 'var(--nx-md)' }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="nx-input"
                        style={{ marginBottom: 'var(--nx-md)' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="nx-input"
                        style={{ marginBottom: 'var(--nx-lg)' }}
                    />

                    <button
                        type="submit"
                        className="nx-btn nx-btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : (isRegister ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--nx-lg)' }}>
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--nx-primary)', cursor: 'pointer', fontSize: 'var(--nx-font-sm)' }}
                    >
                        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>

            {/* Guest */}
            <button
                onClick={() => navigate('/')}
                style={{ marginTop: 'var(--nx-lg)', background: 'none', border: 'none', color: 'var(--nx-text-muted)', cursor: 'pointer' }}
            >
                Browse as Guest
            </button>
        </div>
    );
};

export default AndroidLogin;
