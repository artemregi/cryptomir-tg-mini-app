import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useProfile, useTronAddress } from '../hooks/useProfile'
import { shortenAddress } from '../utils/format'

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
      // Fallback
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
      navigator.share({
        title: 'Мой TRON адрес',
        text: `Мой USDT (TRC-20) адрес: ${tronAddress}`,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 animate-fade-in" style={{ background: '#E4F3FB' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4DB4EA 0%, transparent 60%)', filter: 'blur(50px)' }}
        />
      </div>

      <div className="relative z-10 px-4 pt-6">
        <h1 className="text-text-primary text-2xl font-bold mb-1">Пополнить</h1>
        <p className="text-text-secondary text-sm mb-6">
          Отправьте USDT (TRC-20) на этот адрес
        </p>

        {/* Network badge */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(77, 180, 234, 0.1)',
              border: '1px solid rgba(77, 180, 234, 0.3)',
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#4DB4EA', boxShadow: '0 0 6px #4DB4EA' }}
            />
            <span className="text-sm font-semibold" style={{ color: '#4DB4EA' }}>
              TRON (TRC-20)
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-2xl relative"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 40px rgba(79, 142, 196, 0.12)',
              border: '1px solid #BDDCF2',
            }}
          >
            {isLoading || !tronAddress ? (
              <div
                className="w-48 h-48 rounded-lg"
                style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            ) : (
              <>
                <QRCodeSVG
                  value={tronAddress}
                  size={192}
                  bgColor="#FFFFFF"
                  fgColor="#183650"
                  level="M"
                  includeMargin={false}
                />
                {/* Center logo */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: '#4F8EC4' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                      <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Address display */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: '#FFFFFF', border: '1px solid #BDDCF2' }}
        >
          <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider font-medium">Ваш адрес</p>
          {isLoading ? (
            <div
              className="h-5 w-full rounded"
              style={{
                background: 'linear-gradient(90deg, #DCEFF9 25%, #E4F3FB 50%, #DCEFF9 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          ) : (
            <p
              className="text-text-primary font-mono text-sm break-all leading-relaxed"
              style={{ letterSpacing: '0.02em' }}
            >
              {tronAddress || 'Адрес не найден'}
            </p>
          )}
        </div>

        {/* Warning */}
        <div
          className="rounded-xl p-3.5 mb-5 flex items-start gap-2.5"
          style={{ background: 'rgba(243, 156, 18, 0.08)', border: '1px solid rgba(243, 156, 18, 0.2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-xs" style={{ color: '#F39C12' }}>
            Отправляйте только <strong>USDT TRC-20</strong> на этот адрес. Отправка других токенов может привести к потере средств.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!tronAddress || isLoading}
            className="flex-1 py-4 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{
              background: copied
                ? 'rgba(0, 184, 148, 0.15)'
                : 'linear-gradient(135deg, #4DB4EA 0%, #3AA0D6 100%)',
              border: copied ? '1px solid rgba(0, 184, 148, 0.4)' : 'none',
              boxShadow: copied ? 'none' : '0 4px 20px rgba(77, 180, 234, 0.25)',
            }}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{ color: '#00B894' }}>Скопировано!</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Скопировать адрес
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            disabled={!tronAddress || isLoading}
            className="w-14 h-14 rounded-xl flex items-center justify-center active:opacity-70 transition-opacity disabled:opacity-40"
            style={{ background: '#DCEFF9', border: '1px solid #BDDCF2' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B8FAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>

        {/* Min deposit info */}
        <div className="mt-4 text-center">
          <p className="text-text-muted text-xs">
            Минимальное пополнение: <span className="text-text-secondary">1 USDT</span>
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
