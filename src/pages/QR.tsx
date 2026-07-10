import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDepositWallet } from '../api/endpoints'
import { useNetworks } from '../hooks/useTokens'
import { useLang } from '../contexts/LanguageContext'
import { isDemoMode, MOCK_DEPOSIT_ADDRESS } from '../demo'

type Tab = 'scan' | 'myqr'

const QR: React.FC = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('scan')
  const [copied, setCopied] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const demo = isDemoMode()

  const { data: networks = [] } = useNetworks()
  const tronNetwork = networks.find(n => n.enabled && n.name.toLowerCase().includes('tron'))
    || networks.find(n => n.enabled)

  const { data: depositWallet, isLoading: walletLoading } = useQuery({
    queryKey: ['deposit-wallet', tronNetwork?.id],
    queryFn: () => getDepositWallet(tronNetwork!.id),
    enabled: !demo && !!tronNetwork?.id,
    staleTime: 5 * 60 * 1000,
  })

  const address = demo ? MOCK_DEPOSIT_ADDRESS : (depositWallet?.address || '')
  const qrBase64 = demo ? '' : (depositWallet?.qr_code_png_base64 || '')
  const isLoading = !demo && walletLoading

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

  const handleScan = () => {
    setScanning(true)
    setScanResult(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const twa = window.Telegram?.WebApp as any
    if (twa?.showScanQrPopup) {
      twa.showScanQrPopup(
        { text: lang === 'ru' ? 'Наведите камеру на QR-код' : 'Point camera at QR code' },
        (result: string) => {
          setScanResult(result)
          setScanning(false)
          twa.closeScanQrPopup?.()
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
          return true
        }
      )
    } else {
      // Fallback for non-Telegram environment
      setTimeout(() => {
        setScanResult(null)
        setScanning(false)
      }, 500)
    }
  }

  const handleCopyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      const el = document.createElement('textarea')
      el.value = address
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseScanResult = () => {
    if (!scanResult) return
    navigate('/send', { state: { prefillAddress: scanResult } })
  }

  return (
    <div className="min-h-screen flex flex-col pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className="flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-70 transition-opacity"
            style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={handleBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
            {lang === 'ru' ? 'QR-платёж' : 'QR Payment'}
          </h1>
        </div>

        {/* Tab switcher */}
        <div
          className="flex mb-5 p-1"
          style={{ background: '#E5E7EB', borderRadius: 14 }}
        >
          <button
            onClick={() => setTab('scan')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 transition-all"
            style={{
              borderRadius: 10,
              background: tab === 'scan' ? '#FFFFFF' : 'transparent',
              boxShadow: tab === 'scan' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: tab === 'scan' ? '#111827' : '#6B7280',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {lang === 'ru' ? 'Сканировать' : 'Scan'}
          </button>
          <button
            onClick={() => setTab('myqr')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 transition-all"
            style={{
              borderRadius: 10,
              background: tab === 'myqr' ? '#FFFFFF' : 'transparent',
              boxShadow: tab === 'myqr' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: tab === 'myqr' ? '#111827' : '#6B7280',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="14" x2="14" y2="14"/><line x1="21" y1="14" x2="21" y2="14"/>
              <line x1="14" y1="21" x2="14" y2="21"/><line x1="21" y1="21" x2="21" y2="21"/>
              <line x1="17.5" y1="14" x2="17.5" y2="21"/>
              <line x1="14" y1="17.5" x2="21" y2="17.5"/>
            </svg>
            {lang === 'ru' ? 'Мой QR' : 'My QR'}
          </button>
        </div>

        {/* ── SCAN TAB ── */}
        {tab === 'scan' && (
          <div>
            {scanResult ? (
              /* Result card */
              <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 24, marginBottom: 16 }}>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                    {lang === 'ru' ? 'QR отсканирован' : 'QR scanned'}
                  </span>
                </div>
                <div
                  style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}
                >
                  <span style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {scanResult}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUseScanResult}
                    className="flex-1 py-3 rounded-xl font-semibold text-white active:scale-95 transition-transform"
                    style={{ background: '#2563EB', border: 'none', fontSize: 14, boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
                  >
                    {lang === 'ru' ? 'Отправить →' : 'Send →'}
                  </button>
                  <button
                    onClick={() => setScanResult(null)}
                    className="py-3 px-4 rounded-xl font-semibold active:opacity-70"
                    style={{ background: '#F3F4F6', border: 'none', color: '#374151', fontSize: 14 }}
                  >
                    {lang === 'ru' ? 'Ещё раз' : 'Retry'}
                  </button>
                </div>
              </div>
            ) : (
              /* Scan card */
              <div
                className="flex flex-col items-center"
                style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, marginBottom: 16 }}
              >
                {/* Camera placeholder */}
                <div
                  className="flex items-center justify-center mb-6 relative"
                  style={{ width: 220, height: 220, borderRadius: 20, background: '#111827', overflow: 'hidden' }}
                >
                  {/* Corner markers */}
                  {[
                    { top: 12, left: 12, borderTop: '3px solid white', borderLeft: '3px solid white' },
                    { top: 12, right: 12, borderTop: '3px solid white', borderRight: '3px solid white' },
                    { bottom: 12, left: 12, borderBottom: '3px solid white', borderLeft: '3px solid white' },
                    { bottom: 12, right: 12, borderBottom: '3px solid white', borderRight: '3px solid white' },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', width: 28, height: 28, borderRadius: 3, ...s }} />
                  ))}
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>

                <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
                  {lang === 'ru'
                    ? 'Наведите камеру на QR-код адреса получателя'
                    : 'Point your camera at the recipient\'s QR code'}
                </p>

                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white active:scale-95 transition-all disabled:opacity-60"
                  style={{ background: '#2563EB', border: 'none', fontSize: 16, boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  {scanning
                    ? (lang === 'ru' ? 'Открываю камеру...' : 'Opening camera...')
                    : (lang === 'ru' ? 'Открыть камеру' : 'Open camera')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MY QR TAB ── */}
        {tab === 'myqr' && (
          <div>
            <div
              className="flex flex-col items-center mb-4"
              style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 24 }}
            >
              <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                {lang === 'ru' ? 'Ваш USDT адрес' : 'Your USDT address'}
              </div>

              {/* QR */}
              <div
                className="flex items-center justify-center mb-4"
                style={{ background: '#FFFFFF', borderRadius: 16, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                {isLoading ? (
                  <div style={{ width: 160, height: 160, borderRadius: 10, background: 'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ) : !qrBase64 ? (
                  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 10 }}>
                    <rect width="160" height="160" fill="white"/>
                    <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="#111827" strokeWidth="6"/>
                    <rect x="20" y="20" width="30" height="30" rx="2" fill="#111827"/>
                    <rect x="100" y="10" width="50" height="50" rx="4" fill="none" stroke="#111827" strokeWidth="6"/>
                    <rect x="110" y="20" width="30" height="30" rx="2" fill="#111827"/>
                    <rect x="10" y="100" width="50" height="50" rx="4" fill="none" stroke="#111827" strokeWidth="6"/>
                    <rect x="20" y="110" width="30" height="30" rx="2" fill="#111827"/>
                    {[70,80,90,100,110,120,130].map(x => [70,80,90,100,110,120,130].map(y =>
                      (x + y) % 20 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111827"/> : null
                    ))}
                    {[15,25,35,45,55,65].map(x => [70,80,90,100,110,120,130,140].map(y =>
                      (x * y) % 30 < 10 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111827"/> : null
                    ))}
                    {[70,80,90,100,110,120,130,140].map(x => [15,25,35,45,55,65].map(y =>
                      (x + y * 2) % 25 < 10 ? <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#111827"/> : null
                    ))}
                  </svg>
                ) : (
                  <div className="relative">
                    <img
                      src={`data:image/png;base64,${qrBase64}`}
                      alt="QR Code"
                      style={{ width: 160, height: 160, borderRadius: 10, display: 'block' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563EB', boxShadow: '0 2px 10px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                          <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" opacity="0.9"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div
                className="flex items-center justify-between w-full"
                style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 16px' }}
              >
                {isLoading ? (
                  <div style={{ flex: 1, height: 16, borderRadius: 6, background: 'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ) : (
                  <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {address || (lang === 'ru' ? 'Адрес недоступен' : 'Address unavailable')}
                  </span>
                )}
                <button onClick={handleCopyAddress} disabled={!address || isLoading} className="active:opacity-70 transition-opacity disabled:opacity-30 flex-shrink-0 ml-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyAddress}
              disabled={!address || isLoading}
              className="w-full flex items-center justify-center gap-2 mb-3 active:scale-95 transition-all disabled:opacity-40"
              style={{ background: copied ? '#059669' : '#2563EB', border: 'none', borderRadius: 16, padding: 18, color: '#FFFFFF', fontSize: 16, fontWeight: 600, boxShadow: copied ? '0 6px 20px rgba(5,150,105,0.35)' : '0 6px 20px rgba(37,99,235,0.35)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {copied
                  ? <polyline points="20 6 9 17 4 12"/>
                  : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>
                }
              </svg>
              {copied
                ? (lang === 'ru' ? 'Скопировано!' : 'Copied!')
                : (lang === 'ru' ? 'Скопировать адрес' : 'Copy address')}
            </button>

            {/* Warning */}
            <div
              className="flex items-center gap-2.5"
              style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 14, padding: '14px 16px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontSize: 13, color: '#D97706', fontWeight: 500 }}>
                {lang === 'ru' ? 'Принимает только USDT TRC-20' : 'Accepts only USDT TRC-20'}
              </span>
            </div>
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

export default QR
