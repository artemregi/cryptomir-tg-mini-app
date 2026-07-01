import React, { createContext, useContext, useState, useCallback } from 'react'

export type Lang = 'ru' | 'en'

const translations = {
  ru: {
    // Nav
    home: 'Главная', card: 'Карта', exchange: 'Обмен', profile: 'Профиль',
    // Common
    save: 'Сохранить', cancel: 'Отмена', back: 'Назад', loading: 'Загрузка...',
    success: 'Успешно', error: 'Ошибка', send: 'Отправить', receive: 'Получить',
    history: 'История', balance: 'Баланс', assets: 'Активы', all: 'Все',
    soon: 'Скоро', active: 'Активен', copy: 'Скопировать', copied: 'Скопировано!',
    // Profile
    profileTitle: 'Профиль', firstName: 'Имя', lastName: 'Фамилия',
    email: 'Email', phone: 'Телефон', username: 'Username в Telegram',
    profileSaved: 'Профиль сохранён', logout: 'Выйти из профиля',
    logoutConfirm: 'Вы уверены, что хотите выйти?',
    language: 'Язык', kyc: 'KYC-верификация', support: 'Поддержка',
    contactSupport: 'Связаться с поддержкой',
    kycStatus: 'Статус KYC', notVerified: 'Не верифицирован',
    verified: 'Верифицирован', pending: 'На рассмотрении',
    // KYC
    kycTitle: 'Верификация KYC', kycDesc: 'Для доступа ко всем функциям подтвердите личность',
    country: 'Страна выдачи документа', selectCountry: 'Выберите страну',
    enterCountry: 'Введите страну вручную', passportSeries: 'Серия паспорта',
    passportNumber: 'Номер паспорта', uploadPhoto: 'Загрузить фото документа',
    photoUploaded: 'Фото загружено', changePhoto: 'Изменить фото',
    sendKYC: 'Отправить на верификацию', kycSent: 'Заявка отправлена!',
    kycSentDesc: 'Мы проверим ваши данные в течение 24 часов.',
    kycRequired: 'Для продолжения необходимо заполнить серию/номер паспорта и загрузить фото документа.',
    // Card
    cardTitle: 'Виртуальная Mastercard', cardNotIssued: 'Карта не выпущена',
    cardNotIssuedDesc: 'Выпустите виртуальную Mastercard для оплаты онлайн',
    issueCard: 'Выпустить карту', kycRequiredForCard: 'Для выпуска карты необходимо пройти KYC-верификацию',
    completeKYC: 'Пройти KYC', cardNumber: 'Номер карты', cardExpiry: 'Срок',
    cardCVV: 'CVV', cardHolder: 'Держатель карты', cardBalance: 'Баланс карты',
    topUp: 'Пополнить', freeze: 'Заморозить', unfreeze: 'Разморозить',
    cardFrozen: 'Карта заморожена', cardActive: 'Карта активна',
    topUpAmount: 'Сумма пополнения', topUpCard: 'Пополнить карту',
    cardTransactions: 'Операции по карте', noCardTransactions: 'Нет операций по карте',
    // Exchange
    exchangeTitle: 'Обмен', from: 'Отдаю', to: 'Получаю',
    rate: 'Курс', fee: 'Комиссия', total: 'Итого', exchangeBtn: 'Обменять',
    exchangeSuccess: 'Обмен выполнен!', selectAsset: 'Выбрать актив',
    // Wallet
    sendTitle: 'Отправить', receiveTitle: 'Получить',
    network: 'Сеть', address: 'Адрес', amount: 'Сумма',
    available: 'Доступно', max: 'MAX', networkFee: 'Комиссия сети',
    kytCheck: 'KYT-проверка', kytValid: 'Адрес проверен', kytInvalid: 'Адрес не прошёл проверку',
    kytPending: 'Проверяю адрес...', fundsSearch: 'Поиск по активам',
  },
  en: {
    // Nav
    home: 'Home', card: 'Card', exchange: 'Exchange', profile: 'Profile',
    // Common
    save: 'Save', cancel: 'Cancel', back: 'Back', loading: 'Loading...',
    success: 'Success', error: 'Error', send: 'Send', receive: 'Receive',
    history: 'History', balance: 'Balance', assets: 'Assets', all: 'All',
    soon: 'Soon', active: 'Active', copy: 'Copy', copied: 'Copied!',
    // Profile
    profileTitle: 'Profile', firstName: 'First name', lastName: 'Last name',
    email: 'Email', phone: 'Phone', username: 'Telegram username',
    profileSaved: 'Profile saved', logout: 'Log out',
    logoutConfirm: 'Are you sure you want to log out?',
    language: 'Language', kyc: 'KYC Verification', support: 'Support',
    contactSupport: 'Contact support',
    kycStatus: 'KYC status', notVerified: 'Not verified',
    verified: 'Verified', pending: 'Under review',
    // KYC
    kycTitle: 'KYC Verification', kycDesc: 'Verify your identity to unlock all features',
    country: 'Document issuing country', selectCountry: 'Select country',
    enterCountry: 'Enter country manually', passportSeries: 'Passport series',
    passportNumber: 'Passport number', uploadPhoto: 'Upload document photo',
    photoUploaded: 'Photo uploaded', changePhoto: 'Change photo',
    sendKYC: 'Submit for verification', kycSent: 'Application submitted!',
    kycSentDesc: 'We will review your details within 24 hours.',
    kycRequired: 'Please fill in passport number and upload document photo to continue.',
    // Card
    cardTitle: 'Virtual Mastercard', cardNotIssued: 'Card not issued',
    cardNotIssuedDesc: 'Issue a virtual Mastercard for online payments',
    issueCard: 'Issue card', kycRequiredForCard: 'KYC verification is required to issue a card',
    completeKYC: 'Complete KYC', cardNumber: 'Card number', cardExpiry: 'Expires',
    cardCVV: 'CVV', cardHolder: 'Cardholder', cardBalance: 'Card balance',
    topUp: 'Top up', freeze: 'Freeze', unfreeze: 'Unfreeze',
    cardFrozen: 'Card frozen', cardActive: 'Card active',
    topUpAmount: 'Top-up amount', topUpCard: 'Top up card',
    cardTransactions: 'Card transactions', noCardTransactions: 'No card transactions',
    // Exchange
    exchangeTitle: 'Exchange', from: 'You pay', to: 'You get',
    rate: 'Rate', fee: 'Fee', total: 'Total', exchangeBtn: 'Exchange',
    exchangeSuccess: 'Exchange complete!', selectAsset: 'Select asset',
    // Wallet
    sendTitle: 'Send', receiveTitle: 'Receive',
    network: 'Network', address: 'Address', amount: 'Amount',
    available: 'Available', max: 'MAX', networkFee: 'Network fee',
    kytCheck: 'KYT check', kytValid: 'Address verified', kytInvalid: 'Address failed KYT check',
    kytPending: 'Checking address...', fundsSearch: 'Search assets',
  },
}

type TranslationKey = keyof typeof translations.ru

interface LangContextType {
  lang: Lang
  toggle: () => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'ru',
  toggle: () => {},
  t: (k) => k,
})

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('cryptomir_lang')
    if (saved === 'en' || saved === 'ru') return saved
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code
    return tgLang === 'ru' ? 'ru' : 'ru' // default ru
  })

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'ru' ? 'en' : 'ru'
      localStorage.setItem('cryptomir_lang', next)
      return next
    })
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] ?? key
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
