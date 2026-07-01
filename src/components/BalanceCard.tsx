import React, { useState } from 'react'
import { useBalance } from '../hooks/useBalance'
import { formatNumber } from '../utils/format'

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
  const usdtAmount = usdtBalance?.amount ?? 0

  return (
    <div
      className="relative mx-4 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F4F9FD 100%)',
        boxShadow: '0 4px 28px rgba(79,142,196,0.14), 0 1px 6px rgba(24,54,80,0.06)',
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(77,180,234,0.15) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,196,0.1) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#00B894', boxShadow: '0 0 5px #00B894' }}
            />
            <span style={{ fontSize: '10px', color: '#6B8FAA', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Баланс
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleVisibility} className="p-1 active:opacity-60 transition-opacity">
              {isBalanceHidden ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#90ABBD" strokeWidth="2" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#90ABBD" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
            <button onClick={handleRefresh} className="p-1 active:opacity-60 transition-opacity">
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#90ABBD" strokeWidth="2"
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
              className="h-10 w-44 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(24,54,80,0.05) 25%, rgba(24,54,80,0.09) 50%, rgba(24,54,80,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              className="h-4 w-28 rounded"
              style={{
                background: 'linear-gradient(90deg, rgba(24,54,80,0.04) 25%, rgba(24,54,80,0.07) 50%, rgba(24,54,80,0.04) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ) : (
          <>
            {/* Main: USDT amount */}
            <div className="mb-1 flex items-baseline gap-2">
              <span
                style={{
                  fontSize: '38px',
                  fontWeight: 700,
                  color: '#183650',
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {isBalanceHidden ? '••••••' : formatNumber(usdtAmount, 2)}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#4F8EC4' }}>USDT</span>
            </div>

            {/* Sub: USD equivalent */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '13px', color: '#90ABBD' }}>
                {isBalanceHidden ? '≈ $•••••' : `≈ $${formatNumber(usdtAmount, 2)}`}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  background: 'rgba(0,184,148,0.12)',
                  color: '#00A87A',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontWeight: 600,
                }}
              >
                TRC-20
              </span>
            </div>
          </>
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
