import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import LoadingScreen from './components/LoadingScreen'
import Home from './pages/Home'
import Send from './pages/Send'
import Receive from './pages/Receive'
import History from './pages/History'
import Profile from './pages/Profile'
import KYC from './pages/KYC'
import Card from './pages/Card'
import Exchange from './pages/Exchange'
import Auth from './pages/Auth'
import { LanguageProvider } from './contexts/LanguageContext'
import { tokenStorage } from './api/client'
import { tgAuth } from './api/endpoints'

const AUTH_ROUTES = ['/auth']

const AppInner: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)

  useEffect(() => {
    window.Telegram?.WebApp?.ready()
    window.Telegram?.WebApp?.expand()

    const init = async () => {
      if (!tokenStorage.hasTokens()) {
        const initData = window.Telegram?.WebApp?.initData
        if (initData) {
          try {
            const tokens = await tgAuth(initData)
            tokenStorage.set(tokens.access_token, tokens.refresh_token)
            // stay on current route (will redirect to / below)
          } catch {
            navigate('/auth', { replace: true })
          }
        } else {
          navigate('/auth', { replace: true })
        }
      }
      setTimeout(() => setIsInitializing(false), 300)
    }

    init()
  }, [navigate])

  if (isInitializing) {
    return <LoadingScreen />
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: '#F0F4FA',
        maxWidth: '430px',
        margin: '0 auto',
      }}
    >
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/card" element={<Card />} />
        <Route path="/exchange" element={<Exchange />} />
      </Routes>

      {!isAuthRoute && <BottomNav />}
    </div>
  )
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}

export default App
