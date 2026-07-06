import client from './client'
import type {
  AuthTokens,
  GWProfile,
  GWAccount,
  GWAsset,
  GWNetwork,
  GWTransactionWithOps,
  GWWithdrawal,
  GWDepositWallet,
  SignInStep1Response,
  SignUpStep1Response,
} from '../types'

// ============================================================
// Auth
// ============================================================

export const signUp = async (email: string, username: string): Promise<SignUpStep1Response> => {
  const { data } = await client.post('/api/v1/user/v1/sign_up', { email, username })
  return data
}

export const signUpVerify = async (
  email: string,
  code: string,
  password: string,
  username: string
): Promise<AuthTokens> => {
  const { data } = await client.post('/api/v1/user/v1/sign_up/verify', {
    source_type: 'EMAIL',
    source_value: email,
    code,
    password,
    username,
  })
  return data
}

export const signIn = async (email: string, password: string): Promise<SignInStep1Response> => {
  const { data } = await client.post('/api/v1/user/v1/sign_in', { email, password })
  return data
}

export const signInVerify = async (
  email: string,
  code: string,
  actionToken: string
): Promise<AuthTokens> => {
  const { data } = await client.post(
    '/api/v1/user/v1/sign_in/verify',
    { source_type: 'EMAIL', source_value: email, code },
    { headers: { 'X-Action-Token': actionToken } }
  )
  return data
}

export const logoutApi = async (): Promise<void> => {
  await client.post('/api/v1/user/v1/logout')
}

export const tgAuth = async (initData: string): Promise<AuthTokens> => {
  const { data } = await client.post('/api/v1/user/v1/tg_auth', { init_data: initData })
  return data
}

// ============================================================
// Profile
// ============================================================

export const getProfile = async (): Promise<GWProfile> => {
  const { data } = await client.get('/api/v1/user/v1/profile')
  return data
}

export const updateProfile = async (params: { username?: string; full_name?: string }): Promise<void> => {
  await client.post('/api/v1/user/v1/profile/update', params)
}

// ============================================================
// Networks
// ============================================================

export const getNetworks = async (): Promise<GWNetwork[]> => {
  const { data } = await client.get('/api/v1/network/v1/get')
  return data.networks ?? []
}

// ============================================================
// Assets
// ============================================================

export const getAssets = async (networkId: string): Promise<GWAsset[]> => {
  const { data } = await client.get('/api/v1/asset/v1/get', { params: { network_id: networkId } })
  return data.assets ?? []
}

// ============================================================
// Balance (ledger accounts)
// ============================================================

export const getAccounts = async (): Promise<GWAccount[]> => {
  const { data } = await client.get('/api/v1/ledger/v1/account/by_enabled_assets')
  return data.accounts ?? []
}

// ============================================================
// Transactions
// ============================================================

export const getTransactions = async (): Promise<GWTransactionWithOps[]> => {
  const { data } = await client.get('/api/v1/ledger/v1/transaction/list')
  return data.transactions ?? []
}

export const getWithdrawals = async (): Promise<GWWithdrawal[]> => {
  const { data } = await client.get('/api/v1/ledger/v1/withdrawal/list')
  return data.withdrawals ?? []
}

export const createWithdrawal = async (
  assetId: string,
  amount: string,
  toAddress: string
): Promise<GWWithdrawal> => {
  const { data } = await client.post('/api/v1/ledger/v1/withdrawal/create', {
    asset_id: assetId,
    amount,
    to_address: toAddress,
  })
  return data
}

// ============================================================
// KYC document upload
// ============================================================

export const uploadKycPhoto = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await client.post('/api/v1/kyc/v1/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ============================================================
// Deposit wallet
// ============================================================

export const getDepositWallet = async (networkId: string): Promise<GWDepositWallet> => {
  const { data } = await client.get('/api/v1/wallet/v1/deposit/wallet', {
    params: { network_id: networkId },
  })
  return data
}
