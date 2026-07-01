import React, { useState, useEffect } from 'react'
import { useLang } from '../contexts/LanguageContext'
import { useBalance } from '../hooks/useBalance'

const ASSETS = [
  { symbol: 'USDT', name: 'Tether USD', color: '#26A17B', price: 1.00 },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', price: 67000 },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', price: 3500 },
  { symbol: 'TON', name: 'Toncoin', color: '#0098EA', price: 5.20 },
]

const Exchange: React.FC = () => {
  const { lang, t } = useLang()
  const { data: balance } = useBalance()

  const [fromSymbol, setFromSymbol] = useState('USDT')
  const [toSymbol, setToSymbol] = useState('BTC')
  const [fromAmount, setFromAmount] = useState('')
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const fromAsset = ASSETS.find(a => a.symbol === fromSymbol)!
  const toAsset = ASSETS.find(a => a.symbol === toSymbol)!

  const usdtBalance = balance?.balances?.find(b => b.currency === 'USDT' || b.symbol === 'USDT')
  const available = fromSymbol === 'USDT' ? (usdtBalance?.amount ?? 0) : 0

  const fromNum = parseFloat(fromAmount) || 0
  const rate = fromAsset.price / toAsset.price
  const toAmount = fromNum * rate
  const fee = fromNum * 0.005 // 0.5%
  const totalFrom = fromNum + fee

  const handleSwapPair = () => {
    setFromSymbol(toSymbol)
    setToSymbol(fromSymbol)
    setFromAmount('')
  }

  const handleExchange = () => {
    if (!fromNum) return
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: '#ECFDF5', border: '2px solid #A7F3D0' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{t('exchangeSuccess')}</h2>
        <p style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 4 }}>
          {fromNum.toFixed(2)} {fromSymbol}
        </p>
        <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 }}>
          → {toAmount.toFixed(6)} {toSymbol}
        </p>
        <button
          onClick={() => { setStep('form'); setFromAmount('') }}
          className="w-full py-4 rounded-2xl font-semibold text-white"
          style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
        >
          {lang === 'ru' ? 'Новый обмен' : 'New exchange'}
        </button>
      </div>
    )
  }

  const AssetPicker = ({ visible, onSelect, current, onClose }: { visible: boolean; onSelect: (s: string) => void; current: string; onClose: () => void }) => {
    if (!visible) return null
    return (
      <div
        className="fixed inset-0 z-50 flex items-end"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      >
        <div
          className="w-full"
          style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: 24, paddingBottom: 40 }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{t('selectAsset')}</div>
          <div className="space-y-2">
            {ASSETS.map(asset => (
              <div
                key={asset.symbol}
                className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer active:opacity-70"
                style={{ background: asset.symbol === current ? '#EFF6FF' : '#F9FAFB', border: `1.5px solid ${asset.symbol === current ? '#BFDBFE' : '#F3F4F6'}` }}
                onClick={() => { onSelect(asset.symbol); onClose() }}
              >
                <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: '50%', background: asset.color + '20' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: asset.color }}>{asset.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{asset.symbol}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{asset.name}</div>
                </div>
                {asset.symbol === current && (
                  <div className="ml-auto">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 24 }}>{t('exchangeTitle')}</h1>

        {/* From */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{t('from')}</div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer active:opacity-70 px-3 py-2.5 rounded-2xl flex-shrink-0"
              style={{ background: '#F3F4F6' }}
              onClick={() => setShowFromPicker(true)}
            >
              <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: '50%', background: fromAsset.color + '20' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: fromAsset.color }}>{fromSymbol.charAt(0)}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{fromSymbol}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 outline-none text-right"
              style={{ fontSize: 24, fontWeight: 700, color: '#111827', background: 'transparent', border: 'none', caretColor: '#2563EB' }}
            />
          </div>
          {fromSymbol === 'USDT' && (
            <div className="flex items-center justify-between mt-3" style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{t('available')}: {available.toFixed(2)} USDT</span>
              <button onClick={() => setFromAmount(available.toFixed(2))} style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '3px 10px', borderRadius: 8, border: 'none' }}>{t('max')}</button>
            </div>
          )}
        </div>

        {/* Swap button */}
        <div className="flex justify-center my-1 z-10 relative">
          <button
            onClick={handleSwapPair}
            className="flex items-center justify-center active:scale-90 transition-transform"
            style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: '50%', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', border: '2px solid #F3F4F6' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
          </button>
        </div>

        {/* To */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{t('to')}</div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer active:opacity-70 px-3 py-2.5 rounded-2xl flex-shrink-0"
              style={{ background: '#F3F4F6' }}
              onClick={() => setShowToPicker(true)}
            >
              <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: '50%', background: toAsset.color + '20' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: toAsset.color }}>{toSymbol.charAt(0)}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{toSymbol}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div className="flex-1 text-right" style={{ fontSize: 24, fontWeight: 700, color: fromNum ? '#111827' : '#D1D5DB', fontVariantNumeric: 'tabular-nums' }}>
              {fromNum ? toAmount.toFixed(6) : '0.000000'}
            </div>
          </div>
        </div>

        {/* Rate & fee info */}
        {fromNum > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
            {[
              { label: t('rate'), value: `1 ${fromSymbol} = ${rate.toFixed(6)} ${toSymbol}` },
              { label: t('fee'), value: `${fee.toFixed(4)} ${fromSymbol} (0.5%)` },
              { label: t('total'), value: `${totalFrom.toFixed(4)} ${fromSymbol}`, bold: true },
            ].map(({ label, value, bold }, i, arr) => (
              <div key={label} className="flex justify-between" style={{ paddingTop: i > 0 ? 10 : 0, borderTop: i > 0 ? '1px solid #F3F4F6' : 'none', paddingBottom: i < arr.length - 1 ? 10 : 0 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                <span style={{ fontSize: 13, color: '#111827', fontWeight: bold ? 700 : 500 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleExchange}
          disabled={!fromNum || fromNum <= 0}
          className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
          style={{ background: '#2563EB', fontSize: 16, border: 'none', boxShadow: fromNum ? '0 6px 20px rgba(37,99,235,0.35)' : 'none' }}
        >
          {t('exchangeBtn')}
        </button>
      </div>

      <AssetPicker
        visible={showFromPicker}
        current={fromSymbol}
        onSelect={s => { if (s !== toSymbol) setFromSymbol(s); else setToSymbol(fromSymbol); setFromAmount('') }}
        onClose={() => setShowFromPicker(false)}
      />
      <AssetPicker
        visible={showToPicker}
        current={toSymbol}
        onSelect={s => { if (s !== fromSymbol) setToSymbol(s); else setFromSymbol(toSymbol) }}
        onClose={() => setShowToPicker(false)}
      />
    </div>
  )
}

export default Exchange
