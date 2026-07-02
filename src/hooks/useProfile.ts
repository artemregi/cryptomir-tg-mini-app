import { useQuery } from '@tanstack/react-query'
import { getProfile } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWProfile } from '../types'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<GWProfile> => {
      return await getProfile()
    },
    enabled: tokenStorage.hasTokens(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}
