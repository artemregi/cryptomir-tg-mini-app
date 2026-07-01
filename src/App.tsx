import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import BottomNav from './components/BottomNav'
import LoadingScreen from './components/LoadingScreen'
import Home from './pages/Home'
import Send from './pages/Send'
import Receive from './pages/Receive'
import History from './pages/History'
import { initializeProfile } from './api/endpoints'

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const location = useLocation()

  // Determine if we're on a sub-page (not home)
  const isSubPage = location.pathname !== '/'

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize Telegram WebApp
        window.Telegram?.WebApp?.ready()
        window.Telegram?.WebApp?.expand()

        // Set color scheme
        document.documentElement.style.setProperty('--tg-color-scheme', 'dark')

        // Initialize user profile
        const response = await initializeProfile()
        if (response.success && response.data) {
          // Cache profile and address data
          queryClient.setQueryData(['profile'], response.data.user)
          if (response.data.tron_address || response.data.wallet_address) {
            queryClient.setQueryData(
              ['tron_address'],
              response.data.tron_address || response.data.wallet_address
            )
          }
        }
      } catch (err) {
        console.error('Failed to initialize:', err)
        // Non-fatal: continue even if initialize fails
        // User might still be able to use the app with cached data
      } finally {
        // Slight delay for smooth UX
        setTimeout(() => setIsInitializing(false), 600)
      }
    }

    initialize()
  }, [queryClient])

  if (isInitializing) {
    return <LoadingScreen />
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: '#0A0B0E',
        maxWidth: '430px',
        margin: '0 auto',
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/history" element={<History />} />
      </Routes>

      <BottomNav />
    </div>
  )
}

export default App
