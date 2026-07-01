import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
      fill={active ? '#4F8EC4' : 'none'}
      stroke={active ? '#4F8EC4' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SendIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13"
      stroke={active ? '#4F8EC4' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      fill={active ? 'rgba(79,142,196,0.2)' : 'none'}
      stroke={active ? '#4F8EC4' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ReceiveIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2V16M12 16L7 11M12 16L17 11"
      stroke={active ? '#4DB4EA' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 20H22"
      stroke={active ? '#4DB4EA' : '#6B8FAA'}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const HistoryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill={active ? 'rgba(79,142,196,0.15)' : 'none'}
      stroke={active ? '#4F8EC4' : '#6B8FAA'}
      strokeWidth="2"
    />
    <polyline
      points="12 6 12 12 16 14"
      stroke={active ? '#4F8EC4' : '#6B8FAA'}
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
      style={{
        background: 'rgba(242, 249, 254, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #BDDCF2',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-all duration-200"
              style={{
                color: isActive ? (path === '/receive' ? '#4DB4EA' : '#4F8EC4') : '#6B8FAA',
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full"
                  style={{
                    background: path === '/receive' ? '#4DB4EA' : '#4F8EC4',
                  }}
                />
              )}

              <Icon active={isActive} />

              <span
                className="text-xs font-medium transition-all duration-200"
                style={{
                  color: isActive ? (path === '/receive' ? '#4DB4EA' : '#4F8EC4') : '#6B8FAA',
                  fontSize: '10px',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
