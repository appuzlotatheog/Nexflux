import { createContext, useContext, useState, useEffect } from 'react';

// Supported languages
export const LANGUAGES = {
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
    hi: { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
};

// Translation strings
const translations = {
    en: {
        // Navigation
        nav: {
            home: 'Home',
            movies: 'Movies',
            tvShows: 'TV Shows',
            myList: 'My List',
            search: 'Search',
            searchPlaceholder: 'Search movies, TV shows...'
        },
        // Hero
        hero: {
            playNow: 'Play Now',
            moreInfo: 'More Info',
            top10: 'TOP 10',
            paused: 'PAUSED'
        },
        // Details
        details: {
            overview: 'Overview',
            episodes: 'Episodes',
            cast: 'Cast',
            trailer: 'Trailer',
            moreLikeThis: 'More Like This',
            recommendations: 'Recommendations',
            addToList: 'Add to List',
            removeFromList: 'Remove from List',
            share: 'Share',
            copyLink: 'Copy Link',
            copied: 'Copied!'
        },
        // Content
        content: {
            trending: 'Trending Now',
            popular: 'Popular',
            topRated: 'Top Rated',
            newReleases: 'New Releases',
            continueWatching: 'Continue Watching',
            forYou: 'For You'
        },
        // Common
        common: {
            watchNow: 'Watch Now',
            loading: 'Loading...',
            noResults: 'No results found',
            error: 'Something went wrong',
            retry: 'Try Again',
            movie: 'Movie',
            series: 'Series',
            season: 'Season',
            episode: 'Episode'
        },
        // Footer
        footer: {
            about: 'About',
            contact: 'Contact',
            privacy: 'Privacy',
            terms: 'Terms'
        }
    },
    es: {
        nav: {
            home: 'Inicio',
            movies: 'Películas',
            tvShows: 'Series',
            myList: 'Mi Lista',
            search: 'Buscar',
            searchPlaceholder: 'Buscar películas, series...'
        },
        hero: {
            playNow: 'Reproducir',
            moreInfo: 'Más Info',
            top10: 'TOP 10',
            paused: 'PAUSADO'
        },
        details: {
            overview: 'Sinopsis',
            episodes: 'Episodios',
            cast: 'Reparto',
            trailer: 'Tráiler',
            moreLikeThis: 'Más Como Esto',
            recommendations: 'Recomendaciones',
            addToList: 'Agregar a Lista',
            removeFromList: 'Quitar de Lista',
            share: 'Compartir',
            copyLink: 'Copiar Enlace',
            copied: '¡Copiado!'
        },
        content: {
            trending: 'Tendencias',
            popular: 'Popular',
            topRated: 'Mejor Valoradas',
            newReleases: 'Nuevos Estrenos',
            continueWatching: 'Continuar Viendo',
            forYou: 'Para Ti'
        },
        common: {
            watchNow: 'Ver Ahora',
            loading: 'Cargando...',
            noResults: 'Sin resultados',
            error: 'Algo salió mal',
            retry: 'Reintentar',
            movie: 'Película',
            series: 'Serie',
            season: 'Temporada',
            episode: 'Episodio'
        },
        footer: {
            about: 'Acerca de',
            contact: 'Contacto',
            privacy: 'Privacidad',
            terms: 'Términos'
        }
    },
    fr: {
        nav: {
            home: 'Accueil',
            movies: 'Films',
            tvShows: 'Séries',
            myList: 'Ma Liste',
            search: 'Rechercher',
            searchPlaceholder: 'Rechercher films, séries...'
        },
        hero: {
            playNow: 'Lecture',
            moreInfo: 'Plus d\'Infos',
            top10: 'TOP 10',
            paused: 'EN PAUSE'
        },
        details: {
            overview: 'Synopsis',
            episodes: 'Épisodes',
            cast: 'Distribution',
            trailer: 'Bande-annonce',
            moreLikeThis: 'Titres Similaires',
            recommendations: 'Recommandations',
            addToList: 'Ajouter à la Liste',
            removeFromList: 'Retirer de la Liste',
            share: 'Partager',
            copyLink: 'Copier le Lien',
            copied: 'Copié!'
        },
        content: {
            trending: 'Tendances',
            popular: 'Populaire',
            topRated: 'Les Mieux Notés',
            newReleases: 'Nouveautés',
            continueWatching: 'Continuer à Regarder',
            forYou: 'Pour Vous'
        },
        common: {
            watchNow: 'Regarder',
            loading: 'Chargement...',
            noResults: 'Aucun résultat',
            error: 'Une erreur est survenue',
            retry: 'Réessayer',
            movie: 'Film',
            series: 'Série',
            season: 'Saison',
            episode: 'Épisode'
        },
        footer: {
            about: 'À Propos',
            contact: 'Contact',
            privacy: 'Confidentialité',
            terms: 'Conditions'
        }
    },
    hi: {
        nav: {
            home: 'होम',
            movies: 'फ़िल्में',
            tvShows: 'टीवी शो',
            myList: 'मेरी सूची',
            search: 'खोजें',
            searchPlaceholder: 'फ़िल्में, टीवी शो खोजें...'
        },
        hero: {
            playNow: 'अभी देखें',
            moreInfo: 'अधिक जानकारी',
            top10: 'टॉप 10',
            paused: 'रुका हुआ'
        },
        details: {
            overview: 'सारांश',
            episodes: 'एपिसोड',
            cast: 'कलाकार',
            trailer: 'ट्रेलर',
            moreLikeThis: 'इससे मिलते-जुलते',
            recommendations: 'सुझाव',
            addToList: 'सूची में जोड़ें',
            removeFromList: 'सूची से हटाएं',
            share: 'शेयर करें',
            copyLink: 'लिंक कॉपी करें',
            copied: 'कॉपी हो गया!'
        },
        content: {
            trending: 'ट्रेंडिंग',
            popular: 'लोकप्रिय',
            topRated: 'टॉप रेटेड',
            newReleases: 'नई रिलीज़',
            continueWatching: 'जारी रखें',
            forYou: 'आपके लिए'
        },
        common: {
            watchNow: 'अभी देखें',
            loading: 'लोड हो रहा है...',
            noResults: 'कोई परिणाम नहीं',
            error: 'कुछ गलत हो गया',
            retry: 'पुनः प्रयास करें',
            movie: 'फ़िल्म',
            series: 'सीरीज़',
            season: 'सीज़न',
            episode: 'एपिसोड'
        },
        footer: {
            about: 'हमारे बारे में',
            contact: 'संपर्क',
            privacy: 'गोपनीयता',
            terms: 'शर्तें'
        }
    }
};

// Create context
const LanguageContext = createContext();

// Storage key
const STORAGE_KEY = 'nexflux_language';

// Provider component
export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved && LANGUAGES[saved] ? saved : 'en';
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English
                value = translations.en;
                for (const k2 of keys) {
                    value = value?.[k2];
                }
                break;
            }
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
}

// Hook
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}

export default translations;
