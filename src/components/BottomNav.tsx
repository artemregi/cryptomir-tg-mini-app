import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
      fill={active ? 'rgba(255,255,255,0.3)' : 'none'}
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SendIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13"
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      fill="none"
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ReceiveIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2V16M12 16L7 11M12 16L17 11"
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 20H22"
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const HistoryIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
    />
    <polyline
      points="12 6 12 12 16 14"
      stroke={active ? '#FFFFFF' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BottomNav: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/', label: 'Главная', Icon: HomeIcon },
    { path: '/send', label: 'Отправить', Icon: SendIcon },
    { path: '/receive', label: 'Получить', Icon: ReceiveIcon },
    { path: '/history', label: 'История', Icon: HistoryIcon },
  ]

  const handleNavigate = (path: string) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    navigate(path)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-3 pb-3">
        <div
          className="flex items-center rounded-2xl p-1.5"
          style={{
            background: 'rgba(242, 249, 254, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 -1px 0 rgba(189,220,242,0.5), 0 4px 24px rgba(24,54,80,0.10), 0 1px 6px rgba(24,54,80,0.06)',
          }}
        >
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? '#4F8EC4' : 'transparent',
                  boxShadow: isActive ? '0 2px 10px rgba(79,142,196,0.3)' : 'none',
                }}
              >
                <Icon active={isActive} />
                <span
                  className="font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? '#FFFFFF' : '#6B8FAA',
                    fontSize: '9px',
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default BottomNav
