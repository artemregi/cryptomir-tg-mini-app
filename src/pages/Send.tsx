import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createWithdrawal } from '../api/endpoints'
import { useAccounts } from '../hooks/useBalance'
import { useNetworks, useAllAssets } from '../hooks/useTokens'
import { isValidTronAddress, formatNumber } from '../utils/format'

type SendStep = 'form' | 'confirm' | 'success' | 'error'

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <div
    className="flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-70 transition-opacity"
    style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    onClick={onBack}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  </div>
)

const Send: React.FC = () => {
  const navigate = useNavigate()
  const { data: accounts = [] } = useAccounts()
  const { data: assets = [] } = useAllAssets()
  const [step, setStep] = useState<SendStep>('form')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Find USDT asset
  const usdtAsset = assets.find(a => a.symbol === 'USDT' && a.enabled)

  // Find USDT balance from user accounts
  const usdtAccount = accounts.find(a => a.type === 'user' && usdtAsset && a.asset_id === usdtAsset.id)
  const availableBalance = usdtAccount ? parseFloat(usdtAccount.balance) || 0 : 0

  // Fee calculation from asset config
  const feeFixed = usdtAsset ? parseFloat(usdtAsset.comission_fix) || 0 : 1
  const feePercent = usdtAsset ? parseFloat(usdtAsset.comission_percentage) || 0 : 0
  const amountNum = parseFloat(amount) || 0
  const fee = feeFixed + (amountNum * feePercent / 100)
  const minAmount = usdtAsset ? parseFloat(usdtAsset.min_withdraw_amount) || 1 : 1

  const handleBack = useCallback(() => {
    if (step === 'confirm') { setStep('form'); return }
    window.Telegram?.WebApp?.BackButton?.hide()
    navigate('/')
  }, [step, navigate])

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(handleBack)
    return () => {
      window.Telegram?.WebApp?.BackButton?.offClick(handleBack)
      window.Telegram?.WebApp?.BackButton?.hide()
    }
  }, [handleBack])

  const withdrawMutation = useMutation({
    mutationFn: () => createWithdrawal(usdtAsset!.id, amountNum.toString(), address),
    onSuccess: () => {
      setStep('success')
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setErrorMsg(e?.response?.data?.message || e?.message || 'Произошла ошибка')
      setStep('error')
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
    },
  })

  const addressError = address && !isValidTronAddress(address)
    ? 'Адрес должен начинаться с T и содержать 34 символа' : ''
  const amountError = amount
    ? amountNum < minAmount ? `Минимум ${minAmount} USDT`
    : amountNum + fee > availableBalance ? 'Недостаточно средств' : '' : ''
  const isFormValid = isValidTronAddress(address) && amountNum >= minAmount && amountNum + fee <= availableBalance && !amountError && !!usdtAsset
  const totalDeducted = amountNum + fee

  const handleSubmitForm = () => {
    if (!isFormValid) return
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    setStep('confirm')
  }

  const handleSetMax = () => {
    setAmount(Math.max(0, availableBalance - fee).toFixed(2))
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
  }

  if (step === 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: '#ECFDF5', border: '2px solid #A7F3D0' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Отправлено!</h2>
      <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4 }}>{formatNumber(amountNum, 2)} USDT отправлены</p>
      <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', textAlign: 'center', marginBottom: 32, wordBreak: 'break-all', padding: '0 16px' }}>{address}</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => { setStep('form'); setAddress(''); setAmount('') }} className="flex-1 py-4 rounded-2xl font-semibold" style={{ background: '#F3F4F6', color: '#374151', fontSize: 15, border: 'none' }}>Ещё раз</button>
        <button onClick={() => navigate('/')} className="flex-1 py-4 rounded-2xl font-semibold text-white" style={{ background: '#2563EB', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontSize: 15, border: 'none' }}>На главную</button>
      </div>
    </div>
  )

  if (step === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: '#FEF2F2', border: '2px solid #FECACA' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Ошибка</h2>
      <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>{errorMsg}</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => setStep('form')} className="flex-1 py-4 rounded-2xl font-semibold" style={{ background: '#F3F4F6', color: '#374151', fontSize: 15, border: 'none' }}>Назад</button>
        <button onClick={() => withdrawMutation.mutate()} className="flex-1 py-4 rounded-2xl font-semibold text-white" style={{ background: '#2563EB', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontSize: 15, border: 'none' }}>Повторить</button>
      </div>
    </div>
  )

  if (step === 'confirm') return (
    <div className="min-h-screen flex flex-col px-5 pt-5 pb-24 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="flex items-center gap-3.5 mb-7">
        <BackButton onBack={handleBack} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Подтверждение</h1>
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 16 }}>
        {[
          { label: 'Получатель', value: address, mono: true },
          { label: 'Сумма', value: `${formatNumber(amountNum, 2)} USDT` },
          { label: 'Комиссия', value: `${formatNumber(fee, 4)} USDT` },
          { label: 'Итого', value: `${formatNumber(totalDeducted, 4)} USDT`, bold: true },
        ].map(({ label, value, mono, bold }, i, arr) => (
          <div key={label} className="flex items-start justify-between p-4" style={{ borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <span style={{ fontSize: 14, color: '#6B7280' }}>{label}</span>
            <span style={{ fontSize: 14, marginLeft: 16, fontFamily: mono ? 'monospace' : undefined, fontWeight: bold ? 700 : 500, color: '#111827', wordBreak: 'break-all', textAlign: 'right', maxWidth: 180 }}>{value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2.5 mb-8 p-4 rounded-2xl" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" className="flex-shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p style={{ fontSize: 13, color: '#92400E' }}>Транзакции в сети TRON необратимы. Убедитесь в правильности адреса.</p>
      </div>
      <div className="flex gap-3 mt-auto">
        <button onClick={() => setStep('form')} className="flex-1 py-4 rounded-2xl font-semibold" style={{ background: '#F3F4F6', color: '#374151', fontSize: 15, border: 'none' }}>Отмена</button>
        <button onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending} className="flex-1 py-4 rounded-2xl font-bold text-white active:scale-95 transition-transform disabled:opacity-60" style={{ background: '#2563EB', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontSize: 15, border: 'none' }}>
          {withdrawMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
              Отправка...
            </span>
          ) : 'Подтвердить'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col px-5 pt-5 pb-24 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="flex items-center gap-3.5 mb-7">
        <BackButton onBack={handleBack} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Отправить</h1>
      </div>

      {/* Amount display card */}
      <div className="text-center mb-5" style={{ background: 'linear-gradient(145deg,#EFF6FF,#DBEAFE)', border: '1.5px solid #BFDBFE', borderRadius: 22, padding: 26 }}>
        <div style={{ color: '#6B7280', fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Сумма перевода</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {amount || '0.00'}
        </div>
        <div style={{ fontSize: 16, color: '#6B7280', marginTop: 8, fontWeight: 500 }}>USDT</div>
        {availableBalance > 0 && (
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
            Доступно: {formatNumber(availableBalance, 2)} USDT
          </div>
        )}
      </div>

      {/* Address input */}
      <div className="mb-3.5">
        <div style={{ color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>TRON адрес получателя</div>
        <div className="relative">
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            placeholder="T..."
            rows={2}
            className="w-full font-mono text-sm resize-none outline-none transition-all"
            style={{
              background: '#F9FAFB',
              border: addressError ? '1.5px solid #DC2626' : address && !addressError ? '1.5px solid #059669' : '1.5px solid #E5E7EB',
              borderRadius: 14,
              padding: '14px 16px',
              fontSize: 15,
              color: '#111827',
              caretColor: '#2563EB',
            }}
          />
          {address && (
            <button onClick={() => setAddress('')} className="absolute top-3 right-3" style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        {addressError && <p style={{ marginTop: 6, fontSize: 12, color: '#DC2626' }}>{addressError}</p>}
        {address && !addressError && <p style={{ marginTop: 6, fontSize: 12, color: '#059669' }}>Адрес действителен ✓</p>}
      </div>

      {/* Amount input */}
      <div className="mb-3.5">
        <div style={{ color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Сумма USDT</div>
        <div
          className="flex items-center justify-between"
          style={{ background: '#F9FAFB', border: amountError ? '1.5px solid #DC2626' : amount && !amountError ? '1.5px solid #2563EB' : '1.5px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}
        >
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="outline-none bg-transparent"
            style={{ fontSize: 15, color: amount ? '#111827' : '#9CA3AF', fontWeight: 400, width: '100%', caretColor: '#2563EB', border: 'none' }}
          />
          <button onClick={handleSetMax} style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '5px 12px', borderRadius: 8, flexShrink: 0, marginLeft: 8, border: 'none', cursor: 'pointer' }}>
            MAX
          </button>
        </div>
        {amountError && <p style={{ marginTop: 6, fontSize: 12, color: '#DC2626' }}>{amountError}</p>}
      </div>

      {/* Fee row */}
      <div
        className="flex items-center justify-between mb-8"
        style={{ background: '#F9FAFB', border: '1.5px solid #F3F4F6', borderRadius: 14, padding: '14px 16px' }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ color: '#6B7280', fontSize: 14 }}>Комиссия</span>
        </div>
        <span style={{ color: '#111827', fontSize: 14, fontWeight: 600 }}>~{formatNumber(fee, 4)} USDT</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmitForm}
        disabled={!isFormValid}
        className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
        style={{ background: '#2563EB', border: 'none', borderRadius: 16, fontSize: 16, boxShadow: isFormValid ? '0 6px 20px rgba(37,99,235,0.35)' : 'none' }}
      >
        Отправить
      </button>
    </div>
  )
}

export default Send
