import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';
import './Profile.css';

// Avatar options
const AVATARS = [
    'aurora', 'felix', 'luna', 'max', 'nova', 'phoenix',
    'river', 'sage', 'skyler', 'storm', 'willow', 'zephyr'
];

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.username || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Stats
    const [stats, setStats] = useState({
        watchlist: 0,
        favorites: 0,
        continueWatching: 0
    });

    // Fetch stats from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [watchlistRes, favoritesRes, continueRes] = await Promise.all([
                    authApi.getWatchlist(),
                    authApi.getFavorites(),
                    authApi.getContinueWatching()
                ]);

                setStats({
                    watchlist: watchlistRes.watchlist?.length || 0,
                    favorites: favoritesRes.favorites?.length || 0,
                    continueWatching: continueRes.continueWatching?.length || 0
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setSelectedAvatar(user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
        }
    }, [user]);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        const result = await updateProfile({
            username: username !== user.username ? username : undefined,
            avatar: selectedAvatar !== user.avatar ? selectedAvatar : undefined
        });

        if (result.success) {
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to update profile');
        }

        setSaving(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const selectAvatar = (seed) => {
        setSelectedAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
        setShowAvatarPicker(false);
    };

    return (
        <div className="profile">
            <div className="profile__container">
                <div className="profile__header">
                    <h1 className="profile__title">Your Profile</h1>
                    <p className="profile__subtitle">Manage your account settings</p>
                </div>

                {/* Stats Grid */}
                <div className="profile__stats">
                    <div className="profile__stat">
                        <div className="profile__stat-value">{stats.watchlist}</div>
                        <div className="profile__stat-label">In Watchlist</div>
                    </div>
                    <div className="profile__stat">
                        <div className="profile__stat-value">{stats.favorites}</div>
                        <div className="profile__stat-label">Favorites</div>
                    </div>
                    <div className="profile__stat">
                        <div className="profile__stat-value">{stats.continueWatching}</div>
                        <div className="profile__stat-label">Continue Watching</div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="profile__card">
                    {success && (
                        <div className="profile__message profile__message--success">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="profile__message profile__message--error">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Avatar Section */}
                    <div className="profile__section">
                        <h3 className="profile__section-title">Avatar</h3>
                        <div className="profile__avatar-section">
                            <div className="profile__avatar-preview">
                                <img src={selectedAvatar} alt="Avatar" />
                                <button
                                    className="profile__avatar-edit"
                                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                </button>
                            </div>

                            {showAvatarPicker && (
                                <div className="profile__avatar-picker">
                                    <p className="profile__avatar-picker-title">Choose an avatar</p>
                                    <div className="profile__avatar-grid">
                                        {AVATARS.map(seed => (
                                            <button
                                                key={seed}
                                                className={`profile__avatar-option ${selectedAvatar.includes(seed) ? 'profile__avatar-option--active' : ''}`}
                                                onClick={() => selectAvatar(seed)}
                                            >
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                                    alt={seed}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="profile__section">
                        <h3 className="profile__section-title">Account Details</h3>

                        <div className="profile__field">
                            <label className="profile__label">Username</label>
                            <input
                                type="text"
                                className="profile__input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="profile__field">
                            <label className="profile__label">Email</label>
                            <input
                                type="email"
                                className="profile__input profile__input--disabled"
                                value={user?.email || ''}
                                disabled
                            />
                            <span className="profile__field-hint">Email cannot be changed</span>
                        </div>

                        <div className="profile__field">
                            <label className="profile__label">Member Since</label>
                            <input
                                type="text"
                                className="profile__input profile__input--disabled"
                                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile__actions">
                        <button
                            className="profile__btn profile__btn--primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="profile__spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>

                        <button
                            className="profile__btn profile__btn--danger"
                            onClick={handleLogout}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
