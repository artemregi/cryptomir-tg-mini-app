import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const BottomNav: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      path: '/',
      label: 'Главная',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#2563EB' : 'none'} stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"/>
        </svg>
      ),
    },
    {
      path: '/card',
      label: 'Карта',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      path: '/history',
      label: 'История',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Профиль',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
        </svg>
      ),
    },
  ]

  const handleNavigate = (path: string) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    navigate(path)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.98)',
        borderTop: '1px solid #F3F4F6',
        display: 'flex',
        alignItems: 'flex-start',
        padding: '10px 0',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map(({ path, label, icon }) => {
        const isActive = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => handleNavigate(path)}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            style={{ flex: 1 }}
          >
            {icon(isActive)}
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#2563EB' : '#9CA3AF',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
