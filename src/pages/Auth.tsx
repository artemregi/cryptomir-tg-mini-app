import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp, signUpVerify, signIn, signInVerify } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import { useLang } from '../contexts/LanguageContext'

type Mode = 'login' | 'register'
type Step = 'form' | 'otp'

const Auth: React.FC = () => {
  const navigate = useNavigate()
  const { lang } = useLang()

  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<Step>('form')

  // Form fields
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')

  // Action token from sign_in step 1
  const [actionToken, setActionToken] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#6B7280',
    marginBottom: 6,
    display: 'block',
  }

  const handleLoginSubmit = async () => {
    setError('')
    if (!email.trim() || !password.trim()) {
      setError(lang === 'ru' ? 'Заполните все поля' : 'Fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await signIn(email.trim(), password)
      setActionToken(res.token)
      setStep('otp')
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError(lang === 'ru' ? 'Неверный email или пароль' : 'Invalid email or password')
      } else {
        setError(lang === 'ru' ? 'Ошибка соединения' : 'Connection error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoginOtp = async () => {
    setError('')
    if (code.trim().length < 4) {
      setError(lang === 'ru' ? 'Введите код из письма' : 'Enter the code from email')
      return
    }
    setLoading(true)
    try {
      const tokens = await signInVerify(email.trim(), code.trim(), actionToken)
      tokenStorage.set(tokens.access_token, tokens.refresh_token)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      navigate('/', { replace: true })
    } catch {
      setError(lang === 'ru' ? 'Неверный код. Попробуйте снова' : 'Wrong code. Try again')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async () => {
    setError('')
    if (!email.trim() || !username.trim()) {
      setError(lang === 'ru' ? 'Заполните все поля' : 'Fill in all fields')
      return
    }
    setLoading(true)
    try {
      await signUp(email.trim(), username.trim())
      setStep('otp')
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } }
      if (err.response?.status === 409) {
        setError(lang === 'ru' ? 'Этот email или username уже занят' : 'Email or username already taken')
      } else {
        setError(lang === 'ru' ? 'Ошибка соединения' : 'Connection error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterOtp = async () => {
    setError('')
    if (code.trim().length < 4) {
      setError(lang === 'ru' ? 'Введите код из письма' : 'Enter the code from email')
      return
    }
    if (!password || password.length < 8) {
      setError(lang === 'ru' ? 'Пароль должен быть не менее 8 символов' : 'Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError(lang === 'ru' ? 'Пароли не совпадают' : 'Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const tokens = await signUpVerify(email.trim(), code.trim(), password, username.trim())
      tokenStorage.set(tokens.access_token, tokens.refresh_token)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      navigate('/', { replace: true })
    } catch {
      setError(lang === 'ru' ? 'Неверный код. Попробуйте снова' : 'Wrong code. Try again')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setStep('form')
    setError('')
    setCode('')
    setPassword('')
    setConfirmPassword('')
  }

  const goBackToForm = () => {
    setStep('form')
    setError('')
    setCode('')
  }

  // OTP screen (shared between login and register)
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex flex-col px-5 pt-10 animate-fade-in" style={{ background: '#F0F4FA' }}>
        <button
          onClick={goBackToForm}
          className="flex items-center justify-center flex-shrink-0 active:opacity-70 mb-6"
          style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className="mb-8">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>
            {lang === 'ru' ? 'Код подтверждения' : 'Verification code'}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
            {lang === 'ru'
              ? `Мы отправили код на ${email}`
              : `We sent a code to ${email}`}
          </p>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Код из письма' : 'Code from email'}</label>
              <input
                style={{ ...inputStyle, fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: 8, border: `1.5px solid ${code ? '#2563EB' : '#E5E7EB'}` }}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={8}
                inputMode="numeric"
                autoFocus
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label style={labelStyle}>{lang === 'ru' ? 'Придумайте пароль' : 'Create password'} *</label>
                  <input
                    style={inputStyle}
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={lang === 'ru' ? 'Минимум 8 символов' : 'At least 8 characters'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'ru' ? 'Повторите пароль' : 'Confirm password'} *</label>
                  <input
                    style={inputStyle}
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={lang === 'ru' ? 'Повторите пароль' : 'Repeat password'}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl mb-4" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 13, color: '#DC2626' }}>{error}</p>
          </div>
        )}

        <button
          onClick={mode === 'login' ? handleLoginOtp : handleRegisterOtp}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: '#2563EB', fontSize: 16, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
            </span>
          ) : (lang === 'ru' ? 'Подтвердить' : 'Confirm')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-5 animate-fade-in" style={{ background: '#F0F4FA' }}>
      {/* Logo */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div
          className="flex items-center justify-center mb-4"
          style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em' }}>CryptoMIR</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>
          {lang === 'ru' ? 'Крипто кошелёк' : 'Crypto wallet'}
        </p>
      </div>

      {/* Mode tabs */}
      <div
        className="flex mb-6"
        style={{ background: '#E5E7EB', borderRadius: 14, padding: 4 }}
      >
        {(['login', 'register'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className="flex-1 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              background: mode === m ? '#FFFFFF' : 'transparent',
              color: mode === m ? '#111827' : '#6B7280',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            {m === 'login'
              ? (lang === 'ru' ? 'Войти' : 'Sign in')
              : (lang === 'ru' ? 'Регистрация' : 'Sign up')}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div style={{ background: '#FFFFFF', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 20, marginBottom: 16 }}>
        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              style={{ ...inputStyle, border: `1.5px solid ${email ? '#2563EB' : '#E5E7EB'}` }}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              inputMode="email"
              autoCapitalize="none"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Username' : 'Username'} *</label>
              <input
                style={inputStyle}
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="cryptouser"
                autoCapitalize="none"
              />
            </div>
          )}

          {mode === 'login' && (
            <div>
              <label style={labelStyle}>{lang === 'ru' ? 'Пароль' : 'Password'} *</label>
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl mb-4" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 13, color: '#DC2626' }}>{error}</p>
        </div>
      )}

      <button
        onClick={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-50"
        style={{ background: '#2563EB', fontSize: 16, border: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
          </span>
        ) : mode === 'login'
          ? (lang === 'ru' ? 'Войти' : 'Sign in')
          : (lang === 'ru' ? 'Получить код' : 'Get code')}
      </button>

      {mode === 'login' && (
        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
          {lang === 'ru' ? 'После входа придёт код подтверждения на email' : 'A confirmation code will be sent to your email'}
        </p>
      )}
      {mode === 'register' && (
        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
          {lang === 'ru' ? 'Мы отправим код подтверждения на ваш email' : 'We will send a confirmation code to your email'}
        </p>
      )}
    </div>
  )
}

export default Auth
