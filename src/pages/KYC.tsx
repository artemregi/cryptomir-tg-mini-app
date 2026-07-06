import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LanguageContext'
import { useProfile } from '../hooks/useProfile'
import { useKycStatus, useSubmitKyc, useResubmitKyc } from '../hooks/useKyc'
import { uploadKycPhoto } from '../api/endpoints'
import type { CPDocType } from '../types/cardplus'

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

const DOC_TYPES: { value: CPDocType; labelRu: string; labelEn: string }[] = [
  { value: 'PASSPORT',         labelRu: 'Паспорт',              labelEn: 'Passport' },
  { value: 'ID_CARD',          labelRu: 'Удостоверение личности', labelEn: 'ID Card' },
  { value: 'DRIVING_LICENSE',  labelRu: 'Водительское удостоверение', labelEn: 'Driver\'s License' },
]

const KYC: React.FC = () => {
  const navigate   = useNavigate()
  const { lang, t } = useLang()
  const { data: profile } = useProfile()
  const { data: kycInfo } = useKycStatus()
  const submitMutation    = useSubmitKyc()
  const resubmitMutation  = useResubmitKyc()
  const fileInputRef      = useRef<HTMLInputElement>(null)

  const kycStatus = kycInfo?.cardAccountStatus ?? 'NOT_SUBMITTED'
  const isResubmit = kycStatus === 'REJECTED' || kycStatus === 'REQUIRE_DOC_UPDATE'

  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [country, setCountry] = useState('')
  const [customCountry, setCustomCountry] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [docType, setDocType] = useState<CPDocType>('PASSPORT')
  const [docNumber, setDocNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const countries = lang === 'ru' ? COUNTRIES_RU : COUNTRIES_EN
  const isOther = country === countries[countries.length - 1]
  const finalCountry = isOther ? customCountry : country

  // Prefill name from profile
  useEffect(() => {
    if (profile) {
      const parts = (profile.full_name || '').split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
  }, [profile])

  // If already approved or pending — show status screen
  useEffect(() => {
    if (kycStatus === 'APPROVED' || kycStatus === 'PENDING_REVIEW') {
      setStep('sent')
    }
  }, [kycStatus])

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

    if (!firstName.trim() || !lastName.trim()) {
      setValidationError(lang === 'ru' ? 'Введите имя и фамилию' : 'Enter first and last name')
      return
    }
    if (!birthDate) {
      setValidationError(lang === 'ru' ? 'Введите дату рождения' : 'Enter date of birth')
      return
    }
    if (!finalCountry) {
      setValidationError(lang === 'ru' ? 'Выберите страну' : 'Select country')
      return
    }
    if (!docNumber.trim()) {
      setValidationError(lang === 'ru' ? 'Введите номер документа' : 'Enter document number')
      return
    }
    if (!photo) {
      setValidationError(lang === 'ru' ? 'Загрузите фото документа' : 'Upload document photo')
      return
    }

    let photoUrl: string
    try {
      setUploading(true)
      const result = await uploadKycPhoto(photo)
      photoUrl = result.url
    } catch {
      setUploading(false)
      setValidationError(lang === 'ru' ? 'Ошибка загрузки фото. Попробуйте снова.' : 'Photo upload failed. Please try again.')
      return
    } finally {
      setUploading(false)
    }

    const params = {
      email:       profile?.email || '',
      firstName:   firstName.trim(),
      lastName:    lastName.trim(),
      birthDate,
      nationality: finalCountry,
      docType,
      docNumber:   docNumber.trim(),
      photos:      photoUrl,
      phone:       '',
    }

    const mutate = isResubmit ? resubmitMutation.mutate : submitMutation.mutate
    mutate(params, {
      onSuccess: () => {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
        setStep('sent')
      },
      onError: () => {
        setValidationError(lang === 'ru' ? 'Ошибка отправки. Попробуйте снова.' : 'Submission error. Please try again.')
      },
    })
  }

  const isPending = uploading || submitMutation.isPending || resubmitMutation.isPending

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

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 6, display: 'block',
  }

  // ── Status screen ──
  if (step === 'sent') {
    const isApproved = kycStatus === 'APPROVED'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: isApproved ? '#ECFDF5' : '#EFF6FF',
            border: `2px solid ${isApproved ? '#A7F3D0' : '#BFDBFE'}`,
          }}
        >
          {isApproved ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>
          {isApproved
            ? (lang === 'ru' ? 'KYC подтверждён!' : 'KYC approved!')
            : t('kycSent')}
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
          {isApproved
            ? (lang === 'ru' ? 'Вы можете выпустить виртуальную карту.' : 'You can now issue a virtual card.')
            : t('kycSentDesc')}
        </p>
        <button
          onClick={() => navigate(isApproved ? '/card' : '/profile')}
          className="w-full py-4 rounded-2xl font-semibold text-white"
          style={{ background: '#2563EB', fontSize: 15, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
        >
          {isApproved
            ? (lang === 'ru' ? 'Выпустить карту' : 'Issue card')
            : t('back')}
        </button>
      </div>
    )
  }

  // ── Form ──
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

        {/* Rejection reason */}
        {isResubmit && kycInfo?.rejectReason && (
          <div className="flex items-start gap-2.5 p-4 rounded-2xl mb-4" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 13, color: '#DC2626' }}>
              {lang === 'ru' ? 'Причина отказа: ' : 'Rejection reason: '}{kycInfo.rejectReason}
            </p>
          </div>
        )}

        {/* Personal info */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {lang === 'ru' ? 'Личные данные' : 'Personal info'}
          </div>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Имя' : 'First name'} *</label>
              <input
                style={inputStyle}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder={lang === 'ru' ? 'Иван' : 'John'}
              />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Фамилия' : 'Last name'} *</label>
              <input
                style={inputStyle}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder={lang === 'ru' ? 'Иванов' : 'Smith'}
              />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Дата рождения' : 'Date of birth'} *</label>
              <input
                style={inputStyle}
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Country */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {t('country')}
          </div>
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
          {showCountryList && (
            <div className="overflow-y-auto mb-3" style={{ maxHeight: 220, borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#FFFFFF' }}>
              {countries.map((c) => (
                <div
                  key={c}
                  className="px-4 py-3 cursor-pointer"
                  style={{
                    fontSize: 14,
                    color: c === country ? '#2563EB' : '#111827',
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
          {isOther && (
            <input
              style={inputStyle}
              value={customCountry}
              onChange={e => setCustomCountry(e.target.value)}
              placeholder={t('enterCountry')}
            />
          )}
        </div>

        {/* Document */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {lang === 'ru' ? 'Документ' : 'Document'}
          </div>
          <div className="space-y-4">
            {/* Doc type */}
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Тип документа' : 'Document type'} *</label>
              <div className="flex gap-2">
                {DOC_TYPES.map(dt => (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className="flex-1 py-2.5 rounded-xl text-center transition-all"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      background: docType === dt.value ? '#EFF6FF' : '#F9FAFB',
                      color: docType === dt.value ? '#2563EB' : '#6B7280',
                      boxShadow: docType === dt.value ? '0 0 0 1.5px #2563EB' : '0 0 0 1.5px #E5E7EB',
                    }}
                  >
                    {lang === 'ru' ? dt.labelRu.split(' ')[0] : dt.labelEn.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Номер документа' : 'Document number'} *</label>
              <input
                style={{ ...inputStyle, border: `1.5px solid ${docNumber ? '#2563EB' : '#E5E7EB'}` }}
                value={docNumber}
                onChange={e => setDocNumber(e.target.value.toUpperCase())}
                placeholder={lang === 'ru' ? '1234 567890' : '1234 567890'}
                maxLength={30}
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
              <span style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>JPG, PNG {lang === 'ru' ? 'или' : 'or'} PDF</span>
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
          disabled={isPending}
          className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-60"
          style={{ background: '#2563EB', fontSize: 16, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {uploading
                ? (lang === 'ru' ? 'Загрузка фото...' : 'Uploading photo...')
                : t('loading')}
            </span>
          ) : isResubmit
            ? (lang === 'ru' ? 'Отправить повторно' : 'Resubmit')
            : t('sendKYC')}
        </button>
      </div>
    </div>
  )
}

export default KYC
