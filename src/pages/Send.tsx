import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createWithdrawal, getNetworks } from '../api/endpoints'
import { useBalance } from '../hooks/useBalance'
import { useProfile } from '../hooks/useProfile'
import { isValidTronAddress, formatNumber } from '../utils/format'

type SendStep = 'form' | 'confirm' | 'success' | 'error'

const Send: React.FC = () => {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: balance } = useBalance()
  const [step, setStep] = useState<SendStep>('form')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null)

  const { data: networksData } = useQuery({
    queryKey: ['networks'],
    queryFn: async () => {
      const response = await getNetworks()
      if (response.success) return response.data
      throw new Error('Failed to fetch networks')
    },
  })

  const network = Array.isArray(networksData) ? networksData[0] : null
  const fee = network?.fee || 1
  const minAmount = network?.min_withdrawal || 1
  const maxAmount = network?.max_withdrawal || 10000

  const usdtBalance = balance?.balances?.find(
    (b) => b.currency === 'USDT' || b.symbol === 'USDT'
  )
  const availableBalance = usdtBalance?.amount || 0

  const handleBack = useCallback(() => {
    if (step === 'confirm') {
      setStep('form')
      return
    }
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
    mutationFn: createWithdrawal,
    onSuccess: (data) => {
      if (data.success) {
        setWithdrawalId(data.data.id)
        setStep('success')
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      } else {
        setErrorMsg('Не удалось выполнить перевод')
        setStep('error')
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Произошла ошибка'
      setErrorMsg(msg)
      setStep('error')
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
    },
  })

  const addressError = address && !isValidTronAddress(address)
    ? 'Адрес должен начинаться с T и содержать 34 символа'
    : ''

  const amountNum = parseFloat(amount) || 0
  const amountError = amount
    ? amountNum < minAmount
      ? `Минимум ${minAmount} USDT`
      : amountNum > maxAmount
      ? `Максимум ${maxAmount} USDT`
      : amountNum > availableBalance
      ? 'Недостаточно средств'
      : ''
    : ''

  const isFormValid =
    isValidTronAddress(address) && amountNum >= minAmount && amountNum <= availableBalance && !amountError

  const handleSubmitForm = () => {
    if (!isFormValid) return
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    setStep('confirm')
  }

  const handleConfirm = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy')
    if (!profile?.id) return
    withdrawMutation.mutate({
      account_id: profile.id,
      to: address,
      amount: amountNum,
      mode: 'standard',
    })
  }

  const handleSetMax = () => {
    const maxSend = Math.max(0, availableBalance - fee)
    setAmount(maxSend.toFixed(2))
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
  }

  const totalDeducted = amountNum + fee

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: '#ECFDF5', border: '2px solid #A7F3D0' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: 8 }}>Отправлено!</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: 4 }}>
          {formatNumber(amountNum, 2)} USDT отправлены на адрес
        </p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'monospace', textAlign: 'center', marginBottom: 32, wordBreak: 'break-all', padding: '0 16px' }}>
          {address}
        </p>
        {withdrawalId && (
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: 24 }}>
            ID: <span style={{ color: '#6B7280', fontFamily: 'monospace' }}>{withdrawalId.slice(0, 12)}...</span>
          </p>
        )}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setStep('form'); setAddress(''); setAmount('') }}
            className="flex-1 py-4 rounded-2xl font-semibold transition-opacity active:opacity-70"
            style={{ background: '#F3F4F6', color: '#374151', fontSize: '15px' }}
          >
            Ещё раз
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-4 rounded-2xl font-semibold text-white transition-opacity active:opacity-70"
            style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontSize: '15px' }}
          >
            На главную
          </button>
        </div>
      </div>
    )
  }

  // Error screen
  if (step === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: '#FEF2F2', border: '2px solid #FECACA' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: 8 }}>Ошибка</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>{errorMsg}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-4 rounded-2xl font-semibold transition-opacity active:opacity-70"
            style={{ background: '#F3F4F6', color: '#374151', fontSize: '15px' }}
          >
            Назад
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 rounded-2xl font-semibold text-white transition-opacity active:opacity-70"
            style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontSize: '15px' }}
          >
            Повторить
          </button>
        </div>
      </div>
    )
  }

  // Confirm screen
  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex flex-col px-4 pt-6 pb-24 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: 6 }}>Подтверждение</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: 24 }}>Проверьте детали перевода</p>

        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid #F3F4F6' }}>
          {[
            { label: 'Получатель', value: address, mono: true, truncate: true },
            { label: 'Сумма', value: `${formatNumber(amountNum, 2)} USDT` },
            { label: 'Комиссия сети', value: `${formatNumber(fee, 2)} USDT` },
            { label: 'Итого спишется', value: `${formatNumber(totalDeducted, 2)} USDT`, bold: true },
          ].map(({ label, value, mono, truncate, bold }, i, arr) => (
            <div
              key={label}
              className="flex items-start justify-between p-4"
              style={{
                background: '#FFFFFF',
                borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <span style={{ fontSize: '14px', color: '#6B7280' }}>{label}</span>
              <span
                style={{
                  fontSize: '14px',
                  marginLeft: 16,
                  fontFamily: mono ? 'monospace' : undefined,
                  fontWeight: bold ? 700 : 500,
                  color: '#111827',
                  wordBreak: truncate ? 'break-all' : undefined,
                  textAlign: 'right',
                  maxWidth: truncate ? 180 : undefined,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p style={{ fontSize: '13px', color: '#92400E' }}>
            Транзакции в сети TRON необратимы. Убедитесь в правильности адреса.
          </p>
        </div>

        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-4 rounded-2xl font-semibold transition-opacity active:opacity-70"
            style={{ background: '#F3F4F6', color: '#374151', fontSize: '15px' }}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={withdrawMutation.isPending}
            className="flex-1 py-4 rounded-2xl font-bold text-white active:scale-95 transition-transform disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
              boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
              fontSize: '15px',
            }}
          >
            {withdrawMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Отправка...
              </span>
            ) : (
              'Подтвердить'
            )}
          </button>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-24 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="active:opacity-70 transition-opacity flex-shrink-0"
          style={{ background: '#FFFFFF', borderRadius: '14px', padding: '8px 10px', border: '1px solid #F3F4F6' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Отправить</h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>USDT · TRC-20</p>
        </div>
      </div>

      {/* Balance indicator */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl mb-5"
        style={{ background: '#FFFFFF', border: '1px solid #F3F4F6' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#059669', boxShadow: '0 0 6px #059669' }} />
          <span style={{ fontSize: '14px', color: '#6B7280' }}>Доступно</span>
        </div>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
          {formatNumber(availableBalance, 2)} <span style={{ fontWeight: 400, color: '#6B7280' }}>USDT</span>
        </span>
      </div>

      {/* Address input */}
      <div className="mb-4">
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          TRON адрес получателя
        </label>
        <div className="relative">
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            placeholder="T..."
            rows={2}
            className="w-full px-4 py-3.5 rounded-2xl font-mono text-sm resize-none outline-none transition-all"
            style={{
              background: '#F9FAFB',
              border: addressError
                ? '1.5px solid #DC2626'
                : address && !addressError
                ? '1.5px solid #059669'
                : '1.5px solid #F3F4F6',
              color: '#111827',
              caretColor: '#2563EB',
            }}
          />
          {address && (
            <button
              onClick={() => setAddress('')}
              className="absolute top-3 right-3 transition-colors"
              style={{ color: '#9CA3AF' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        {addressError && (
          <p style={{ marginTop: 6, fontSize: '12px', color: '#DC2626' }}>{addressError}</p>
        )}
        {address && !addressError && (
          <p style={{ marginTop: 6, fontSize: '12px', color: '#059669' }}>Адрес действителен ✓</p>
        )}
      </div>

      {/* Amount input */}
      <div className="mb-5">
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Сумма USDT
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-4 rounded-2xl outline-none transition-all"
            style={{
              background: '#F9FAFB',
              border: amountError
                ? '1.5px solid #DC2626'
                : amount && !amountError
                ? '1.5px solid #2563EB'
                : '1.5px solid #F3F4F6',
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
              caretColor: '#2563EB',
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={handleSetMax}
              className="text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: '#EFF6FF', color: '#2563EB' }}
            >
              MAX
            </button>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#9CA3AF' }}>USDT</span>
          </div>
        </div>
        {amountError && (
          <p style={{ marginTop: 6, fontSize: '12px', color: '#DC2626' }}>{amountError}</p>
        )}
      </div>

      {/* Fee info */}
      {amountNum > 0 && !amountError && (
        <div
          className="rounded-2xl p-4 mb-5 space-y-3"
          style={{ background: '#FFFFFF', border: '1px solid #F3F4F6' }}
        >
          <div className="flex justify-between">
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Сумма перевода</span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{formatNumber(amountNum, 2)} USDT</span>
          </div>
          <div className="flex justify-between">
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Комиссия сети</span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{formatNumber(fee, 2)} USDT</span>
          </div>
          <div
            className="flex justify-between pt-3"
            style={{ borderTop: '1px solid #F3F4F6' }}
          >
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Итого спишется</span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>{formatNumber(totalDeducted, 2)} USDT</span>
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmitForm}
        disabled={!isFormValid}
        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
          boxShadow: isFormValid ? '0 6px 20px rgba(37,99,235,0.35)' : 'none',
          fontSize: '16px',
        }}
      >
        Продолжить
      </button>
    </div>
  )
}

export default Send
