import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendMessage, getQuickSuggestions, extractCinemaMarkers } from '../api/gemini';
import { searchMulti, getImageUrl } from '../api/tmdb';
import './ChatBot.css';

function ChatBot() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hey! 🎬 I'm your cinema companion. Ask for recommendations, discover hidden gems, or explore what to watch tonight!",
            cinemaCards: []
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const isWatchPage = location.pathname.startsWith('/watch');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const searchCinema = async (title) => {
        try {
            const results = await searchMulti(title);
            if (results.results && results.results.length > 0) {
                const match = results.results.find(r =>
                    r.media_type === 'movie' || r.media_type === 'tv'
                ) || results.results[0];

                if (match && (match.media_type === 'movie' || match.media_type === 'tv')) {
                    return {
                        id: match.id,
                        title: match.title || match.name,
                        type: match.media_type,
                        year: (match.release_date || match.first_air_date)?.split('-')[0] || '',
                        poster: match.poster_path ? getImageUrl(match.poster_path, 'w185') : null,
                        backdrop: match.backdrop_path ? getImageUrl(match.backdrop_path, 'w780') : null,
                        rating: match.vote_average?.toFixed(1),
                        overview: match.overview?.slice(0, 100) + '...'
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error searching cinema:', error);
            return null;
        }
    };

    const processResponse = async (responseText) => {
        const { titles, cleanText } = extractCinemaMarkers(responseText);

        if (titles.length === 0) {
            return { content: responseText, cinemaCards: [] };
        }

        setLoadingCards(true);
        const cardPromises = titles.map(title => searchCinema(title));
        const cards = await Promise.all(cardPromises);
        const cinemaCards = cards.filter(card => card !== null).slice(0, 4);
        setLoadingCards(false);

        return { content: cleanText, cinemaCards };
    };

    const handleSend = async (messageText = input) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = { role: 'user', content: messageText.trim(), cinemaCards: [] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setShowSuggestions(false);
        setIsLoading(true);

        try {
            const allMessages = [...messages, userMessage].map(m => ({
                role: m.role,
                content: m.content
            }));
            const response = await sendMessage(allMessages);
            const { content, cinemaCards } = await processResponse(response);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content,
                cinemaCards
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Oops! 🎬 Something went wrong. Try again?",
                cinemaCards: []
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

    const handleCardClick = (card) => {
        setIsOpen(false);
        navigate(`/details/${card.type}/${card.id}`);
    };

    const handlePlayClick = (e, card) => {
        e.stopPropagation();
        setIsOpen(false);
        navigate(`/watch/${card.type}/${card.id}`);
    };

    const formatMessage = (content) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
    };

    const suggestions = getQuickSuggestions();

    return (
        <>
            {/* Floating Trigger Button */}
            {!isWatchPage && (
                <button
                    className={`cinebot-fab ${isOpen ? 'cinebot-fab--hidden' : ''}`}
                    onClick={() => setIsOpen(true)}
                    aria-label="Open CineBot"
                >
                    <div className="cinebot-fab__glow" />
                    <div className="cinebot-fab__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                    </div>
                    <span className="cinebot-fab__label">AI</span>
                    <div className="cinebot-fab__ring" />
                </button>
            )}

            {/* Chat Panel */}
            <div className={`cinebot ${isOpen ? 'cinebot--open' : ''} ${isMinimized ? 'cinebot--minimized' : ''}`}>
                {/* Decorative Elements */}
                <div className="cinebot__orb cinebot__orb--1" />
                <div className="cinebot__orb cinebot__orb--2" />

                {/* Header */}
                <div className="cinebot__header">
                    <div className="cinebot__brand">
                        <div className="cinebot__logo">
                            <div className="cinebot__logo-icon">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGrad)" />
                                    <defs>
                                        <linearGradient id="starGrad" x1="2" y1="2" x2="22" y2="22">
                                            <stop stopColor="#ffd700" />
                                            <stop offset="1" stopColor="#ff8c00" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="cinebot__logo-ring" />
                        </div>
                        <div className="cinebot__title">
                            <h3>CineBot</h3>
                            <div className="cinebot__subtitle">
                                <span className="cinebot__dot" />
                                <span>AI Cinema Expert</span>
                            </div>
                        </div>
                    </div>
                    <div className="cinebot__actions">
                        <button
                            className="cinebot__action"
                            onClick={() => setIsMinimized(!isMinimized)}
                            aria-label={isMinimized ? "Expand" : "Minimize"}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isMinimized ? (
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                ) : (
                                    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                                )}
                            </svg>
                        </button>
                        <button
                            className="cinebot__action cinebot__action--close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="cinebot__body">
                    <div className="cinebot__messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`cinebot__msg ${msg.role === 'user' ? 'cinebot__msg--user' : 'cinebot__msg--bot'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="cinebot__msg-avatar">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" fill="url(#avatarGrad)" />
                                            <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                            <defs>
                                                <linearGradient id="avatarGrad" x1="2" y1="2" x2="22" y2="22">
                                                    <stop stopColor="#8b5cf6" />
                                                    <stop offset="1" stopColor="#d946ef" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                )}
                                <div className="cinebot__msg-content">
                                    <div
                                        className="cinebot__bubble"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                    />

                                    {/* Cinema Cards Grid */}
                                    {msg.cinemaCards && msg.cinemaCards.length > 0 && (
                                        <div className="cinebot__cards">
                                            {msg.cinemaCards.map((card, cardIndex) => (
                                                <div
                                                    key={cardIndex}
                                                    className="cinebot__card"
                                                    onClick={() => handleCardClick(card)}
                                                    style={{
                                                        backgroundImage: card.backdrop
                                                            ? `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.95) 100%), url(${card.backdrop})`
                                                            : undefined
                                                    }}
                                                >
                                                    <div className="cinebot__card-content">
                                                        {card.poster && (
                                                            <img
                                                                src={card.poster}
                                                                alt={card.title}
                                                                className="cinebot__card-poster"
                                                            />
                                                        )}
                                                        <div className="cinebot__card-info">
                                                            <span className="cinebot__card-type">
                                                                {card.type === 'movie' ? '🎬 Movie' : '📺 Series'}
                                                            </span>
                                                            <h4 className="cinebot__card-title">{card.title}</h4>
                                                            <div className="cinebot__card-meta">
                                                                {card.year && <span>{card.year}</span>}
                                                                {card.rating && <span>⭐ {card.rating}</span>}
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="cinebot__card-play"
                                                            onClick={(e) => handlePlayClick(e, card)}
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="cinebot__msg cinebot__msg--bot">
                                <div className="cinebot__msg-avatar">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" fill="url(#avatarGrad)" />
                                    </svg>
                                </div>
                                <div className="cinebot__typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}

                        {loadingCards && (
                            <div className="cinebot__loading-cards">
                                <div className="cinebot__loading-shimmer" />
                                <span>Finding recommendations...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && messages.length === 1 && (
                    <div className="cinebot__suggestions">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="cinebot__chip"
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="cinebot__chip-icon">✨</span>
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="cinebot__footer">
                    <div className="cinebot__input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            className="cinebot__input"
                            placeholder="Ask me anything about movies..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            className="cinebot__send"
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </div>
                    <p className="cinebot__hint">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                        Powered by AI • Click cards to view details
                    </p>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && <div className="cinebot__backdrop" onClick={() => setIsOpen(false)} />}
        </>
    );
}

export default ChatBot;
