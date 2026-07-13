import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import LoadingScreen from './components/LoadingScreen'
import Home from './pages/Home'
import Send from './pages/Send'
import Receive from './pages/Receive'
import History from './pages/History'
import Profile from './pages/Profile'
import KYC from './pages/KYC'
import Card from './pages/Card'
import QR from './pages/QR'
import Auth from './pages/Auth'
import { LanguageProvider } from './contexts/LanguageContext'

const AppInner: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true)
  const location = useLocation()

  const isAuthRoute = false

  useEffect(() => {
    window.Telegram?.WebApp?.ready()
    window.Telegram?.WebApp?.expand()

    // DEMO MODE: skip auth, go straight to app
    setTimeout(() => setIsInitializing(false), 300)
  }, [])

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
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/card" element={<Card />} />
        <Route path="/qr" element={<QR />} />
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
