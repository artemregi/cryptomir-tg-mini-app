import { useQuery } from '@tanstack/react-query'
import { getTokens } from '../api/endpoints'
import type { Token } from '../types'

export const useTokens = () => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async (): Promise<Token[]> => {
      const response = await getTokens()
      if (response.success) {
        return response.data
      }
      throw new Error('Failed to fetch tokens')
    },
    staleTime: 60 * 1000,
    retry: 2,
  })
}
