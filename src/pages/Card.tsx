import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBalance } from '../hooks/useBalance'
import { useLang } from '../contexts/LanguageContext'

const KYC_STATUS_KEY = 'cryptomir_kyc_status'
const CARD_KEY = 'cryptomir_card'

interface CardData {
  number: string
  expiry: string
  cvv: string
  holder: string
  balance: number
  frozen: boolean
  issued: boolean
  transactions: Array<{ id: string; label: string; amount: number; date: string; type: 'in' | 'out' }>
}

function generateCard(holder: string): CardData {
  const n = () => Math.floor(1000 + Math.random() * 9000)
  return {
    number: `5365 ${n()} ${n()} ${n()}`,
    expiry: '12/27',
    cvv: String(Math.floor(100 + Math.random() * 900)),
    holder: holder.toUpperCase() || 'CARDHOLDER',
    balance: 0,
    frozen: false,
    issued: true,
    transactions: [],
  }
}

const Card: React.FC = () => {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const { data: balance } = useBalance()

  const kycStatus = localStorage.getItem(KYC_STATUS_KEY) || 'none'
  const kycPassed = kycStatus === 'verified' || kycStatus === 'pending'

  const [card, setCard] = useState<CardData | null>(() => {
    const saved = localStorage.getItem(CARD_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [showCVV, setShowCVV] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpSuccess, setTopUpSuccess] = useState(false)

  const saveCard = (c: CardData) => {
    setCard(c)
    localStorage.setItem(CARD_KEY, JSON.stringify(c))
  }

  const handleIssueCard = () => {
    const profile = JSON.parse(localStorage.getItem('cryptomir_profile_form') || '{}')
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    const holder = `${profile.firstName || tgUser?.first_name || 'USER'} ${profile.lastName || tgUser?.last_name || ''}`.trim()
    const newCard = generateCard(holder)
    saveCard(newCard)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
  }

  const handleFreeze = () => {
    if (!card) return
    const updated = { ...card, frozen: !card.frozen }
    saveCard(updated)
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
  }

  const handleTopUp = () => {
    if (!card || !topUpAmount) return
    const amount = parseFloat(topUpAmount)
    if (isNaN(amount) || amount <= 0) return
    const usdtBal = balance?.balances?.find(b => b.currency === 'USDT' || b.symbol === 'USDT')
    if ((usdtBal?.amount || 0) < amount) {
      window.Telegram?.WebApp?.showAlert(lang === 'ru' ? 'Недостаточно средств в кошельке' : 'Insufficient wallet balance')
      return
    }
    const tx = {
      id: Date.now().toString(),
      label: lang === 'ru' ? 'Пополнение с кошелька' : 'Top up from wallet',
      amount,
      date: new Date().toISOString(),
      type: 'in' as const,
    }
    const updated = { ...card, balance: card.balance + amount, transactions: [tx, ...card.transactions] }
    saveCard(updated)
    setTopUpAmount('')
    setShowTopUp(false)
    setTopUpSuccess(true)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    setTimeout(() => setTopUpSuccess(false), 3000)
  }

  // Mask card number
  const maskedNumber = card ? card.number.replace(/(\d{4} \d{4}) (\d{4}) (\d{4})/, '$1 **** ****') : ''

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 24 }}>{t('cardTitle')}</h1>

        {/* === NOT ISSUED === */}
        {!card?.issued && (
          <>
            {/* Card visual placeholder */}
            <div
              className="relative overflow-hidden mb-6 flex flex-col justify-between"
              style={{ background: 'linear-gradient(135deg,#D1D5DB,#9CA3AF)', borderRadius: 20, padding: '24px 24px 20px', height: 190, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            >
              <div style={{ width: 40, height: 30, background: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', marginBottom: 8 }}>
                  •••• •••• •••• ••••
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{t('cardNotIssued').toUpperCase()}</div>
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

              {!kycPassed ? (
                <>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-4 text-left" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#D97706', fontWeight: 500 }}>{t('kycRequiredForCard')}</span>
                  </div>
                  <button
                    onClick={() => navigate('/kyc')}
                    className="w-full py-4 rounded-2xl font-semibold text-white"
                    style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
                  >
                    {t('completeKYC')}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleIssueCard}
                  className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform"
                  style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
                >
                  {t('issueCard')}
                </button>
              )}
            </div>
          </>
        )}

        {/* === ISSUED === */}
        {card?.issued && (
          <>
            {/* Card visual */}
            <div
              className="relative overflow-hidden mb-4 flex flex-col justify-between"
              style={{
                background: card.frozen
                  ? 'linear-gradient(135deg,#6B7280,#374151)'
                  : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                borderRadius: 20, padding: '24px 24px 20px', height: 190,
                boxShadow: card.frozen ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(37,99,235,0.35)',
                filter: card.frozen ? 'grayscale(0.3)' : 'none',
              }}
            >
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

              <div className="flex items-center justify-between relative z-10">
                <div style={{ width: 40, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: 4 }} />
                {card.frozen && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{t('cardFrozen')}</span>
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <div style={{ fontSize: 19, fontWeight: 600, color: 'white', letterSpacing: '0.12em', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
                  {maskedNumber}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{t('cardHolder').toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{card.holder}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{t('cardExpiry').toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{card.expiry}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>CVV</div>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}
                      onClick={() => setShowCVV(!showCVV)}
                    >
                      {showCVV ? card.cvv : '•••'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mastercard logo */}
              <div className="absolute right-5 bottom-5 z-10">
                <svg width="48" height="30" viewBox="0 0 50 32" fill="none">
                  <circle cx="18" cy="16" r="16" fill="rgba(255,255,255,0.25)"/>
                  <circle cx="32" cy="16" r="16" fill="rgba(255,255,255,0.15)"/>
                </svg>
              </div>
            </div>

            {/* Balance + status */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 12 }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{t('cardBalance')}</span>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: card.frozen ? '#9CA3AF' : '#10B981', boxShadow: card.frozen ? 'none' : '0 0 5px rgba(16,185,129,0.5)' }} />
                  <span style={{ fontSize: 12, color: card.frozen ? '#9CA3AF' : '#10B981', fontWeight: 500 }}>
                    {card.frozen ? t('cardFrozen') : t('cardActive')}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {card.balance.toFixed(2)} <span style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 400 }}>USDT</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setShowTopUp(true)}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl active:scale-95 transition-transform"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
              >
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{t('topUp')}</span>
              </button>
              <button
                onClick={handleFreeze}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl active:scale-95 transition-transform"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
              >
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '50%', background: card.frozen ? '#F0FDF4' : '#FEF2F2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={card.frozen ? '#059669' : '#DC2626'} strokeWidth="2" strokeLinecap="round">
                    {card.frozen ? <polyline points="20 6 9 17 4 12"/> : <><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>}
                  </svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
                  {card.frozen ? t('unfreeze') : t('freeze')}
                </span>
              </button>
            </div>

            {/* Top up modal */}
            {showTopUp && (
              <div className="mb-4" style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{t('topUpCard')}</div>
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
                    className="px-5 py-3 rounded-xl font-semibold text-white active:scale-95 transition-transform"
                    style={{ background: '#2563EB', border: 'none', fontSize: 14 }}
                  >
                    {t('topUp')}
                  </button>
                  <button
                    onClick={() => setShowTopUp(false)}
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

            {/* Transactions */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{t('cardTransactions')}</div>
              {card.transactions.length === 0 ? (
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
                  {card.transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3" style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '14px 16px' }}>
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 14, background: tx.type === 'in' ? '#ECFDF5' : '#FEF2F2' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tx.type === 'in' ? '#059669' : '#DC2626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {tx.type === 'in' ? <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></> : <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>}
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{tx.label}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{new Date(tx.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: tx.type === 'in' ? '#059669' : '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                        {tx.type === 'in' ? '+' : '-'}{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Card
