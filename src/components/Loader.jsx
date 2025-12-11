import './Loader.css';

function Loader({ fullPage = false }) {
    return (
        <div className={`loader ${fullPage ? 'loader--full' : ''}`}>
            <div className="loader__container">
                {/* Premium animated logo loader */}
                <div className="loader__logo">
                    <span className="loader__letter" style={{ '--i': 0 }}>N</span>
                    <span className="loader__letter" style={{ '--i': 1 }}>E</span>
                    <span className="loader__letter" style={{ '--i': 2 }}>X</span>
                    <span className="loader__letter" style={{ '--i': 3 }}>F</span>
                    <span className="loader__letter" style={{ '--i': 4 }}>L</span>
                    <span className="loader__letter" style={{ '--i': 5 }}>U</span>
                    <span className="loader__letter" style={{ '--i': 6 }}>X</span>
                </div>

                {/* Animated progress bar */}
                <div className="loader__bar">
                    <div className="loader__bar-fill"></div>
                </div>

                {/* Pulsing dots */}
                <div className="loader__dots">
                    <span className="loader__dot"></span>
                    <span className="loader__dot"></span>
                    <span className="loader__dot"></span>
                </div>
            </div>
        </div>
    );
}

export default Loader;
