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

  // Back button
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#E4F3FB' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'rgba(0, 184, 148, 0.15)',
            border: '2px solid rgba(0, 184, 148, 0.4)',
            boxShadow: '0 0 40px rgba(0,184,148,0.15)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-text-primary text-2xl font-bold mb-2">Отправлено!</h2>
        <p className="text-text-secondary text-center text-sm mb-1">
          {formatNumber(amountNum, 2)} USDT отправлены на адрес
        </p>
        <p className="text-text-muted text-xs font-mono text-center mb-8 break-all px-4">
          {address}
        </p>
        {withdrawalId && (
          <p className="text-text-muted text-xs mb-6">
            ID транзакции: <span className="text-text-secondary font-mono">{withdrawalId.slice(0, 12)}...</span>
          </p>
        )}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setStep('form'); setAddress(''); setAmount('') }}
            className="flex-1 py-3.5 rounded-xl font-semibold text-text-primary transition-opacity active:opacity-70"
            style={{ background: '#EAF4FB', boxShadow: '0 1px 4px rgba(24,54,80,0.06)' }}
          >
            Ещё раз
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-opacity active:opacity-70"
            style={{ background: 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 100%)' }}
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#E4F3FB' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'rgba(225, 112, 85, 0.15)',
            border: '2px solid rgba(225, 112, 85, 0.4)',
            boxShadow: '0 0 40px rgba(225,112,85,0.15)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E17055" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 className="text-text-primary text-2xl font-bold mb-2">Ошибка</h2>
        <p className="text-text-secondary text-center text-sm mb-8">{errorMsg}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-3.5 rounded-xl font-semibold text-text-primary"
            style={{ background: '#EAF4FB', boxShadow: '0 1px 4px rgba(24,54,80,0.06)' }}
          >
            Назад
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3.5 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 100%)' }}
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
      <div className="min-h-screen flex flex-col px-4 pt-6 pb-24 animate-fade-in" style={{ background: '#E4F3FB' }}>
        <h1 className="text-text-primary text-2xl font-bold mb-2">Подтверждение</h1>
        <p className="text-text-secondary text-sm mb-6">Проверьте детали перевода</p>

        <div className="rounded-2xl overflow-hidden mb-4" style={{ boxShadow: '0 2px 16px rgba(24,54,80,0.08)' }}>
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
                borderBottom: i < arr.length - 1 ? '1px solid rgba(189,220,242,0.6)' : 'none',
              }}
            >
              <span className="text-text-secondary text-sm">{label}</span>
              <span
                className={`text-sm ml-4 ${mono ? 'font-mono' : ''} ${bold ? 'font-bold text-text-primary' : 'text-text-primary'} ${truncate ? 'break-all text-right max-w-[180px]' : ''}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl p-3.5 mb-6 flex items-start gap-2.5"
          style={{ background: 'rgba(225,112,85,0.08)', border: '1px solid rgba(225,112,85,0.2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E17055" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs" style={{ color: '#E17055' }}>
            Транзакции в сети TRON необратимы. Убедитесь в правильности адреса.
          </p>
        </div>

        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-4 rounded-xl font-semibold text-text-primary active:opacity-70 transition-opacity"
            style={{ background: '#EAF4FB', boxShadow: '0 1px 4px rgba(24,54,80,0.06)' }}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={withdrawMutation.isPending}
            className="flex-1 py-4 rounded-xl font-bold text-white active:scale-95 transition-transform disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 100%)',
              boxShadow: '0 4px 20px rgba(79,142,196,0.3)',
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
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-24 animate-fade-in" style={{ background: '#E4F3FB' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4F8EC4 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header with back */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={handleBack}
            className="active:opacity-70 transition-opacity flex-shrink-0"
            style={{ background: '#FFFFFF', borderRadius: '12px', padding: '7px 10px', boxShadow: '0 1px 6px rgba(24,54,80,0.08)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#183650" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#183650', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Отправить</h1>
            <p style={{ fontSize: '11px', color: '#6B8FAA', fontWeight: 500 }}>USDT · TRC-20</p>
          </div>
        </div>

        {/* Balance indicator */}
        <div
          className="flex items-center justify-between p-3.5 rounded-xl mb-5"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 8px rgba(24,54,80,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#00B894', boxShadow: '0 0 6px #00B894' }} />
            <span className="text-text-secondary text-sm">Доступно</span>
          </div>
          <span className="text-text-primary font-bold">
            {formatNumber(availableBalance, 2)} <span className="text-text-secondary font-normal">USDT</span>
          </span>
        </div>

        {/* Address input */}
        <div className="mb-4">
          <label className="block text-text-secondary text-xs font-medium mb-2 tracking-wider uppercase">
            TRON адрес получателя
          </label>
          <div className="relative">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              placeholder="T..."
              rows={2}
              className="w-full px-4 py-3.5 rounded-xl font-mono text-sm text-text-primary placeholder-text-muted resize-none outline-none transition-all"
              style={{
                background: '#FFFFFF',
                boxShadow: addressError
                  ? '0 0 0 1.5px #E17055, 0 1px 8px rgba(225,112,85,0.08)'
                  : address && !addressError
                  ? '0 0 0 1.5px #00B894, 0 1px 8px rgba(0,184,148,0.08)'
                  : '0 1px 8px rgba(24,54,80,0.07)',
                caretColor: '#4F8EC4',
              }}
            />
            {address && (
              <button
                onClick={() => setAddress('')}
                className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          {addressError && (
            <p className="mt-1.5 text-xs" style={{ color: '#E17055' }}>{addressError}</p>
          )}
          {address && !addressError && (
            <p className="mt-1.5 text-xs" style={{ color: '#00B894' }}>
              Адрес действителен ✓
            </p>
          )}
        </div>

        {/* Amount input */}
        <div className="mb-5">
          <label className="block text-text-secondary text-xs font-medium mb-2 tracking-wider uppercase">
            Сумма USDT
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 rounded-xl text-2xl font-bold text-text-primary placeholder-text-muted outline-none transition-all"
              style={{
                background: '#FFFFFF',
                boxShadow: amountError
                  ? '0 0 0 1.5px #E17055, 0 1px 8px rgba(225,112,85,0.08)'
                  : amount && !amountError
                  ? '0 0 0 1.5px #4F8EC4, 0 1px 8px rgba(79,142,196,0.08)'
                  : '0 1px 8px rgba(24,54,80,0.07)',
                caretColor: '#4F8EC4',
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={handleSetMax}
                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(79,142,196,0.15)', color: '#4F8EC4' }}
              >
                MAX
              </button>
              <span className="text-text-secondary text-sm font-medium">USDT</span>
            </div>
          </div>
          {amountError && (
            <p className="mt-1.5 text-xs" style={{ color: '#E17055' }}>{amountError}</p>
          )}
        </div>

        {/* Fee info */}
        {amountNum > 0 && !amountError && (
          <div
            className="rounded-xl p-4 mb-5 space-y-2.5"
            style={{ background: '#FFFFFF', boxShadow: '0 1px 8px rgba(24,54,80,0.07)' }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Сумма перевода</span>
              <span className="text-text-primary">{formatNumber(amountNum, 2)} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Комиссия сети</span>
              <span className="text-text-primary">{formatNumber(fee, 2)} USDT</span>
            </div>
            <div
              className="flex justify-between text-sm font-bold pt-2"
              style={{ borderTop: '1px solid rgba(189,220,242,0.6)' }}
            >
              <span className="text-text-secondary">Итого спишется</span>
              <span className="text-text-primary">{formatNumber(totalDeducted, 2)} USDT</span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmitForm}
          disabled={!isFormValid}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isFormValid
              ? 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 100%)'
              : '#DCEFF9',
            boxShadow: isFormValid ? '0 4px 20px rgba(79,142,196,0.3)' : 'none',
            border: isFormValid ? 'none' : '1px solid #BDDCF2',
            color: isFormValid ? '#FFFFFF' : '#90ABBD',
          }}
        >
          Продолжить
        </button>
      </div>
    </div>
  )
}

export default Send
