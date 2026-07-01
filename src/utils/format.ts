// Number formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'RUB',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2
): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

export const formatRUB = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatUSDT = (amount: number): string => {
  return `${formatNumber(amount, 2)} USDT`
}

export const formatNumber = (
  value: number,
  decimals: number = 2,
  maxDecimals?: number
): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: maxDecimals ?? decimals,
  }).format(value)
}

export const formatCompact = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return formatNumber(value, 2)
}

// Address formatting
export const shortenAddress = (address: string, chars: number = 6): string => {
  if (!address || address.length < chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export const isValidTronAddress = (address: string): boolean => {
  return /^T[a-zA-Z0-9]{33}$/.test(address)
}

// Date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  if (diffDays === 1) {
    return 'Вчера'
  }
  if (diffDays < 7) {
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date)
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

export const formatDateGroup = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) {
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date)
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: diffDays > 365 ? 'numeric' : undefined,
  }).format(date)
}

// Amount with sign
export const formatAmountWithSign = (amount: number, type: 'send' | 'top_up'): string => {
  const sign = type === 'send' ? '-' : '+'
  return `${sign}${formatNumber(amount, 2)} USDT`
}
