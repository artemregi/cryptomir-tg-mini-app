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
      className="mx-4 rounded-2xl"
      style={{
        background: '#FFFFFF',
        borderRadius: 18,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>Баланс</span>
          <button onClick={handleToggleVisibility} className="p-1 active:opacity-60 transition-opacity">
            {isBalanceHidden ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            )}
          </button>
        </div>

        {/* Balance amount */}
        {isLoading ? (
          <div className="space-y-2 mt-2">
            <div
              className="h-10 w-44 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              className="h-4 w-28 rounded"
              style={{
                background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ) : (
          <>
            <div style={{ fontSize: 38, fontWeight: 700, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {isBalanceHidden ? '••••••' : formatNumber(usdtAmount, 2)}{' '}
              <span style={{ fontSize: 22, color: '#9CA3AF', fontWeight: 400 }}>USDT</span>
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>
              {isBalanceHidden ? '≈ $•••••' : `≈ $${formatNumber(usdtAmount, 2)}`}
            </div>
          </>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: '1px solid #F3F4F6' }}
        >
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>TRON · TRC-20</span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px rgba(16,185,129,0.5)' }} />
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>Активен</span>
          </div>
        </div>
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
