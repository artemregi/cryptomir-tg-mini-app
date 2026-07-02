import { useQuery } from '@tanstack/react-query'
import { getTransactions, getWithdrawals } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWTransactionWithOps, GWWithdrawal } from '../types'

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<GWTransactionWithOps[]> => {
      return await getTransactions()
    },
    enabled: tokenStorage.hasTokens(),
    staleTime: 30 * 1000,
    retry: 1,
  })
}

export const useWithdrawals = () => {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: async (): Promise<GWWithdrawal[]> => {
      return await getWithdrawals()
    },
    enabled: tokenStorage.hasTokens(),
    staleTime: 30 * 1000,
    retry: 1,
  })
}
