import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import './admin-premium.css'
import './admin-operations.css'
import './admin-appearance.css'
import './admin-profile.css'
import './styles/adminFarms.css'
import './styles/adminUsersCompact.css'
import './styles/public.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {})

    if (window.caches) {
      window.caches.keys()
        .then((keys) => Promise.all(keys.map((key) => window.caches.delete(key))))
        .catch(() => {})
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
