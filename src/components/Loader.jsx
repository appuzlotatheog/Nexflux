import './Loader.css';

function Loader({ fullPage = false }) {
    return (
        <div className={`loader ${fullPage ? 'loader--full' : ''}`}>
            <div className="loader__container">
                {/* Simple spinning ring loader */}
                <div className="loader__ring">
                    <div className="loader__ring-inner"></div>
                </div>

                {/* Text for full page */}
                {fullPage && (
                    <p className="loader__text">Loading</p>
                )}
            </div>
        </div>
    );
}

export default Loader;
