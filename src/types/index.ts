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

// ============================================================
// Crypto Gateway API Types
// ============================================================

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface GWProfile {
  id: string
  created_at: string
  updated_at: string
  phone: string
  email: string
  username: string
  full_name: string
  avatar: string
  role: string
}

export interface GWNetwork {
  id: string
  name: string
  chain_id: number
  enabled: boolean
}

export interface GWAsset {
  id: string
  network_id: string
  name: string
  symbol: string
  decimals: number
  enabled: boolean
  min_withdraw_amount: string
  comission_fix: string
  comission_percentage: string
}

export interface GWAccount {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  asset_id: string
  balance: string
  type: 'user' | 'withdraw_hold' | 'system_deposit' | 'system_fee' | 'system_withdrawn'
}

export interface GWOperation {
  id: string
  transaction_id: string
  asset_id: string
  amount: string
  account_from_id: string
  account_to_id: string
  net_amount_from: string
  net_amount_to: string
}

export interface GWTransaction {
  id: string
  created_at: string
  updated_at: string
  external_id?: string
  user_id?: string
  asset_id: string
  amount: string
  type: 'deposit' | 'internal_transfer' | 'withdrawal'
  status: 'pending' | 'completed' | 'failed'
}

export interface GWTransactionWithOps {
  transaction: GWTransaction
  operations: GWOperation[]
}

export interface GWWithdrawal {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  asset_id: string
  wallet_id: string
  to_address: string
  amount: string
  fee_percent: string
  fee_fixed: string
  fee_amount: string
  total_amount: string
  hold_transaction_id: string
  final_transaction_id?: string
  payout_tx_out_id?: string
  status: 'pending_hold' | 'hold_confirmed' | 'broadcasting' | 'completed' | 'failed' | 'cancelled'
  error_message?: string
}

export interface GWDepositWallet {
  wallet_id: string
  address: string
  qr_code_png_base64: string
  deposit_assets: GWAsset[]
}

// Sign In Step 1 response
export interface SignInStep1Response {
  token: string       // action token for X-Action-Token header
  code_send_by: string
}

// Sign Up Step 1 response
export interface SignUpStep1Response {
  code_send_by: string
}
