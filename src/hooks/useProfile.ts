import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { initializeProfile, getProfile } from '../api/endpoints'
import type { Profile } from '../types'

export const useInitializeProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: initializeProfile,
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(['profile'], data.data.user)
        if (data.data.tron_address || data.data.wallet_address) {
          queryClient.setQueryData(['tron_address'], data.data.tron_address || data.data.wallet_address)
        }
      }
    },
  })
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getProfile()
      if (response.success) {
        return response.data as Profile
      }
      throw new Error('Failed to fetch profile')
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  })
}

export const useTronAddress = () => {
  const { data: profile } = useProfile()
  return profile?.tron_address || profile?.wallet_address || null
}
