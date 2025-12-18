/**
 * Android Login Page v4.0
 * Uses a- prefix classes
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
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

            if (res.success) navigate('/');
            else setError(res.message || 'Authentication failed');
        } catch (err) {
            setError('Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--a-bg-1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--a-6)'
        }}>
            {/* Logo */}
            <div style={{
                fontSize: '48px', fontWeight: 900, color: 'var(--a-primary)',
                marginBottom: 'var(--a-8)', textShadow: '0 0 30px var(--a-primary-glow)'
            }}>NEXFLUX</div>

            {/* Form */}
            <div style={{
                width: '100%', maxWidth: '400px',
                background: 'var(--a-bg-3)', borderRadius: 'var(--a-r-lg)',
                padding: 'var(--a-6)', border: '1px solid var(--a-border)'
            }}>
                <h1 style={{ fontSize: 'var(--a-fs-xl)', fontWeight: 700, marginBottom: 'var(--a-5)', textAlign: 'center' }}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>

                {error && (
                    <div style={{
                        padding: 'var(--a-3)', background: 'rgba(255, 69, 58, 0.15)',
                        border: '1px solid rgba(255, 69, 58, 0.3)', borderRadius: 'var(--a-r-sm)',
                        color: '#FF453A', fontSize: 'var(--a-fs-sm)', marginBottom: 'var(--a-4)'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="a-input"
                            style={{ marginBottom: 'var(--a-3)' }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="a-input"
                        style={{ marginBottom: 'var(--a-3)' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="a-input"
                        style={{ marginBottom: 'var(--a-5)' }}
                    />

                    <button type="submit" className="a-btn a-btn--primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Loading...' : (isRegister ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--a-5)' }}>
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--a-primary)', cursor: 'pointer', fontSize: 'var(--a-fs-sm)' }}
                    >
                        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>

            <button onClick={() => navigate('/')} style={{ marginTop: 'var(--a-5)', background: 'none', border: 'none', color: 'var(--a-text-4)', cursor: 'pointer' }}>
                Browse as Guest
            </button>
        </div>
    );
};

export default AndroidLogin;
