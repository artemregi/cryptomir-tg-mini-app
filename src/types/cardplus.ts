// ────────────────────────────────────────────────────────────
// CardPlus API Types
// Docs: developer.cardplus.cc
// ────────────────────────────────────────────────────────────

export type CPCardStatus = 'NORMAL' | 'LOCKED' | 'CANCELED' | 'SUSPENDED' | 'DISABLE'

export interface CPCard {
  cardId: string
  cardNo: string        // masked, e.g. "5365 **** **** 4729"
  cardStatus: CPCardStatus
  cardType: string      // "VIRTUAL"
  holderName: string
  expiryDate: string    // "MM/YY"
  currency: string      // "USD"
}

export interface CPCardBalance {
  cardId: string
  balance: number
  availableBalance: number
  currency: string
}

export type CPTransactionType = 'PURCHASE' | 'REFUND' | 'TOPUP' | 'FEE' | 'REVERSAL'
export type CPTransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED'

export interface CPTransaction {
  transId: string
  cardId: string
  amount: number
  currency: string
  merchantName: string
  transType: CPTransactionType
  status: CPTransactionStatus
  transTime: string   // ISO date string
  description: string
}

// cardAccountStatus from POST /wallet/api/user/kycInfo
export type CPKycStatus =
  | 'APPROVED'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'REQUIRE_DOC_UPDATE'
  | 'NOT_SUBMITTED'

export interface CPKycInfo {
  userId?: string
  cardAccountStatus: CPKycStatus
  rejectReason?: string
  submitTime?: string
  approveTime?: string
}

export type CPDocType = 'PASSPORT' | 'ID_CARD' | 'DRIVING_LICENSE'

// Params for POST /wallet/api/user/registerAndKyc and /wallet/api/user/reKyc
export interface CPKycSubmitParams {
  email: string
  firstName: string
  lastName: string
  birthDate: string     // "YYYY-MM-DD"
  nationality: string   // country name or ISO code
  docType: CPDocType
  docNumber: string
  photos: string        // URL(s) of uploaded document photo(s)
  phone?: string
}

// Params for POST /wallet/api/deposit/assetToCard
export interface CPTopUpParams {
  cardId: string
  amount: number
  currency?: string     // default "USD"
}

// Response from POST /wallet/api/user/applyCard
export interface CPApplyCardResponse {
  cardId: string
  cardNo: string
  status: string
}
