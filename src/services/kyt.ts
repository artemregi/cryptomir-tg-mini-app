/**
 * KYT (Know Your Transaction) service
 *
 * Provider-agnostic architecture: implement KYTProvider interface
 * and swap activeProvider to change the underlying service
 * without touching any business logic or UI code.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface KYTResult {
  riskLevel: RiskLevel
  riskScore: number   // 0–100
  blocked: boolean    // true if operation must be blocked
  requiresConfirmation: boolean  // true if extra user confirmation needed
  reason?: string     // human-readable reason if blocked/flagged
}

export interface KYTProvider {
  checkTransaction(params: {
    address: string
    amount: number
    asset: string
  }): Promise<KYTResult>
}

// ─────────────────────────────────────────────
// Mock provider (used in demo mode and local dev)
// Replace with real provider (Chainalysis, Elliptic, etc.)
// ─────────────────────────────────────────────
const BLOCKED_ADDRESSES = [
  'TNZua2csZGYhBbfJbLrqJQgkF8SFkxQUkR', // example OFAC-sanctioned
  'TFGGwEEVWbMnHc5F2WQPVP9JjMCm4GFJJ9',
]

class MockKYTProvider implements KYTProvider {
  async checkTransaction({ address, amount }: { address: string; amount: number; asset: string }): Promise<KYTResult> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600))

    // Blocked addresses
    if (BLOCKED_ADDRESSES.includes(address)) {
      return {
        riskLevel: 'critical',
        riskScore: 100,
        blocked: true,
        requiresConfirmation: false,
        reason: 'Address is on a sanctions list and cannot receive funds.',
      }
    }

    // Large amount threshold — require extra confirmation
    if (amount >= 10000) {
      return {
        riskLevel: 'high',
        riskScore: 75,
        blocked: false,
        requiresConfirmation: true,
        reason: 'Large transaction amount requires additional confirmation.',
      }
    }

    // Medium risk for amounts above 5000
    if (amount >= 5000) {
      return {
        riskLevel: 'medium',
        riskScore: 40,
        blocked: false,
        requiresConfirmation: false,
      }
    }

    // Low risk — all clear
    return { riskLevel: 'low', riskScore: 5, blocked: false, requiresConfirmation: false }
  }
}

// ─────────────────────────────────────────────
// Active provider — swap here to change provider
// e.g. import { ChainalysisProvider } from './providers/chainalysis'
// ─────────────────────────────────────────────
const activeProvider: KYTProvider = new MockKYTProvider()

export const kytService = {
  checkTransaction: (params: { address: string; amount: number; asset: string }) =>
    activeProvider.checkTransaction(params),
}
