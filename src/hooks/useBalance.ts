import { useQuery } from '@tanstack/react-query'
import { getAccounts } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWAccount } from '../types'
import { isDemoMode, MOCK_ACCOUNTS } from '../demo'

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<GWAccount[]> => {
      if (isDemoMode()) return MOCK_ACCOUNTS
      return await getAccounts()
    },
    enabled: true,
    refetchInterval: tokenStorage.hasTokens() ? 30 * 1000 : false,
    staleTime: 15 * 1000,
    retry: tokenStorage.hasTokens() ? 1 : false,
  })
}

export const useBalance = useAccounts
