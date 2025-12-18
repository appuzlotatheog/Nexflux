/**
 * Android Login Page
 * Premium glassmorphic login form
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register } from '../services/api';
import './AndroidLogin.css';

const AndroidLogin = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let result;

            if (isLogin) {
                result = await login(formData.email, formData.password);
            } else {
                result = await register(formData.username, formData.email, formData.password);
            }

            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'An error occurred');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="android-login">
            {/* Background */}
            <div className="android-login__bg" />

            {/* Content */}
            <div className="android-login__container">
                {/* Logo */}
                <div className="android-login__logo">
                    <span className="android-login__logo-text">N</span>
                    <span className="android-login__logo-name">Nexflux</span>
                </div>

                {/* Form Card */}
                <div className="android-login__card android-glass">
                    <h1 className="android-login__title">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="android-login__subtitle">
                        {isLogin ? 'Sign in to continue watching' : 'Start your streaming journey'}
                    </p>

                    <form className="android-login__form" onSubmit={handleSubmit}>
                        {/* Username (Register only) */}
                        {!isLogin && (
                            <div className="android-login__field">
                                <label className="android-login__label">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="android-input"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    minLength={3}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="android-login__field">
                            <label className="android-login__label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="android-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="android-login__field">
                            <label className="android-login__label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="android-input"
                                placeholder={isLogin ? "Enter your password" : "Create a password"}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="android-login__error">{error}</div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="android-btn android-btn-primary android-login__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="android-login__toggle">
                        <span>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </span>
                        <button
                            type="button"
                            className="android-login__toggle-btn"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>

                {/* Skip for now */}
                <button
                    className="android-login__skip"
                    onClick={() => navigate('/')}
                >
                    Browse as Guest
                </button>
            </div>
        </div>
    );
};

export default AndroidLogin;
