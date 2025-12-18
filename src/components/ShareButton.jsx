import { useState, useRef, useEffect } from 'react';
import './ShareButton.css';

function ShareButton({ title, url }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef(null);

    const shareUrl = url || window.location.href;
    const shareTitle = title || 'Check out this on Nexflux!';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShare = async () => {
        // Use native share API on mobile if available
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setIsOpen(!isOpen);
                }
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareOptions = [
        {
            name: 'Copy Link',
            icon: copied ? '✓' : '🔗',
            action: copyLink,
            label: copied ? 'Copied!' : 'Copy Link'
        },
        {
            name: 'Twitter',
            icon: '𝕏',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Facebook',
            icon: 'f',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'WhatsApp',
            icon: '💬',
            url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
        }
    ];

    return (
        <div className="share-button" ref={dropdownRef}>
            <button
                className="btn-icon share-button__trigger"
                onClick={handleShare}
                aria-label="Share"
                aria-expanded={isOpen}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                </svg>
            </button>

            {isOpen && (
                <div className="share-button__dropdown">
                    <div className="share-button__header">Share</div>
                    {shareOptions.map((option) => (
                        option.action ? (
                            <button
                                key={option.name}
                                className="share-button__option"
                                onClick={option.action}
                            >
                                <span className="share-button__icon">{option.icon}</span>
                                {option.label || option.name}
                            </button>
                        ) : (
                            <a
                                key={option.name}
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-button__option"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="share-button__icon">{option.icon}</span>
                                {option.name}
                            </a>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

export default ShareButton;
