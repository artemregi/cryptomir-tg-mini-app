import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccounts } from '../hooks/useBalance'
import { useAllAssets } from '../hooks/useTokens'
import { useProfile } from '../hooks/useProfile'
import { useKycStatus } from '../hooks/useKyc'
import {
  useCard,
  useCardBalance,
  useCardTransactions,
  useApplyCard,
  useLockCard,
  useTopUpCard,
  getStoredCardId,
} from '../hooks/useCard'
import { useLang } from '../contexts/LanguageContext'
import type { CPTransactionType } from '../types/cardplus'
import { isDemoMode } from '../demo'

const DEMO_CARD = {
  cardId:     'demo-card-1',
  cardNo:     '5365 **** **** 4729',
  cardStatus: 'NORMAL' as const,
  cardType:   'VIRTUAL',
  holderName: 'ARTEM REGIS',
  expiryDate: '09/27',
  currency:   'USD',
}
const DEMO_BALANCE = { cardId: 'demo-card-1', balance: 124.50, availableBalance: 124.50, currency: 'USD' }
const DEMO_TRANSACTIONS = [
  { transId: 'd1', cardId: 'demo-card-1', amount: 124.50, currency: 'USD', merchantName: 'Пополнение', transType: 'TOPUP' as CPTransactionType, status: 'COMPLETED' as const, transTime: '2026-07-08T12:00:00Z', description: '' },
  { transId: 'd2', cardId: 'demo-card-1', amount: 45.99, currency: 'USD', merchantName: 'Apple Store', transType: 'PURCHASE' as CPTransactionType, status: 'COMPLETED' as const, transTime: '2026-07-07T18:30:00Z', description: '' },
  { transId: 'd3', cardId: 'demo-card-1', amount: 12.50, currency: 'USD', merchantName: 'Spotify', transType: 'PURCHASE' as CPTransactionType, status: 'COMPLETED' as const, transTime: '2026-07-06T09:15:00Z', description: '' },
]

const transLabel = (type: CPTransactionType, lang: string): string => {
  const map: Record<CPTransactionType, [string, string]> = {
    TOPUP:    ['Пополнение', 'Top up'],
    PURCHASE: ['Покупка', 'Purchase'],
    REFUND:   ['Возврат', 'Refund'],
    FEE:      ['Комиссия', 'Fee'],
    REVERSAL: ['Отмена', 'Reversal'],
  }
  return map[type]?.[lang === 'ru' ? 0 : 1] ?? type
}

const Card: React.FC = () => {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const { data: accounts = [] } = useAccounts()
  const { data: assets = [] } = useAllAssets()
  const { data: profile } = useProfile()
  const { data: kycInfo } = useKycStatus()

  const kycApproved = kycInfo?.cardAccountStatus === 'APPROVED'
  const kycPending  = kycInfo?.cardAccountStatus === 'PENDING_REVIEW'

  // Card ID is stored in localStorage after first apply
  const [cardId, setCardId] = useState<string | null>(() => getStoredCardId())

  const { data: card, isLoading: cardLoading, refetch: refetchCard } = useCard(cardId)
  const { data: balance, refetch: refetchBalance } = useCardBalance(cardId)
  const { data: transactions = [], refetch: refetchTx } = useCardTransactions(cardId)

  const applyMutation = useApplyCard()
  const lockMutation  = useLockCard(cardId)
  const topUpMutation = useTopUpCard()

  const [showBack, setShowBack] = useState(false)
  const [flipPhase, setFlipPhase] = useState<'idle'|'out'|'in'>('idle')
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpSuccess, setTopUpSuccess] = useState(false)

  // USDT balance from crypto wallet
  const usdtAsset   = assets.find(a => a.symbol === 'USDT' && a.enabled)
  const usdtAccount = usdtAsset ? accounts.find(a => a.asset_id === usdtAsset.id && a.type === 'user') : undefined
  const usdtBalance = parseFloat(usdtAccount?.balance || '0') || 0

  const handleIssueCard = () => {
    const holderName =
      profile?.full_name ||
      window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name ||
      'USER'
    applyMutation.mutate(holderName, {
      onSuccess: (data) => {
        setCardId(data.cardId)
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      },
    })
  }

  const handleLock = () => {
    if (!card || card.cardStatus === 'LOCKED') return
    lockMutation.mutate(undefined, {
      onSuccess: () => {
        refetchCard()
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
      },
    })
  }

  const handleTopUp = () => {
    if (!cardId) return
    const amount = parseFloat(topUpAmount)
    if (!amount || amount <= 0) return
    if (usdtBalance < amount) {
      window.Telegram?.WebApp?.showAlert(
        lang === 'ru' ? 'Недостаточно средств в кошельке' : 'Insufficient wallet balance'
      )
      return
    }
    topUpMutation.mutate(
      { cardId, amount, currency: 'USD' },
      {
        onSuccess: () => {
          setTopUpAmount('')
          setShowTopUp(false)
          setTopUpSuccess(true)
          refetchBalance()
          refetchTx()
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
          setTimeout(() => setTopUpSuccess(false), 3000)
        },
      }
    )
  }

  const handleRefresh = () => {
    refetchCard()
    refetchBalance()
    refetchTx()
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
  }

  const handleFlip = () => {
    if (flipPhase !== 'idle') return
    if (flipTimer.current) clearTimeout(flipTimer.current)
    setFlipPhase('out')
    flipTimer.current = setTimeout(() => {
      setShowBack(b => !b)
      setFlipPhase('idle')
    }, 180)
  }

  const demo = isDemoMode()
  const displayCard = demo ? DEMO_CARD : card
  const displayBalance = demo ? DEMO_BALANCE : balance
  const displayTransactions = demo ? DEMO_TRANSACTIONS : transactions
  const isLocked = !demo && card?.cardStatus === 'LOCKED'
  const hasCard  = demo || (!!cardId && !!card)

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
            {t('cardTitle')}
          </h1>
          {hasCard && (
            <div
              className="flex items-center justify-center cursor-pointer active:opacity-70"
              style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              onClick={handleRefresh}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </div>
          )}
        </div>

        {/* ── LOADING ── */}
        {cardLoading && cardId && (
          <div className="space-y-4">
            <div style={{ height: 190, borderRadius: 20, background: 'linear-gradient(90deg,#E5E7EB 25%,#D1D5DB 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ height: 100, borderRadius: 18, background: 'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          </div>
        )}

        {/* ── NO CARD ── */}
        {!cardId && !cardLoading && !demo && (
          <>
            {/* Card placeholder */}
            <div
              className="relative overflow-hidden mb-6 flex flex-col justify-between"
              style={{ background: 'linear-gradient(135deg,#D1D5DB,#9CA3AF)', borderRadius: 20, padding: '24px 24px 20px', height: 190, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            >
              <div style={{ width: 40, height: 30, background: 'rgba(255,255,255,0.25)', borderRadius: 4 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: 8 }}>
                  •••• •••• •••• ••••
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {t('cardNotIssued').toUpperCase()}
                </div>
              </div>
              <div className="absolute right-5 bottom-5">
                <svg width="48" height="30" viewBox="0 0 50 32" fill="none">
                  <circle cx="18" cy="16" r="16" fill="rgba(255,255,255,0.15)"/>
                  <circle cx="32" cy="16" r="16" fill="rgba(255,255,255,0.1)"/>
                </svg>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 24, textAlign: 'center' }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4" style={{ background: '#F3F4F6' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round">
                  <rect x="2" y="5" width="20" height="14" rx="3"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{t('cardNotIssued')}</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{t('cardNotIssuedDesc')}</p>

              {/* KYC not submitted / pending */}
              {!kycApproved && (
                <>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-4 text-left" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#D97706', fontWeight: 500 }}>
                      {kycPending
                        ? (lang === 'ru' ? 'KYC на проверке, ожидайте подтверждения' : 'KYC under review, please wait')
                        : t('kycRequiredForCard')}
                    </span>
                  </div>
                  {!kycPending && (
                    <button
                      onClick={() => navigate('/kyc')}
                      className="w-full py-4 rounded-2xl font-semibold text-white"
                      style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
                    >
                      {t('completeKYC')}
                    </button>
                  )}
                </>
              )}

              {/* KYC approved — issue card */}
              {kycApproved && (
                <button
                  onClick={handleIssueCard}
                  disabled={applyMutation.isPending}
                  className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-60"
                  style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
                >
                  {applyMutation.isPending
                    ? (lang === 'ru' ? 'Выпускаем карту...' : 'Issuing card...')
                    : t('issueCard')}
                </button>
              )}

              {applyMutation.isError && (
                <p style={{ fontSize: 13, color: '#DC2626', marginTop: 12 }}>
                  {lang === 'ru' ? 'Ошибка выпуска карты' : 'Failed to issue card'}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── CARD ISSUED ── */}
        {hasCard && !cardLoading && (
          <>
            {/* Card flip container */}
            <div
              style={{ height: 190, marginBottom: 8, cursor: 'pointer' }}
              onClick={handleFlip}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.18s ease-in-out',
                  transform: flipPhase === 'out' ? 'scaleX(0)' : 'scaleX(1)',
                }}
              >
                {!showBack ? (
                <div
                  className="relative overflow-hidden flex flex-col justify-between"
                  style={{
                    width: '100%', height: '100%',
                    background: isLocked
                      ? 'linear-gradient(135deg,#3A3A3A,#1A1A1A)'
                      : 'linear-gradient(135deg,#2C2C2C,#000000)',
                    borderRadius: 20, padding: '24px 24px 20px',
                    boxShadow: isLocked ? '0 8px 32px rgba(0,0,0,0.35)' : '0 8px 32px rgba(0,0,0,0.45)',
                  }}
                >
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                  <div className="flex items-center justify-between relative z-10">
                    <div style={{ width: 40, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: 4 }} />
                    {isLocked ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{t('cardFrozen')}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                        {lang === 'ru' ? 'нажмите, чтобы перевернуть' : 'tap to flip'}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'white', letterSpacing: '0.14em', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
                      {displayCard?.cardNo}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginBottom: 2, letterSpacing: '0.08em' }}>{t('cardHolder').toUpperCase()}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white', textTransform: 'uppercase' }}>{displayCard?.holderName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginBottom: 2, letterSpacing: '0.08em' }}>{t('cardExpiry').toUpperCase()}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{displayCard?.expiryDate}</div>
                      </div>
                      <svg width="48" height="30" viewBox="0 0 50 32" fill="none">
                        <circle cx="18" cy="16" r="16" fill="rgba(255,255,255,0.28)"/>
                        <circle cx="32" cy="16" r="16" fill="rgba(255,255,255,0.16)"/>
                      </svg>
                    </div>
                  </div>
                </div>
                ) : (
                <div
                  className="flex flex-col justify-between overflow-hidden"
                  style={{
                    width: '100%', height: '100%',
                    background: isLocked
                      ? 'linear-gradient(135deg,#2A2A2A,#111111)'
                      : 'linear-gradient(135deg,#1A1A1A,#000000)',
                    borderRadius: 20,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  }}
                >
                  {/* Magnetic stripe */}
                  <div style={{ background: '#0F172A', height: 44, width: '100%', marginTop: 24 }} />

                  {/* Signature + CVV strip */}
                  <div className="flex items-center gap-3 px-5">
                    <div style={{ flex: 1, height: 36, borderRadius: 4, background: 'repeating-linear-gradient(90deg,#fff 0,#fff 3px,#f1f5f9 3px,#f1f5f9 6px)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                      <span style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic', letterSpacing: '0.05em' }}>AUTHORIZED SIGNATURE</span>
                    </div>
                    <div style={{ minWidth: 52, height: 36, borderRadius: 6, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 500 }}>CVV</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', letterSpacing: '0.1em' }}>•••</span>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between px-5 pb-5">
                    <div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginBottom: 3, letterSpacing: '0.08em' }}>CARD NUMBER</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>{displayCard?.cardNo}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>VIRTUAL CARD</div>
                      <svg width="42" height="26" viewBox="0 0 50 32" fill="none">
                        <circle cx="18" cy="16" r="16" fill="rgba(255,255,255,0.22)"/>
                        <circle cx="32" cy="16" r="16" fill="rgba(255,255,255,0.13)"/>
                      </svg>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Flip hint */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                  {showBack
                    ? (lang === 'ru' ? 'нажмите, чтобы вернуть' : 'tap to flip back')
                    : (lang === 'ru' ? 'нажмите на карту, чтобы увидеть CVV' : 'tap card to see CVV')}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 12 }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{t('cardBalance')}</span>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLocked ? '#9CA3AF' : '#10B981', boxShadow: isLocked ? 'none' : '0 0 5px rgba(16,185,129,0.5)' }} />
                  <span style={{ fontSize: 12, color: isLocked ? '#9CA3AF' : '#10B981', fontWeight: 500 }}>
                    {isLocked ? t('cardFrozen') : t('cardActive')}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {(displayBalance?.balance ?? 0).toFixed(2)}{' '}
                <span style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 400 }}>{displayBalance?.currency || 'USD'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setShowTopUp(true)}
                disabled={isLocked}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-40"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
              >
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{t('topUp')}</span>
              </button>

              {/* Freeze — only lock is supported; unlock pending CardPlus response */}
              <button
                onClick={handleLock}
                disabled={isLocked || lockMutation.isPending}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-40"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
              >
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '50%', background: isLocked ? '#F3F4F6' : '#FEF2F2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isLocked ? '#9CA3AF' : '#DC2626'} strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
                  {isLocked ? t('cardFrozen') : t('freeze')}
                </span>
              </button>
            </div>

            {/* Unlock note when frozen */}
            {isLocked && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl mb-4" style={{ background: '#F3F4F6' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {lang === 'ru'
                    ? 'Разморозка карты временно недоступна — обратитесь в поддержку'
                    : 'Card unfreeze is temporarily unavailable — contact support'}
                </span>
              </div>
            )}

            {/* Top up form */}
            {showTopUp && (
              <div className="mb-4" style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{t('topUpCard')}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                  {lang === 'ru' ? `Доступно: ${usdtBalance.toFixed(2)} USDT` : `Available: ${usdtBalance.toFixed(2)} USDT`}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 outline-none"
                    style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 16, fontWeight: 600, color: '#111827', caretColor: '#2563EB' }}
                  />
                  <button
                    onClick={handleTopUp}
                    disabled={topUpMutation.isPending}
                    className="px-5 py-3 rounded-xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-60"
                    style={{ background: '#2563EB', border: 'none', fontSize: 14 }}
                  >
                    {topUpMutation.isPending ? '...' : t('topUp')}
                  </button>
                  <button
                    onClick={() => { setShowTopUp(false); setTopUpAmount('') }}
                    className="px-4 py-3 rounded-xl font-semibold active:opacity-70"
                    style={{ background: '#F3F4F6', color: '#374151', border: 'none', fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {topUpSuccess && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl mb-4" style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>{t('success')}</span>
              </div>
            )}

            {/* KYC upgrade banner */}
            <div
              className="flex items-center justify-between gap-3 mb-4"
              style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius: 16, padding: '14px 16px', border: '1px solid #BFDBFE' }}
            >
              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>
                    {lang === 'ru' ? 'Увеличьте лимит карты' : 'Increase card limit'}
                  </div>
                  <div style={{ fontSize: 12, color: '#3B82F6' }}>
                    {lang === 'ru' ? 'Для увеличения лимита пройдите KYC' : 'Complete KYC to increase limit'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/kyc')}
                style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {lang === 'ru' ? 'Пройти' : 'Start'}
              </button>
            </div>

            {/* Transactions */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{t('cardTransactions')}</div>
              {displayTransactions.length === 0 ? (
                <div className="flex flex-col items-center py-10" style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{ background: '#F3F4F6' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>{t('noCardTransactions')}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayTransactions.map(tx => {
                    const isIn  = tx.transType === 'TOPUP' || tx.transType === 'REFUND'
                    const color = tx.status === 'FAILED' ? '#DC2626' : isIn ? '#059669' : '#DC2626'
                    const bg    = tx.status === 'FAILED' ? '#FEF2F2' : isIn ? '#ECFDF5' : '#FEF2F2'
                    return (
                      <div key={tx.transId} className="flex items-center gap-3" style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '14px 16px' }}>
                        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 14, background: bg }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isIn
                              ? <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                              : <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>}
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                            {tx.merchantName || transLabel(tx.transType, lang)}
                          </div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                            {new Date(tx.transTime).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
                          </div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
                          {isIn ? '+' : '-'}{tx.amount.toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card-face { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
      `}</style>
    </div>
  )
}

export default Card
