// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback: (ok: boolean) => void) => void
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp?: string
  message?: string
}

// Profile
export interface Profile {
  id: string
  telegram_id: number
  first_name: string
  last_name?: string
  username?: string
  tron_address?: string
  wallet_address?: string
  created_at: string
}

export interface InitializeResponse {
  user: Profile
  tron_address?: string
  wallet_address?: string
  is_new: boolean
}

// Balance
export interface TokenBalance {
  currency: string
  symbol: string
  amount: number
  usdValue: number
}

export interface BalanceData {
  total: number
  currency: string
  symbol: string
  balances: TokenBalance[]
}

// Tokens
export interface Token {
  id: string
  name: string
  symbol: string
  balance: number | null
  price: number | null
  isActive: boolean
  icon?: string
}

// Transactions
export type TransactionType = 'send' | 'top_up'
export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency?: string
  symbol?: string
  chain?: string
  token?: string
  address?: string
  from_address?: string
  to_address?: string
  target_address?: string
  tx_hash?: string
  date: string
  created_at?: string
  updated_at?: string
  fee?: number
  network_fee?: number
  confirmations?: number
  required_confirmations?: number
}

export interface TransactionsPagination {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: TransactionsPagination
  // fallback aliases (in case API changes)
  items?: Transaction[]
  has_more?: boolean
}

// Networks
export interface NetworkConfig {
  id: string
  name: string
  symbol: string
  chain_id?: string
  fee: number
  fee_currency: string
  min_withdrawal: number
  max_withdrawal: number
  decimals: number
  explorer_url?: string
  is_active: boolean
}

// Withdrawal
export interface WithdrawalRequest {
  account_id: string
  to: string
  amount: number
  mode: string
}

export interface WithdrawalResponse {
  id: string
  status: TransactionStatus
  amount: number
  fee: number
  to: string
  tx_hash?: string
  created_at: string
}
