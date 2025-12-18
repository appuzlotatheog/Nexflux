import { useState } from 'react';
import { logMood } from '../utils/analytics';
import './MoodSelector.css';

const MOODS = [
    { value: 1, emoji: '😢', label: 'Sad' },
    { value: 2, emoji: '😐', label: 'Meh' },
    { value: 3, emoji: '🙂', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' }
];

function MoodSelector({ contentId, isBefore = true, onSelect, onSkip }) {
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (mood) => {
        setSelected(mood.value);
        logMood(mood.value, contentId, isBefore);
        setSubmitted(true);

        setTimeout(() => {
            onSelect?.(mood.value);
        }, 800);
    };

    if (submitted) {
        return (
            <div className="mood-selector mood-selector--submitted">
                <div className="mood-selector__thanks">
                    <span className="mood-selector__thanks-emoji">
                        {MOODS.find(m => m.value === selected)?.emoji}
                    </span>
                    <span>Thanks for sharing!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mood-selector">
            <div className="mood-selector__header">
                <span className="mood-selector__icon">
                    {isBefore ? '🎬' : '✨'}
                </span>
                <span className="mood-selector__title">
                    {isBefore ? 'How are you feeling?' : 'How do you feel now?'}
                </span>
            </div>

            <div className="mood-selector__options">
                {MOODS.map((mood) => (
                    <button
                        key={mood.value}
                        className={`mood-selector__mood ${selected === mood.value ? 'mood-selector__mood--selected' : ''}`}
                        onClick={() => handleSelect(mood)}
                    >
                        <span className="mood-selector__emoji">{mood.emoji}</span>
                        <span className="mood-selector__label">{mood.label}</span>
                    </button>
                ))}
            </div>

            {onSkip && (
                <button className="mood-selector__skip" onClick={onSkip}>
                    Skip
                </button>
            )}
        </div>
    );
}

export default MoodSelector;
