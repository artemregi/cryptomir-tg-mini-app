import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LanguageContext'
import { useProfile } from '../hooks/useProfile'
import { useKycStatus, useSubmitKyc, useResubmitKyc } from '../hooks/useKyc'
import { uploadKycPhoto } from '../api/endpoints'
import type { CPDocType } from '../types/cardplus'

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana',
  'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'UAE', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
]

const DOC_TYPES: { value: CPDocType; labelRu: string; labelEn: string }[] = [
  { value: 'PASSPORT', labelRu: 'Паспорт', labelEn: 'Passport' },
]

const isLatinOnly = (str: string) => /^[a-zA-Z\s\-'.]*$/.test(str)

const KYC: React.FC = () => {
  const navigate   = useNavigate()
  const { lang, t } = useLang()
  const { data: profile } = useProfile()
  const { data: kycInfo } = useKycStatus()
  const submitMutation    = useSubmitKyc()
  const resubmitMutation  = useResubmitKyc()
  const fileInputRef      = useRef<HTMLInputElement>(null)
  const activePhotoSlot   = useRef<number>(0)

  const kycStatus = kycInfo?.cardAccountStatus ?? 'NOT_SUBMITTED'
  const isResubmit = kycStatus === 'REJECTED' || kycStatus === 'REQUIRE_DOC_UPDATE'

  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [country, setCountry] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [docType, setDocType] = useState<CPDocType>('PASSPORT')
  const [docNumber, setDocNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [photos, setPhotos] = useState<(File | null)[]>([null, null])
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null])
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const [countrySearch, setCountrySearch] = useState('')
  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  )
  const finalCountry = country

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
    const slot = activePhotoSlot.current
    setPhotos(prev => { const next = [...prev]; next[slot] = file; return next })
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreviews(prev => { const next = [...prev]; next[slot] = ev.target?.result as string; return next })
    reader.readAsDataURL(file)
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  const openPhotoSlot = (slot: number) => {
    activePhotoSlot.current = slot
    fileInputRef.current?.click()
  }

  const removePhoto = (slot: number) => {
    setPhotos(prev => { const next = [...prev]; next[slot] = null; return next })
    setPhotoPreviews(prev => { const next = [...prev]; next[slot] = null; return next })
  }

  const handleSubmit = async () => {
    setValidationError('')

    if (!firstName.trim() || !lastName.trim()) {
      setValidationError(lang === 'ru' ? 'Введите имя и фамилию' : 'Enter first and last name')
      return
    }
    if (!isLatinOnly(firstName) || !isLatinOnly(lastName)) {
      setValidationError(lang === 'ru'
        ? 'Имя и фамилия должны быть написаны латинскими буквами (как в паспорте)'
        : 'First and last name must be in Latin letters (as in your passport)')
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
    const uploadedPhotos = photos.filter(Boolean) as File[]
    if (uploadedPhotos.length === 0) {
      setValidationError(lang === 'ru' ? 'Загрузите хотя бы одно фото документа' : 'Upload at least one document photo')
      return
    }

    let photoUrls: string[]
    try {
      setUploading(true)
      photoUrls = await Promise.all(uploadedPhotos.map(f => uploadKycPhoto(f).then(r => r.url)))
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
      photos:      photoUrls.join(','),
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
              <label style={labelStyle}>{lang === 'ru' ? 'Имя (латиницей)' : 'First name (Latin)'} *</label>
              <input
                style={{ ...inputStyle, border: `1.5px solid ${firstName && !isLatinOnly(firstName) ? '#DC2626' : '#E5E7EB'}` }}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="John"
              />
              {firstName && !isLatinOnly(firstName) && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4, fontWeight: 500 }}>
                  {lang === 'ru' ? '⚠️ Только латинские буквы, как в паспорте' : '⚠️ Latin letters only, as in your passport'}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Фамилия (латиницей)' : 'Last name (Latin)'} *</label>
              <input
                style={{ ...inputStyle, border: `1.5px solid ${lastName && !isLatinOnly(lastName) ? '#DC2626' : '#E5E7EB'}` }}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Smith"
              />
              {lastName && !isLatinOnly(lastName) && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4, fontWeight: 500 }}>
                  {lang === 'ru' ? '⚠️ Только латинские буквы, как в паспорте' : '⚠️ Latin letters only, as in your passport'}
                </p>
              )}
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
            <div className="mb-3" style={{ borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #F3F4F6' }}>
                <input
                  style={{ width: '100%', fontSize: 14, border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', outline: 'none', background: '#F9FAFB', color: '#111827' }}
                  placeholder={lang === 'ru' ? 'Поиск страны...' : 'Search country...'}
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                {filteredCountries.length > 0 ? filteredCountries.map((c) => (
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
                    onClick={() => { setCountry(c); setShowCountryList(false); setCountrySearch('') }}
                  >
                    {c}
                  </div>
                )) : (
                  <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 500, lineHeight: 1.6 }}>
                      {lang === 'ru'
                        ? 'Если вашей страны нет в списке для прохождения KYC, пожалуйста, свяжитесь с поддержкой.'
                        : 'If your country is not in the KYC list, please contact support.'}
                    </p>
                    <button
                      onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/angelinaadminka')}
                      style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '8px 16px', borderRadius: 10, border: 'none' }}
                    >
                      {lang === 'ru' ? 'Написать в поддержку' : 'Contact support'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Document */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            {lang === 'ru' ? 'Документ' : 'Document'}
          </div>
          <div className="space-y-4">
            {/* Doc type — Passport only */}
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Тип документа' : 'Document type'}</label>
              <div
                style={{ background: '#F9FAFB', border: '1.5px solid #2563EB', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontWeight: 600, color: '#2563EB' }}
              >
                {lang === 'ru' ? 'Паспорт' : 'Passport'}
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

        {/* Photo upload — one per page */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            {lang === 'ru' ? 'Фото документа' : 'Document photos'} *
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
            {lang === 'ru' ? 'Загрузите каждую страницу по отдельности' : 'Upload each page separately'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
          <div className="space-y-3">
            {[0, 1].map(slot => (
              <div key={slot}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                  {lang === 'ru' ? `Страница ${slot + 1}${slot === 0 ? ' *' : ' (необязательно)'}` : `Page ${slot + 1}${slot === 0 ? ' *' : ' (optional)'}`}
                </div>
                {photoPreviews[slot] ? (
                  <div>
                    <div className="relative" style={{ borderRadius: 14, overflow: 'hidden' }}>
                      <img
                        src={photoPreviews[slot]!}
                        alt={`Page ${slot + 1}`}
                        className="w-full object-cover"
                        style={{ maxHeight: 160, display: 'block' }}
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openPhotoSlot(slot)}
                        className="flex-1 py-2.5 rounded-xl font-semibold"
                        style={{ background: '#F3F4F6', color: '#374151', fontSize: 13, border: 'none' }}
                      >
                        {lang === 'ru' ? 'Заменить' : 'Replace'}
                      </button>
                      <button
                        onClick={() => removePhoto(slot)}
                        className="py-2.5 px-4 rounded-xl font-semibold"
                        style={{ background: '#FEF2F2', color: '#DC2626', fontSize: 13, border: 'none' }}
                      >
                        {lang === 'ru' ? 'Удалить' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center cursor-pointer active:opacity-70"
                    style={{ border: '2px dashed #E5E7EB', borderRadius: 14, padding: 24 }}
                    onClick={() => openPhotoSlot(slot)}
                  >
                    <div className="flex items-center justify-center mb-2" style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>{lang === 'ru' ? 'Загрузить фото' : 'Upload photo'}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>JPG, PNG {lang === 'ru' ? 'или' : 'or'} PDF</span>
                  </div>
                )}
              </div>
            ))}
          </div>
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
