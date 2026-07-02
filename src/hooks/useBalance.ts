import { useQuery } from '@tanstack/react-query'
import { getAccounts } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWAccount } from '../types'

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<GWAccount[]> => {
      return await getAccounts()
    },
    enabled: tokenStorage.hasTokens(),
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
    retry: 1,
  })
}

// backward compat alias
export const useBalance = useAccounts
