import React from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceCard from '../components/BalanceCard'
import { useProfile } from '../hooks/useProfile'
import { useTokens } from '../hooks/useTokens'
import { useTransactions } from '../hooks/useTransactions'
import { formatAmountWithSign, formatDateShort } from '../utils/format'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: tokens, isLoading: tokensLoading } = useTokens()
  const { data: transactionsData, isLoading: txLoading } = useTransactions()

  const recentTransactions = transactionsData?.items?.slice(0, 3) || []

  const firstName =
    profile?.first_name ||
    window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name ||
    'пользователь'

  const avatarLetter = firstName.charAt(0).toUpperCase()

  const handleAction = (path: string) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    navigate(path)
  }

  const assetCards = [
    {
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'TRC-20',
      gradient: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
      active: true,
    },
    {
      symbol: 'TON',
      name: 'Toncoin',
      network: 'TON',
      gradient: 'linear-gradient(135deg, #0085CC 0%, #00AAEE 100%)',
      active: false,
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'BTC',
      gradient: 'linear-gradient(135deg, #F7931A 0%, #E8780A 100%)',
      active: false,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'ERC-20',
      gradient: 'linear-gradient(135deg, #627EEA 0%, #8A9FF0 100%)',
      active: false,
    },
  ]

  const actionButtons = [
    {
      label: 'Пополнить',
      path: '/receive',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3V15M12 15L8 11M12 15L16 11"/>
          <path d="M3 19H21"/>
        </svg>
      ),
    },
    {
      label: 'Отправить',
      path: '/send',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
        </svg>
      ),
    },
    {
      label: 'История',
      path: '/history',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: 'Получить',
      path: '/receive',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
                color: '#1D4ED8',
              }}
            >
              {avatarLetter}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>Привет,</p>
              <p style={{ fontSize: '16px', color: '#111827', fontWeight: 700, lineHeight: 1.1 }}>{firstName}!</p>
            </div>
          </div>

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
              boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
              <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mt-1 animate-slide-up">
        <BalanceCard />
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div
          className="rounded-2xl p-4"
          style={{ background: '#FFFFFF', border: '1px solid #F3F4F6' }}
        >
          <div className="grid grid-cols-4 gap-1">
            {actionButtons.map(({ label, path, icon }) => (
              <button
                key={label}
                onClick={() => handleAction(path)}
                className="flex flex-col items-center gap-2 py-2 rounded-xl active:scale-95 transition-transform"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: '#EFF6FF' }}
                >
                  {icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#374151' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Cards — horizontal scroll */}
      <div className="mt-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Активы</h2>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {assetCards.map((card) => (
            <div
              key={card.symbol}
              className="flex-shrink-0 flex flex-col justify-between p-3.5 rounded-2xl"
              style={{
                width: 118,
                height: 80,
                background: card.gradient,
                opacity: card.active ? 1 : 0.5,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circle */}
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                }}
              />
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{card.symbol}</span>
                {!card.active && (
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '5px' }}>
                    Скоро
                  </span>
                )}
                {card.active && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{card.name}</p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{card.network}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mx-4 mt-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Последние операции</h2>
          {recentTransactions.length > 0 && (
            <button onClick={() => handleAction('/history')} style={{ fontSize: '13px', color: '#2563EB', fontWeight: 600 }}>
              Все
            </button>
          )}
        </div>

        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isSend = tx.type === 'send'
              const color = isSend ? '#DC2626' : '#059669'
              const bg = isSend ? '#FEF2F2' : '#ECFDF5'
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3.5 rounded-2xl active:opacity-70 transition-opacity cursor-pointer"
                  style={{ background: '#FFFFFF', border: '1px solid #F3F4F6' }}
                  onClick={() => handleAction('/history')}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 44, height: 44, borderRadius: 14, background: bg }}
                  >
                    {isSend ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"/>
                        <polyline points="7 7 17 7 17 17"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="17" y1="7" x2="7" y2="17"/>
                        <polyline points="17 17 7 17 7 7"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                      {isSend ? 'Отправлено' : 'Получено'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: '14px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmountWithSign(tx.amount, tx.type)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      {formatDateShort(tx.date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #F3F4F6' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: '#F3F4F6' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Нет операций</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default Home
