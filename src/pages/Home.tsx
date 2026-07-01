import React, { useEffect } from 'react'
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

  // Hardcoded upcoming tokens to show as "coming soon"
  const comingSoonTokens = [
    { symbol: 'TON', name: 'Toncoin', color: '#0098EA' },
    { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  ]

  return (
    <div
      className="min-h-screen pb-24 animate-fade-in"
      style={{ background: '#E4F3FB' }}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #4F8EC4 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 100%)',
                boxShadow: '0 0 16px rgba(79,142,196,0.3)',
              }}
            >
              {avatarLetter}
            </div>
            <div>
              <p className="text-text-secondary text-xs">Привет,</p>
              <p className="text-text-primary font-semibold text-base leading-tight">{firstName}!</p>
            </div>
          </div>

          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4F8EC4 0%, #4DB4EA 100%)',
              boxShadow: '0 0 12px rgba(79,142,196,0.25)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
              />
              <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mt-2 animate-slide-up">
        <BalanceCard />
      </div>

      {/* Action Buttons */}
      <div
        className="mx-4 mt-4 grid grid-cols-3 gap-3 animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        {[
          {
            label: 'Пополнить',
            path: '/receive',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V16M12 16L7 11M12 16L17 11" stroke="#4DB4EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 20H22" stroke="#4DB4EA" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ),
            gradient: 'linear-gradient(135deg, rgba(77,180,234,0.12) 0%, rgba(0,184,148,0.08) 100%)',
            border: 'rgba(77,180,234,0.3)',
            labelColor: '#4DB4EA',
          },
          {
            label: 'Отправить',
            path: '/send',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="#4F8EC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            gradient: 'linear-gradient(135deg, rgba(79,142,196,0.12) 0%, rgba(95,160,212,0.08) 100%)',
            border: 'rgba(79,142,196,0.3)',
            labelColor: '#4F8EC4',
          },
          {
            label: 'История',
            path: '/history',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#6B8FAA" strokeWidth="2"/>
                <polyline points="12 6 12 12 16 14" stroke="#6B8FAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            gradient: 'linear-gradient(135deg, rgba(107,143,170,0.1) 0%, rgba(144,171,189,0.08) 100%)',
            border: 'rgba(107,143,170,0.25)',
            labelColor: '#6B8FAA',
          },
        ].map(({ label, path, icon, gradient, border, labelColor }) => (
          <button
            key={path}
            onClick={() => handleAction(path)}
            className="flex flex-col items-center gap-2.5 p-3.5 rounded-2xl active:scale-95 transition-transform"
            style={{
              background: gradient,
              border: `1px solid ${border}`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            >
              {icon}
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: labelColor }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Token List */}
      <div
        className="mx-4 mt-5 animate-slide-up"
        style={{ animationDelay: '0.15s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary font-bold text-base">Активы</h2>
          <span className="text-text-secondary text-xs">TRC-20</span>
        </div>

        <div className="space-y-2">
          {/* USDT - Active */}
          {tokensLoading ? (
            <div
              className="h-16 rounded-xl"
              style={{
                background: 'linear-gradient(90deg, #DCEFF9 25%, #E4F3FB 50%, #DCEFF9 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          ) : (
            <>
              {/* Active tokens from API */}
              {tokens?.filter((t) => t.isActive).map((token) => (
                <div
                  key={token.id}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(79,142,196,0.2)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #26A17B 0%, #1A7A56 100%)',
                      boxShadow: '0 0 12px rgba(38,161,123,0.3)',
                    }}
                  >
                    {token.icon ? (
                      <img src={token.icon} alt={token.symbol} className="w-10 h-10 rounded-full" />
                    ) : (
                      token.symbol.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-primary font-semibold text-sm">{token.symbol}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: 'rgba(0,184,148,0.15)', color: '#00B894' }}
                      >
                        Активен
                      </span>
                    </div>
                    <span className="text-text-secondary text-xs">{token.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-text-primary font-bold text-sm">{(token.balance ?? 0).toFixed(2)}</div>
                    <div className="text-text-secondary text-xs">${(token.price ?? 0).toFixed(2)}</div>
                  </div>
                </div>
              ))}

              {/* If no active tokens from API, show USDT placeholder */}
              {(!tokens || tokens.filter((t) => t.isActive).length === 0) && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(79,142,196,0.2)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #26A17B 0%, #1A7A56 100%)' }}
                  >
                    $
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-primary font-semibold text-sm">USDT</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: 'rgba(0,184,148,0.15)', color: '#00B894' }}
                      >
                        Активен
                      </span>
                    </div>
                    <span className="text-text-secondary text-xs">Tether USD · TRC-20</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Coming soon tokens */}
          {comingSoonTokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-3 p-4 rounded-xl opacity-40"
              style={{
                background: '#FFFFFF',
                border: '1px solid #BDDCF2',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: `${token.color}30` }}
              >
                <span style={{ color: token.color }}>{token.symbol.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-secondary font-semibold text-sm">{token.symbol}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                    style={{
                      background: 'rgba(107,143,170,0.1)',
                      color: '#6B8FAA',
                    }}
                  >
                    Скоро
                  </span>
                </div>
                <span className="text-text-muted text-xs">{token.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div
          className="mx-4 mt-5 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-text-primary font-bold text-base">Последние операции</h2>
            <button
              onClick={() => handleAction('/history')}
              className="text-accent-purple text-xs font-medium"
            >
              Все
            </button>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isSend = tx.type === 'send'
              const color = isSend ? '#E17055' : '#00B894'
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl active:opacity-70 transition-opacity cursor-pointer"
                  style={{ background: '#FFFFFF', border: '1px solid #BDDCF2' }}
                  onClick={() => handleAction('/history')}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    {isSend ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"/>
                        <polyline points="5 12 12 5 19 12"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <polyline points="19 12 12 19 5 12"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary text-xs font-medium">
                      {isSend ? 'Отправлено' : 'Получено'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ color }}>
                      {formatAmountWithSign(tx.amount, tx.type)}
                    </div>
                    <div className="text-text-muted" style={{ fontSize: '10px' }}>
                      {formatDateShort(tx.date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
