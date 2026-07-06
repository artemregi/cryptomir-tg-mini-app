import React from 'react'
import { useLang } from '../contexts/LanguageContext'

const Auth: React.FC = () => {
  const { lang } = useLang()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F0F4FA' }}>
      <div
        className="flex items-center justify-center mb-6"
        style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
          <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
          <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', marginBottom: 8 }}>
        CryptoMIR
      </h1>

      <p style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
        {lang === 'ru'
          ? 'Откройте приложение через Telegram-бота'
          : 'Please open this app via Telegram bot'}
      </p>

      <div
        className="flex items-center gap-2.5 mt-8 px-5 py-3.5 rounded-2xl"
        style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: 13, color: '#1D4ED8', fontWeight: 500 }}>
          {lang === 'ru' ? 'Авторизация через Telegram' : 'Telegram authentication required'}
        </span>
      </div>
    </div>
  )
}

export default Auth
