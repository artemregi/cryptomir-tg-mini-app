import { useQuery } from '@tanstack/react-query'
import { getBalance } from '../api/endpoints'
import type { BalanceData } from '../types'

export const useBalance = () => {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async (): Promise<BalanceData> => {
      const response = await getBalance()
      if (response.success) {
        return response.data
      }
      throw new Error('Failed to fetch balance')
    },
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
    retry: 2,
  })
}
