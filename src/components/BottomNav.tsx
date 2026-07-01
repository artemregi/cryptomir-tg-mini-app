import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
      fill={active ? '#2563EB' : 'none'}
      stroke={active ? '#2563EB' : '#9CA3AF'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fillOpacity={active ? 0.15 : 0}
    />
  </svg>
)

const SendIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
      fill="none"
      stroke={active ? '#2563EB' : '#9CA3AF'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ReceiveIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2V16M12 16L7 11M12 16L17 11"
      stroke={active ? '#2563EB' : '#9CA3AF'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 20H22"
      stroke={active ? '#2563EB' : '#9CA3AF'}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

const HistoryIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke={active ? '#2563EB' : '#9CA3AF'}
      strokeWidth="1.75"
    />
    <polyline
      points="12 6 12 12 16 14"
      stroke={active ? '#2563EB' : '#9CA3AF'}
      strokeWidth="1.75"
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
        background: '#FFFFFF',
        borderTop: '1px solid #F3F4F6',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center px-2 pt-2 pb-2">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all duration-200 active:scale-95"
            >
              <Icon active={isActive} />
              <span
                className="font-medium transition-all duration-200"
                style={{
                  color: isActive ? '#2563EB' : '#9CA3AF',
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 500,
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
