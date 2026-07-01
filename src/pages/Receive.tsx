import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useProfile, useTronAddress } from '../hooks/useProfile'

const Receive: React.FC = () => {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useProfile()
  const tronAddress = useTronAddress()
  const [copied, setCopied] = useState(false)

  const handleBack = useCallback(() => {
    window.Telegram?.WebApp?.BackButton?.hide()
    navigate('/')
  }, [navigate])

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(handleBack)
    return () => {
      window.Telegram?.WebApp?.BackButton?.offClick(handleBack)
      window.Telegram?.WebApp?.BackButton?.hide()
    }
  }, [handleBack])

  const handleCopy = async () => {
    if (!tronAddress) return
    try {
      await navigator.clipboard.writeText(tronAddress)
      setCopied(true)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = tronAddress
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    if (!tronAddress) return
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    if (navigator.share) {
      navigator.share({ title: 'Мой TRON адрес', text: `Мой USDT (TRC-20) адрес: ${tronAddress}` })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="active:opacity-70 transition-opacity"
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '8px 10px',
              border: '1px solid #F3F4F6',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Получить
            </h1>
            <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>USDT · TRC-20</p>
          </div>
        </div>

        {/* QR Card */}
        <div
          className="rounded-3xl p-6 mb-4 flex flex-col items-center gap-5"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #F3F4F6',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Ваш адрес USDT
          </p>

          {/* QR */}
          <div
            className="relative flex items-center justify-center"
            style={{ background: '#F9FAFB', borderRadius: '20px', padding: '16px' }}
          >
            {isLoading || !tronAddress ? (
              <div
                style={{
                  width: 180, height: 180, borderRadius: '12px',
                  background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            ) : (
              <>
                <QRCodeSVG
                  value={tronAddress}
                  size={180}
                  bgColor="#F9FAFB"
                  fgColor="#111827"
                  level="M"
                  includeMargin={false}
                />
                {/* Center logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: '10px',
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                      boxShadow: '0 2px 12px rgba(37,99,235,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                      <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Address pill inside card */}
          <div
            className="flex items-center gap-3 w-full"
            style={{ background: '#F9FAFB', borderRadius: '14px', padding: '10px 14px', border: '1px solid #F3F4F6' }}
          >
            {isLoading ? (
              <div
                style={{
                  flex: 1, height: 16, borderRadius: 6,
                  background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            ) : (
              <span style={{ flex: 1, fontSize: '12px', color: '#374151', fontWeight: 500, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tronAddress || 'Адрес недоступен'}
              </span>
            )}
            <button onClick={handleCopy} disabled={!tronAddress || isLoading} className="active:opacity-70 transition-opacity disabled:opacity-30 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          disabled={!tronAddress || isLoading}
          className="w-full flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 mb-3"
          style={{
            background: copied
              ? 'linear-gradient(135deg, #059669, #10B981)'
              : 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
            borderRadius: '16px',
            padding: '16px',
            fontWeight: 600,
            fontSize: '15px',
            color: '#FFFFFF',
            boxShadow: copied
              ? '0 6px 20px rgba(5,150,105,0.35)'
              : '0 6px 20px rgba(37,99,235,0.35)',
          }}
        >
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Скопировано!
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Скопировать адрес
            </>
          )}
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={!tronAddress || isLoading}
          className="w-full flex items-center justify-center gap-2 active:opacity-70 transition-opacity disabled:opacity-40 mb-5"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px',
            fontWeight: 600,
            fontSize: '14px',
            color: '#6B7280',
            border: '1px solid #F3F4F6',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Поделиться
        </button>

        {/* Warning */}
        <div
          className="flex items-start gap-3"
          style={{ background: '#FFFBEB', borderRadius: '16px', padding: '14px 16px', border: '1px solid #FDE68A' }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: '10px',
              background: 'rgba(217,119,6,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 500, lineHeight: 1.5 }}>
            Отправляйте только <strong>USDT TRC-20</strong> на этот адрес. Другие токены будут безвозвратно потеряны.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Минимальное пополнение: <span style={{ color: '#6B7280' }}>1 USDT</span>
          </p>
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

export default Receive
