import { useQuery } from '@tanstack/react-query'
import { getNetworks, getAssets } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWAsset, GWNetwork } from '../types'

export const useNetworks = () => {
  return useQuery({
    queryKey: ['networks'],
    queryFn: async (): Promise<GWNetwork[]> => {
      return await getNetworks()
    },
    enabled: tokenStorage.hasTokens(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export const useAssets = (networkId?: string) => {
  return useQuery({
    queryKey: ['assets', networkId],
    queryFn: async (): Promise<GWAsset[]> => {
      if (!networkId) return []
      return await getAssets(networkId)
    },
    enabled: tokenStorage.hasTokens() && !!networkId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Fetch assets across all enabled networks, return flat list
export const useAllAssets = () => {
  const { data: networks = [] } = useNetworks()

  return useQuery({
    queryKey: ['assets', 'all', networks.map(n => n.id).join(',')],
    queryFn: async (): Promise<GWAsset[]> => {
      const enabledNetworks = networks.filter(n => n.enabled)
      if (enabledNetworks.length === 0) return []
      const results = await Promise.all(enabledNetworks.map(n => getAssets(n.id)))
      return results.flat()
    },
    enabled: tokenStorage.hasTokens() && networks.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Legacy alias
export const useTokens = useAllAssets
