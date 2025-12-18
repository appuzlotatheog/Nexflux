import { useRef, useState, useEffect } from 'react';
import ContentCard from './ContentCard';
import './ContentRow.css';

function ContentRow({ title, items, isLargeRow = false, showRanks = false }) {
    const rowRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
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

    const handleScroll = () => {
        if (!rowRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction) => {
        if (!rowRef.current) return;
        const scrollAmount = rowRef.current.clientWidth * 0.8;
        rowRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // Keyboard navigation handler
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            scroll('right');
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scroll('left');
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className={`content-row ${isVisible ? 'content-row--visible' : ''}`}>
            <h2 className="content-row__title container">{title}</h2>

            <div className="content-row__wrapper">
                <button
                    className={`content-row__arrow content-row__arrow--left ${showLeftArrow ? 'content-row__arrow--visible' : ''}`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                <div
                    className="content-row__posters"
                    ref={rowRef}
                    onScroll={handleScroll}
                >
                    <div className="content-row__spacer" />
                    {items.map((item, index) => (
                        <ContentCard
                            key={item.id}
                            item={item}
                            isLarge={isLargeRow}
                            rank={showRanks ? index + 1 : null}
                        />
                    ))}
                    <div className="content-row__spacer" />
                </div>

                <button
                    className={`content-row__arrow content-row__arrow--right ${showRightArrow ? 'content-row__arrow--visible' : ''}`}
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ContentRow;
