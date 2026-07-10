import { useQuery } from '@tanstack/react-query'
import { getTransactions, getWithdrawals } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWTransactionWithOps, GWWithdrawal } from '../types'
import { isDemoMode, MOCK_TRANSACTIONS, MOCK_WITHDRAWALS } from '../demo'

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<GWTransactionWithOps[]> => {
      if (isDemoMode()) return MOCK_TRANSACTIONS
      return await getTransactions()
    },
    enabled: true,
    staleTime: 30 * 1000,
    retry: tokenStorage.hasTokens() ? 1 : false,
  })
}

export const useWithdrawals = () => {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: async (): Promise<GWWithdrawal[]> => {
      if (isDemoMode()) return MOCK_WITHDRAWALS
      return await getWithdrawals()
    },
    enabled: true,
    staleTime: 30 * 1000,
    retry: tokenStorage.hasTokens() ? 1 : false,
  })
}
