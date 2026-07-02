/**
 * CardPlus API Client
 * Docs: developer.cardplus.cc
 *
 * MOCK MODE is active when VITE_CARDPLUS_API_KEY is not set.
 * To go live:
 *   1. Add VITE_CARDPLUS_URL=https://... to .env
 *   2. Add VITE_CARDPLUS_API_KEY=your_key to .env
 *   3. Mock mode turns off automatically.
 *
 * Auth header: X-API-Key (confirm with CardPlus — may differ)
 */

import axios from 'axios'
import type {
  CPCard,
  CPCardBalance,
  CPTransaction,
  CPKycInfo,
  CPKycSubmitParams,
  CPTopUpParams,
  CPApplyCardResponse,
} from '../types/cardplus'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_CARDPLUS_URL || 'https://developer.cardplus.cc'
const API_KEY  = import.meta.env.VITE_CARDPLUS_API_KEY || ''

// Auto-enable mock when no API key is set
const MOCK_MODE = !API_KEY

const cardplusClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    // TODO: confirm exact auth header name with CardPlus
    'X-API-Key': API_KEY,
  },
})

// ─── Mock state (in-memory, resets on page reload) ───────────────────────────

const delay = (ms = 900) => new Promise<void>(r => setTimeout(r, ms))

let _card: CPCard | null = null
let _balance: CPCardBalance = { cardId: '', balance: 0, availableBalance: 0, currency: 'USD' }
let _transactions: CPTransaction[] = []
let _kycInfo: CPKycInfo = { cardAccountStatus: 'NOT_SUBMITTED' }

// ─── Card endpoints ───────────────────────────────────────────────────────────

/**
 * POST /wallet/api/user/applyCard
 * Issue a new virtual card for the current user.
 */
export const cpApplyCard = async (holderName: string): Promise<CPApplyCardResponse> => {
  if (MOCK_MODE) {
    await delay()
    const cardId = 'mock_card_' + Date.now()
    _card = {
      cardId,
      cardNo: '5365 **** **** ' + String(Math.floor(1000 + Math.random() * 9000)),
      cardStatus: 'NORMAL',
      cardType: 'VIRTUAL',
      holderName: holderName.toUpperCase(),
      expiryDate: '12/28',
      currency: 'USD',
    }
    _balance = { cardId, balance: 0, availableBalance: 0, currency: 'USD' }
    _transactions = []
    return { cardId, cardNo: _card.cardNo, status: 'NORMAL' }
  }
  const { data } = await cardplusClient.post('/wallet/api/user/applyCard', { holderName })
  return data
}

/**
 * GET /wallet/api/user/cardInfo
 * Get card details (number masked, no CVV).
 */
export const cpGetCardInfo = async (cardId: string): Promise<CPCard> => {
  if (MOCK_MODE) {
    await delay(400)
    if (!_card || _card.cardId !== cardId) throw new Error('Card not found')
    return { ..._card }
  }
  const { data } = await cardplusClient.get('/wallet/api/user/cardInfo', {
    params: { cardId },
  })
  return data
}

/**
 * GET /wallet/api/card/balance
 * Get current card balance.
 */
export const cpGetCardBalance = async (cardId: string): Promise<CPCardBalance> => {
  if (MOCK_MODE) {
    await delay(400)
    return { ..._balance }
  }
  const { data } = await cardplusClient.get('/wallet/api/card/balance', {
    params: { cardId },
  })
  return data
}

/**
 * POST /wallet/api/card/lock
 * Freeze / lock the card.
 * NOTE: No unlock endpoint exists yet — pending CardPlus response.
 */
export const cpLockCard = async (cardId: string): Promise<void> => {
  if (MOCK_MODE) {
    await delay()
    if (_card && _card.cardId === cardId) _card = { ..._card, cardStatus: 'LOCKED' }
    return
  }
  await cardplusClient.post('/wallet/api/card/lock', { cardId })
}

/**
 * POST /wallet/api/deposit/assetToCard
 * Top up card from user's crypto balance.
 */
export const cpTopUpCard = async (params: CPTopUpParams): Promise<void> => {
  if (MOCK_MODE) {
    await delay()
    _balance = {
      ..._balance,
      balance: _balance.balance + params.amount,
      availableBalance: _balance.availableBalance + params.amount,
    }
    _transactions = [
      {
        transId: 'mock_tx_' + Date.now(),
        cardId: params.cardId,
        amount: params.amount,
        currency: params.currency || 'USD',
        merchantName: 'CryptoMIR Wallet',
        transType: 'TOPUP',
        status: 'COMPLETED',
        transTime: new Date().toISOString(),
        description: 'Top up from crypto wallet',
      },
      ..._transactions,
    ]
    return
  }
  await cardplusClient.post('/wallet/api/deposit/assetToCard', {
    cardId: params.cardId,
    amount: params.amount,
    currency: params.currency || 'USD',
  })
}

/**
 * GET /wallet/api/user/cardFlow
 * Get card transaction history with pagination.
 */
export const cpGetTransactions = async (
  cardId: string,
  pageNo = 1,
  pageSize = 30
): Promise<CPTransaction[]> => {
  if (MOCK_MODE) {
    await delay(500)
    return [..._transactions]
  }
  const { data } = await cardplusClient.get('/wallet/api/user/cardFlow', {
    params: { cardId, pageNo, pageSize },
  })
  // API returns { list: [...] } — adjust if schema differs
  return data.list ?? []
}

/**
 * POST /wallet/api/card/flowInfo
 * Get a single transaction by ID.
 */
export const cpGetTransactionDetail = async (transId: string): Promise<CPTransaction> => {
  if (MOCK_MODE) {
    await delay(300)
    const tx = _transactions.find(t => t.transId === transId)
    if (!tx) throw new Error('Transaction not found')
    return { ...tx }
  }
  const { data } = await cardplusClient.post('/wallet/api/card/flowInfo', { transId })
  return data
}

// ─── KYC endpoints ───────────────────────────────────────────────────────────

/**
 * POST /wallet/api/user/kycInfo
 * Get current KYC status for the user.
 */
export const cpGetKycStatus = async (): Promise<CPKycInfo> => {
  if (MOCK_MODE) {
    await delay(400)
    return { ..._kycInfo }
  }
  const { data } = await cardplusClient.post('/wallet/api/user/kycInfo', {})
  return data
}

/**
 * POST /wallet/api/user/registerAndKyc
 * Submit KYC documents for the first time.
 */
export const cpSubmitKyc = async (params: CPKycSubmitParams): Promise<void> => {
  if (MOCK_MODE) {
    await delay(1200)
    _kycInfo = {
      cardAccountStatus: 'PENDING_REVIEW',
      submitTime: new Date().toISOString(),
    }
    return
  }
  await cardplusClient.post('/wallet/api/user/registerAndKyc', params)
}

/**
 * POST /wallet/api/user/reKyc
 * Resubmit KYC after rejection or doc update request.
 */
export const cpResubmitKyc = async (params: CPKycSubmitParams): Promise<void> => {
  if (MOCK_MODE) {
    await delay(1200)
    _kycInfo = {
      cardAccountStatus: 'PENDING_REVIEW',
      submitTime: new Date().toISOString(),
    }
    return
  }
  await cardplusClient.post('/wallet/api/user/reKyc', params)
}
