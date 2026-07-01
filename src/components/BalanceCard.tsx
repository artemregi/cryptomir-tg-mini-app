import React, { useState } from 'react'
import { useBalance } from '../hooks/useBalance'
import { formatRUB, formatUSDT, formatNumber } from '../utils/format'

interface BalanceCardProps {
  onRefresh?: () => void
}

const BalanceCard: React.FC<BalanceCardProps> = ({ onRefresh }) => {
  const { data: balance, isLoading, refetch } = useBalance()
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)

  const handleToggleVisibility = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
    setIsBalanceHidden((prev) => !prev)
  }

  const handleRefresh = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
    refetch()
    onRefresh?.()
  }

  const usdtBalance = balance?.balances?.find(
    (b) => b.currency === 'USDT' || b.symbol === 'USDT'
  )

  return (
    <div
      className="relative mx-4 rounded-2xl overflow-hidden"
      style={{
        minHeight: '160px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F4F9FD 100%)',
        boxShadow: '0 4px 28px rgba(79,142,196,0.14), 0 1px 6px rgba(24,54,80,0.06)',
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(77,180,234,0.18) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,196,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#00B894', boxShadow: '0 0 6px #00B894' }}
            />
            <span className="text-text-secondary text-xs font-medium tracking-wider uppercase">
              Основной баланс
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleVisibility}
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
            >
              {isBalanceHidden ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={isLoading ? 'animate-spin' : ''}
              >
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Balance amount */}
        {isLoading ? (
          <div className="space-y-2">
            <div
              className="h-10 w-48 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(24,54,80,0.05) 25%, rgba(24,54,80,0.1) 50%, rgba(24,54,80,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              className="h-5 w-32 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(24,54,80,0.05) 25%, rgba(24,54,80,0.1) 50%, rgba(24,54,80,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ) : (
          <>
            <div className="mb-1">
              <span
                className="text-4xl font-bold text-text-primary tracking-tight"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {isBalanceHidden
                  ? '₽ •••••'
                  : `₽ ${formatNumber(balance?.total || 0, 2)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">
                {isBalanceHidden
                  ? '≈ ••••• USDT'
                  : `≈ ${formatNumber(usdtBalance?.amount || 0, 2)} USDT`}
              </span>
              {!isBalanceHidden && usdtBalance && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{
                    background: 'rgba(0, 184, 148, 0.15)',
                    color: '#00B894',
                  }}
                >
                  TRC-20
                </span>
              )}
            </div>
          </>
        )}

        {/* Token pills */}
        {!isLoading && balance?.balances && balance.balances.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {balance.balances.map((token) => (
              <div
                key={token.currency}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(79,142,196,0.08)',
                  border: '1px solid rgba(79,142,196,0.2)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span className="text-text-secondary text-xs">
                  {isBalanceHidden ? `•••` : `${formatNumber(token.amount, 2)}`}{' '}
                  <span className="text-text-primary">{token.symbol}</span>
                </span>
              </div>
            ))}
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

export default BalanceCard
