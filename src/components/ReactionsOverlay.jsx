import { useState, useEffect, useRef } from 'react';
import { addReaction, getReactions } from '../utils/analytics';
import './ReactionsOverlay.css';

const REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👏', '😱', '🎉'];

function ReactionsOverlay({ contentId, isPlaying = false }) {
    const [activeReactions, setActiveReactions] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const containerRef = useRef(null);
    const reactionIdRef = useRef(0);

    // Load existing reactions
    useEffect(() => {
        if (contentId) {
            const saved = getReactions(contentId);
            // Show last 5 reactions as floating
            const recent = saved.slice(-5).map((r, i) => ({
                id: `saved-${i}`,
                emoji: r.emoji,
                x: Math.random() * 80 + 10,
                y: Math.random() * 60 + 20
            }));
            setActiveReactions(recent);
        }
    }, [contentId]);

    const handleReaction = (emoji) => {
        const id = reactionIdRef.current++;
        const x = Math.random() * 70 + 15; // 15-85%
        const y = 80; // Start from bottom

        // Add to display
        setActiveReactions(prev => [...prev, { id, emoji, x, y }]);

        // Save to storage
        if (contentId) {
            addReaction(contentId, emoji, Date.now());
        }

        // Remove after animation
        setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== id));
        }, 2500);

        setShowPicker(false);
    };

    // Auto-hide picker
    useEffect(() => {
        if (showPicker) {
            const timer = setTimeout(() => setShowPicker(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showPicker]);

    return (
        <div className="reactions-overlay" ref={containerRef}>
            {/* Floating Reactions */}
            <div className="reactions-overlay__display">
                {activeReactions.map(reaction => (
                    <div
                        key={reaction.id}
                        className="reactions-overlay__floating"
                        style={{
                            left: `${reaction.x}%`,
                            bottom: `${reaction.y}%`
                        }}
                    >
                        {reaction.emoji}
                    </div>
                ))}
            </div>

            {/* Reaction Picker */}
            <div className="reactions-overlay__controls">
                <button
                    className={`reactions-overlay__trigger ${showPicker ? 'reactions-overlay__trigger--active' : ''}`}
                    onClick={() => setShowPicker(!showPicker)}
                >
                    🎭
                </button>

                {showPicker && (
                    <div className="reactions-overlay__picker">
                        {REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                className="reactions-overlay__emoji"
                                onClick={() => handleReaction(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReactionsOverlay;
