import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { initializeProtection } from './utils/protection'
import { LanguageProvider } from './utils/i18n.jsx'
import { ToastProvider } from './components/Toast'

// Initialize source code protection (production only)
initializeProtection()

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </LanguageProvider>
        </BrowserRouter>
    </React.StrictMode>
)
