import client from './client'
import type {
  ApiResponse,
  BalanceData,
  Token,
  TransactionsResponse,
  NetworkConfig,
  WithdrawalRequest,
  WithdrawalResponse,
  InitializeResponse,
  Profile,
} from '../types'

// Profile
export const initializeProfile = async (): Promise<ApiResponse<InitializeResponse>> => {
  const { data } = await client.post('/v1/profile/initialize')
  return data
}

export const getProfile = async (): Promise<ApiResponse<Profile>> => {
  const { data } = await client.get('/v1/profile/me')
  return data
}

// Balance
export const getBalance = async (): Promise<ApiResponse<BalanceData>> => {
  const { data } = await client.get('/v1/balance')
  return data
}

// Tokens
export const getTokens = async (): Promise<ApiResponse<Token[]>> => {
  const { data } = await client.get('/v1/tokens')
  return data
}

// Transactions
export interface GetTransactionsParams {
  page?: number
  limit?: number
  type?: 'send' | 'top_up'
}

export const getTransactions = async (
  params: GetTransactionsParams = {}
): Promise<ApiResponse<TransactionsResponse>> => {
  const { data } = await client.get('/v1/transactions', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.type ? { type: params.type } : {}),
    },
  })
  return data
}

// Networks
export const getNetworks = async (): Promise<ApiResponse<NetworkConfig[]>> => {
  const { data } = await client.get('/v1/networks')
  return data
}

// Withdrawals
export const createWithdrawal = async (
  body: WithdrawalRequest
): Promise<ApiResponse<WithdrawalResponse>> => {
  const idempotencyKey = crypto.randomUUID()
  const { data } = await client.post('/v1/wallets/tron/withdrawals', body, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  })
  return data
}

export const getWithdrawalStatus = async (
  id: string
): Promise<ApiResponse<WithdrawalResponse>> => {
  const { data } = await client.get(`/v1/wallets/withdrawals/${id}`)
  return data
}
