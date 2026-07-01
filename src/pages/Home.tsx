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

  const comingSoonTokens = [
    { symbol: 'TON', name: 'Toncoin', color: '#0098EA' },
    { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  ]

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#E4F3FB' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79,142,196,0.08) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #4F8EC4 0%, #4DB4EA 100%)',
                boxShadow: '0 2px 14px rgba(79,142,196,0.35)',
              }}
            >
              {avatarLetter}
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#6B8FAA', fontWeight: 500 }}>Привет,</p>
              <p style={{ fontSize: '15px', color: '#183650', fontWeight: 700, lineHeight: 1.1 }}>{firstName}!</p>
            </div>
          </div>

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4F8EC4 0%, #4DB4EA 100%)',
              boxShadow: '0 2px 10px rgba(79,142,196,0.28)',
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
      <div className="mt-3 animate-slide-up">
        <BalanceCard />
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2.5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          {
            label: 'Пополнить',
            path: '/receive',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3V15M12 15L8 11M12 15L16 11" stroke="#4DB4EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 19H21" stroke="#4DB4EA" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ),
            iconBg: 'rgba(77,180,234,0.1)',
            labelColor: '#4DB4EA',
          },
          {
            label: 'Отправить',
            path: '/send',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="#4F8EC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            iconBg: 'rgba(79,142,196,0.1)',
            labelColor: '#4F8EC4',
          },
          {
            label: 'История',
            path: '/history',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#6B8FAA" strokeWidth="2"/>
                <polyline points="12 6 12 12 16 14" stroke="#6B8FAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            iconBg: 'rgba(107,143,170,0.08)',
            labelColor: '#6B8FAA',
          },
        ].map(({ label, path, icon, iconBg, labelColor }) => (
          <button
            key={path}
            onClick={() => handleAction(path)}
            className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl active:scale-95 transition-transform"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(24,54,80,0.07), 0 1px 3px rgba(24,54,80,0.04)',
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: iconBg }}
            >
              {icon}
            </div>
            <span className="text-xs font-semibold" style={{ color: labelColor }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Token List */}
      <div className="mx-4 mt-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#183650' }}>Активы</h2>
          <span style={{ fontSize: '10px', color: '#8AA5BA', fontWeight: 500 }}>TRC-20</span>
        </div>

        <div className="space-y-2">
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
              {tokens?.filter((t) => t.isActive).map((token) => (
                <div
                  key={token.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 1px 8px rgba(24,54,80,0.07)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #26A17B 0%, #1A7A56 100%)',
                      boxShadow: '0 2px 8px rgba(38,161,123,0.25)',
                    }}
                  >
                    {token.icon ? (
                      <img
                        src={token.icon}
                        alt={token.symbol}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      token.symbol === 'USDT' ? '$' : token.symbol.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#183650' }}>{token.symbol}</span>
                      <span style={{ background: 'rgba(0,184,148,0.12)', color: '#00A87A', borderRadius: '7px', padding: '1px 7px', fontSize: '10px', fontWeight: 600 }}>
                        Активен
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B8FAA' }}>{token.name}</span>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#183650', fontVariantNumeric: 'tabular-nums' }}>{(token.balance ?? 0).toFixed(2)}</div>
                    <div style={{ fontSize: '10px', color: '#90ABBD' }}>${(token.price ?? 0).toFixed(2)}</div>
                  </div>
                </div>
              ))}

              {(!tokens || tokens.filter((t) => t.isActive).length === 0) && (
                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{ background: '#FFFFFF', boxShadow: '0 1px 8px rgba(24,54,80,0.07)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #26A17B 0%, #1A7A56 100%)', boxShadow: '0 2px 8px rgba(38,161,123,0.25)' }}
                  >
                    $
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#183650' }}>USDT</span>
                      <span style={{ background: 'rgba(0,184,148,0.12)', color: '#00A87A', borderRadius: '7px', padding: '1px 7px', fontSize: '10px', fontWeight: 600 }}>
                        Активен
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B8FAA' }}>Tether USD · TRC-20</span>
                  </div>
                </div>
              )}
            </>
          )}

          {comingSoonTokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 8px rgba(24,54,80,0.04)', opacity: 0.45 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${token.color}18` }}
              >
                <span style={{ color: token.color, fontWeight: 700, fontSize: '13px' }}>{token.symbol.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B8FAA' }}>{token.symbol}</span>
                  <span style={{ background: 'rgba(107,143,170,0.1)', color: '#8AA5BA', borderRadius: '7px', padding: '1px 7px', fontSize: '10px', fontWeight: 600 }}>
                    Скоро
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#90ABBD' }}>{token.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="mx-4 mt-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#183650' }}>Последние операции</h2>
            <button onClick={() => handleAction('/history')} style={{ fontSize: '12px', color: '#4F8EC4', fontWeight: 600 }}>
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
                  style={{ background: '#FFFFFF', boxShadow: '0 1px 6px rgba(24,54,80,0.06)' }}
                  onClick={() => handleAction('/history')}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}12` }}
                  >
                    {isSend ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"/>
                        <polyline points="7 7 17 7 17 17"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="17" y1="7" x2="7" y2="17"/>
                        <polyline points="17 17 7 17 7 7"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ fontSize: '12px', color: '#183650', fontWeight: 600 }}>
                      {isSend ? 'Отправлено' : 'Получено'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: '12px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmountWithSign(tx.amount, tx.type)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#90ABBD' }}>
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
