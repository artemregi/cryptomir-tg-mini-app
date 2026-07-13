import React from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceCard from '../components/BalanceCard'
import { useProfile } from '../hooks/useProfile'
import { useAccounts } from '../hooks/useBalance'
import { useAllAssets } from '../hooks/useTokens'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts()
  const { data: assets = [], isLoading: assetsLoading } = useAllAssets()

  const tokensLoading = accountsLoading || assetsLoading

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    profile?.username ||
    window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name ||
    'пользователь'

  // Build asset+balance list
  const assetBalances = assets
    .filter(a => a.enabled)
    .map(asset => {
      const account = accounts.find(ac => ac.asset_id === asset.id && ac.type === 'user')
      return { ...asset, balance: account ? parseFloat(account.balance) || 0 : 0 }
    })

  const handleAction = (path: string) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    navigate(path)
  }

  const bannerCards = [
    { label: 'Как пополнить?', gradient: 'linear-gradient(135deg,#1D4ED8,#2563EB)', shadow: 'rgba(37,99,235,0.32)', path: '' },
    { label: 'Реферальная', gradient: 'linear-gradient(135deg,#6D28D9,#7C3AED)', shadow: 'rgba(109,40,217,0.32)', path: '' },
  ]

  const actionButtons = [
    {
      label: 'Пополнить',
      path: '/receive',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      label: 'Отправить',
      path: '/send',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round">
          <line x1="7" y1="17" x2="17" y2="7"/>
          <polyline points="7 7 17 7 17 17"/>
        </svg>
      ),
    },
    {
      label: 'История',
      path: '/history',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ]

  const comingSoonTokens: { symbol: string; name: string; gradient: string; shadow: string; icon: React.ReactNode }[] = []

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-70"
              style={{ background: 'linear-gradient(135deg,#BFDBFE,#93C5FD)' }}
              onClick={() => navigate('/profile')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: 13 }}>Привет,</div>
              <div style={{ color: '#111827', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{firstName}!</div>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Banner Cards */}
      <div className="flex gap-2.5 px-5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {bannerCards.map((card) => (
          <button
            key={card.label}
            onClick={() => card.path && handleAction(card.path)}
            className="flex-shrink-0 flex flex-col justify-end active:scale-95 transition-transform"
            style={{
              width: 118, height: 78, borderRadius: 16,
              background: card.gradient,
              padding: 10,
              boxShadow: `0 4px 14px ${card.shadow}`,
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600, lineHeight: 1.4, textAlign: 'left' }}>
              {card.label}
            </div>
          </button>
        ))}
      </div>

      {/* Balance Card */}
      <div className="mb-3 animate-slide-up">
        <BalanceCard />
      </div>

      {/* Action Buttons */}
      <div
        className="mx-5 mb-6 animate-slide-up"
        style={{ animationDelay: '0.05s', background: '#FFFFFF', borderRadius: 18, padding: '18px 10px', boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-around' }}
      >
        {actionButtons.map(({ label, path, icon }) => (
          <button
            key={label}
            onClick={() => handleAction(path)}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF' }}
            >
              {icon}
            </div>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Assets */}
      <div className="px-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 17, fontWeight: 600, color: '#111827' }}>Активы</span>
          <span style={{ fontSize: 14, color: '#2563EB', fontWeight: 500 }}>Все →</span>
        </div>

        <div className="space-y-2.5">
          {tokensLoading ? (
            <>
              {[1, 2].map(i => (
                <div key={i} style={{ height: 72, borderRadius: 16, background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </>
          ) : assetBalances.length > 0 ? (
            assetBalances.map(asset => (
              <div
                key={asset.id}
                className="flex items-center gap-3.5"
                style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '14px 16px' }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 44, borderRadius: '50%', background: asset.symbol === 'USDT' ? 'linear-gradient(135deg,#26A17B,#1E8A68)' : 'linear-gradient(135deg,#374151,#6B7280)', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}
                >
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{asset.symbol.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{asset.symbol}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#ECFDF5', color: '#059669', fontWeight: 600 }}>Активен</span>
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: 13 }}>{asset.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                    {asset.balance.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Fallback: show USDT placeholder */
            <div className="flex items-center gap-3.5" style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '14px 16px' }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#26A17B,#1E8A68)', boxShadow: '0 3px 10px rgba(38,161,123,0.25)' }}>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>U</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>USDT</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#ECFDF5', color: '#059669', fontWeight: 600 }}>Активен</span>
                </div>
                <div style={{ color: '#9CA3AF', fontSize: 13 }}>Tether USD</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>0.00</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>$0.00</div>
              </div>
            </div>
          )}

          {/* Coming soon tokens */}
          {comingSoonTokens.map((token) => (
            <div key={token.symbol} className="flex items-center gap-3.5" style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '14px 16px', opacity: 0.4 }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: '50%', background: token.gradient }}>{token.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>{token.symbol}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#F3F4F6', color: '#9CA3AF', fontWeight: 600 }}>Скоро</span>
                </div>
                <div style={{ color: '#9CA3AF', fontSize: 13 }}>{token.name}</div>
              </div>
            </div>
          ))}
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

export default Home
