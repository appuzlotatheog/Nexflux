import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getPopularMovies, getImageUrl } from '../api/tmdb';
import './GridMotion.css';

const GridMotion = ({ gradientColor = 'black' }) => {
    const gridRef = useRef(null);
    const rowRefs = useRef([]);
    const mouseXRef = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const [items, setItems] = useState([]);

    // Fetch popular movies for posters
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const data = await getPopularMovies(1);
                if (data?.results) {
                    const posters = data.results
                        .filter(movie => movie.poster_path)
                        .slice(0, 28)
                        .map(movie => getImageUrl(movie.poster_path, 'w342'));
                    setItems(posters);
                }
            } catch (error) {
                console.error('Failed to fetch movies for grid:', error);
                // Fallback items
                setItems(Array.from({ length: 28 }, (_, i) => `Movie ${i + 1}`));
            }
        };
        fetchMovies();
    }, []);

    const totalItems = 28;
    const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
    const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

    useEffect(() => {
        if (items.length === 0) return;

        gsap.ticker.lagSmoothing(0);

        const handleMouseMove = e => {
            mouseXRef.current = e.clientX;
        };

        const updateMotion = () => {
            const maxMoveAmount = 300;
            const baseDuration = 0.8;
            const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

            rowRefs.current.forEach((row, index) => {
                if (row) {
                    const direction = index % 2 === 0 ? 1 : -1;
                    const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

                    gsap.to(row, {
                        x: moveAmount,
                        duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                }
            });
        };

        gsap.ticker.add(updateMotion);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            gsap.ticker.remove(updateMotion);
        };
    }, [items]);

    if (items.length === 0) {
        return (
            <div className="grid-motion-loading">
                <div className="grid-motion-skeleton"></div>
            </div>
        );
    }

    return (
        <div className="noscroll loading" ref={gridRef}>
            <section
                className="intro"
                style={{
                    background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
                }}
            >
                <div className="gridMotion-container">
                    {[...Array(4)].map((_, rowIndex) => (
                        <div key={rowIndex} className="row" ref={el => (rowRefs.current[rowIndex] = el)}>
                            {[...Array(7)].map((_, itemIndex) => {
                                const content = combinedItems[rowIndex * 7 + itemIndex];
                                return (
                                    <div key={itemIndex} className="row__item">
                                        <div className="row__item-inner" style={{ backgroundColor: '#111' }}>
                                            {typeof content === 'string' && content.startsWith('http') ? (
                                                <div
                                                    className="row__item-img"
                                                    style={{
                                                        backgroundImage: `url(${content})`
                                                    }}
                                                ></div>
                                            ) : (
                                                <div className="row__item-content">{content}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="fullview"></div>
            </section>
        </div>
    );
};

export default GridMotion;
