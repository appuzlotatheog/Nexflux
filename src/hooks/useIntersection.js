import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for detecting when an element enters the viewport
 * Used for scroll-triggered animations
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Margin around root
 * @param {boolean} options.triggerOnce - Only trigger once
 * @returns {Array} [ref, isVisible] - Ref to attach and visibility state
 */
export function useIntersection({
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
} = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isVisible];
}

/**
 * Hook for keyboard navigation within a container
 * Handles left/right arrow keys to navigate between focusable items
 * 
 * @param {Object} options
 * @param {string} options.itemSelector - CSS selector for navigable items
 * @param {boolean} options.wrap - Wrap around at ends
 * @returns {Object} { containerRef, currentIndex, setCurrentIndex }
 */
export function useKeyboardNavigation({
    itemSelector = '[data-focusable]',
    wrap = true
} = {}) {
    const containerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleKeyDown = (e) => {
            const items = container.querySelectorAll(itemSelector);
            if (items.length === 0) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                setCurrentIndex(prev => {
                    const next = prev + 1;
                    if (next >= items.length) {
                        return wrap ? 0 : prev;
                    }
                    return next;
                });
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setCurrentIndex(prev => {
                    const next = prev - 1;
                    if (next < 0) {
                        return wrap ? items.length - 1 : 0;
                    }
                    return next;
                });
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (currentIndex >= 0 && items[currentIndex]) {
                    items[currentIndex].click();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [itemSelector, wrap, currentIndex]);

    // Focus the current item when index changes
    useEffect(() => {
        const container = containerRef.current;
        if (!container || currentIndex < 0) return;

        const items = container.querySelectorAll(itemSelector);
        if (items[currentIndex]) {
            items[currentIndex].focus();
        }
    }, [currentIndex, itemSelector]);

    return { containerRef, currentIndex, setCurrentIndex };
}

export default useIntersection;
