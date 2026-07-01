import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useLang } from '../contexts/LanguageContext'

const KYC_STATUS_KEY = 'cryptomir_kyc_status'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { lang, toggle, t } = useLang()

  const kycStatus = localStorage.getItem(KYC_STATUS_KEY) || 'none' // none | pending | verified

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    const stored = JSON.parse(localStorage.getItem('cryptomir_profile_form') || '{}')
    setForm({
      firstName: stored.firstName || profile?.first_name || tgUser?.first_name || '',
      lastName: stored.lastName || profile?.last_name || tgUser?.last_name || '',
      email: stored.email || '',
      phone: stored.phone || '',
      username: stored.username || tgUser?.username || '',
    })
  }, [profile])

  const handleSave = () => {
    localStorage.setItem('cryptomir_profile_form', JSON.stringify(form))
    setSaved(true)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = () => {
    window.Telegram?.WebApp?.showConfirm(t('logoutConfirm'), (ok) => {
      if (ok) {
        localStorage.clear()
        window.Telegram?.WebApp?.close()
      }
    })
  }

  const handleBack = useCallback(() => navigate('/'), [navigate])

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(handleBack)
    return () => {
      window.Telegram?.WebApp?.BackButton?.offClick(handleBack)
      window.Telegram?.WebApp?.BackButton?.hide()
    }
  }, [handleBack])

  const kycColor = kycStatus === 'verified' ? '#059669' : kycStatus === 'pending' ? '#D97706' : '#9CA3AF'
  const kycBg = kycStatus === 'verified' ? '#ECFDF5' : kycStatus === 'pending' ? '#FFFBEB' : '#F3F4F6'
  const kycLabel = kycStatus === 'verified' ? t('verified') : kycStatus === 'pending' ? t('pending') : t('notVerified')

  const inputStyle = {
    background: '#F9FAFB',
    border: '1.5px solid #E5E7EB',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 15,
    color: '#111827',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 6, display: 'block' } as React.CSSProperties

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className="flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-70"
            style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={handleBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{t('profileTitle')}</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg,#BFDBFE,#93C5FD)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
            {form.firstName || form.username || 'Пользователь'}
          </div>
          {form.username && (
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>@{form.username}</div>
          )}
        </div>

        {/* KYC Status */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl mb-4 cursor-pointer active:opacity-70"
          style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          onClick={() => navigate('/kyc')}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: kycBg }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={kycColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                {kycStatus === 'verified' && <polyline points="9 12 11 14 15 10"/>}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{t('kyc')}</div>
              <div style={{ fontSize: 12, color: kycColor, fontWeight: 500 }}>{kycLabel}</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* Profile form */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {t('profileTitle')}
          </div>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>{t('firstName')}</label>
              <input style={inputStyle} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder={t('firstName')} />
            </div>
            <div>
              <label style={labelStyle}>{t('lastName')}</label>
              <input style={inputStyle} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder={t('lastName')} />
            </div>
            <div>
              <label style={labelStyle}>{t('email')}</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div>
              <label style={labelStyle}>{t('phone')}</label>
              <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 000 000 00 00" />
            </div>
            <div>
              <label style={labelStyle}>{t('username')}</label>
              <input style={inputStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="@username" />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full mt-5 py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform"
            style={{ background: saved ? '#059669' : '#2563EB', fontSize: 15, border: 'none', boxShadow: saved ? '0 6px 20px rgba(5,150,105,0.35)' : '0 6px 20px rgba(37,99,235,0.35)' }}
          >
            {saved ? '✓ ' + t('profileSaved') : t('save')}
          </button>
        </div>

        {/* Language + Support */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16, overflow: 'hidden' }}>
          {/* Language toggle */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer active:opacity-70"
            style={{ borderBottom: '1px solid #F3F4F6' }}
            onClick={toggle}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{t('language')}</span>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: '#EFF6FF' }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{lang === 'ru' ? 'RU' : 'EN'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Support */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer active:opacity-70"
            onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/angelinaadminka')}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: '#F0FDF4' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{t('contactSupport')}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-semibold active:opacity-70 transition-opacity"
          style={{ background: '#FEF2F2', color: '#DC2626', fontSize: 15, border: 'none' }}
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default Profile
