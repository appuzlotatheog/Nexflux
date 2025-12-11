import { useState, useEffect, useRef } from 'react';
import ContinueWatchingCard from './ContinueWatchingCard';
import './ContinueWatchingRow.css';

function ContinueWatchingRow({ title, items, type = 'continue' }) {
    const rowRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (rowRef.current) {
            observer.observe(rowRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const checkArrows = () => {
            if (rowRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
                setShowLeftArrow(scrollLeft > 50);
                setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 50);
            }
        };

        checkArrows();
        const ref = rowRef.current;
        ref?.addEventListener('scroll', checkArrows);
        window.addEventListener('resize', checkArrows);

        return () => {
            ref?.removeEventListener('scroll', checkArrows);
            window.removeEventListener('resize', checkArrows);
        };
    }, [items]);

    const scroll = (direction) => {
        if (rowRef.current) {
            const scrollAmount = rowRef.current.clientWidth * 0.8;
            rowRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className={`cw-row ${isVisible ? 'cw-row--visible' : ''}`}>
            <div className="container">
                <h2 className="cw-row__title">{title}</h2>
            </div>

            <div className="cw-row__wrapper">
                <button
                    className={`cw-row__arrow cw-row__arrow--left ${showLeftArrow ? 'cw-row__arrow--visible' : ''}`}
                    onClick={() => scroll('left')}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div className="cw-row__posters" ref={rowRef}>
                    <div className="cw-row__spacer" />
                    {items.map((item, index) => (
                        <ContinueWatchingCard
                            key={`${item.id}-${index}`}
                            item={item}
                            type={type}
                        />
                    ))}
                    <div className="cw-row__spacer" />
                </div>

                <button
                    className={`cw-row__arrow cw-row__arrow--right ${showRightArrow ? 'cw-row__arrow--visible' : ''}`}
                    onClick={() => scroll('right')}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ContinueWatchingRow;
