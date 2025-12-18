import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast types with icons
const TOAST_TYPES = {
    success: {
        icon: '✓',
        className: 'toast--success'
    },
    error: {
        icon: '✕',
        className: 'toast--error'
    },
    warning: {
        icon: '⚠',
        className: 'toast--warning'
    },
    info: {
        icon: 'ℹ',
        className: 'toast--info'
    },
    favorite: {
        icon: '♥',
        className: 'toast--favorite'
    },
    watchlist: {
        icon: '+',
        className: 'toast--watchlist'
    }
};

// Individual Toast Component
function Toast({ id, type, message, title, onRemove, duration = 4000 }) {
    const [isExiting, setIsExiting] = useState(false);
    const { icon, className } = TOAST_TYPES[type] || TOAST_TYPES.info;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(id), 300);
    };

    return (
        <div className={`toast ${className} ${isExiting ? 'toast--exiting' : ''}`}>
            <div className="toast__icon">{icon}</div>
            <div className="toast__content">
                {title && <div className="toast__title">{title}</div>}
                <div className="toast__message">{message}</div>
            </div>
            <button className="toast__close" onClick={handleClose}>
                ×
            </button>
            <div className="toast__progress" style={{ animationDuration: `${duration}ms` }} />
        </div>
    );
}

// Toast Container Provider
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((options) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            type: options.type || 'info',
            message: options.message || '',
            title: options.title,
            duration: options.duration || 4000
        };
        setToasts(prev => [...prev, toast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Helper methods
    const toast = {
        success: (message, options = {}) => addToast({ ...options, type: 'success', message }),
        error: (message, options = {}) => addToast({ ...options, type: 'error', message }),
        warning: (message, options = {}) => addToast({ ...options, type: 'warning', message }),
        info: (message, options = {}) => addToast({ ...options, type: 'info', message }),
        favorite: (message, options = {}) => addToast({ ...options, type: 'favorite', message }),
        watchlist: (message, options = {}) => addToast({ ...options, type: 'watchlist', message }),
        custom: addToast
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <Toast key={t.id} {...t} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastProvider;
