import { useQuery } from '@tanstack/react-query'
import { getProfile } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWProfile } from '../types'
import { isDemoMode, MOCK_PROFILE } from '../demo'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<GWProfile> => {
      if (isDemoMode()) return MOCK_PROFILE
      return await getProfile()
    },
    enabled: true,
    retry: tokenStorage.hasTokens() ? 1 : false,
    staleTime: 5 * 60 * 1000,
  })
}
