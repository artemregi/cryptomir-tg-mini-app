import { useQuery } from '@tanstack/react-query'
import { getNetworks, getAssets } from '../api/endpoints'
import { tokenStorage } from '../api/client'
import type { GWAsset, GWNetwork } from '../types'
import { isDemoMode, MOCK_NETWORKS, MOCK_ASSETS } from '../demo'

export const useNetworks = () => {
  return useQuery({
    queryKey: ['networks'],
    queryFn: async (): Promise<GWNetwork[]> => {
      if (isDemoMode()) return MOCK_NETWORKS
      return await getNetworks()
    },
    enabled: true,
    staleTime: 10 * 60 * 1000,
    retry: tokenStorage.hasTokens() ? 1 : false,
  })
}

export const useAssets = (networkId?: string) => {
  return useQuery({
    queryKey: ['assets', networkId],
    queryFn: async (): Promise<GWAsset[]> => {
      if (isDemoMode()) return MOCK_ASSETS.filter(a => a.network_id === networkId)
      if (!networkId) return []
      return await getAssets(networkId)
    },
    enabled: !!networkId,
    staleTime: 5 * 60 * 1000,
    retry: tokenStorage.hasTokens() ? 1 : false,
  })
}

export const useAllAssets = () => {
  const { data: networks = [] } = useNetworks()

  return useQuery({
    queryKey: ['assets', 'all', networks.map(n => n.id).join(',')],
    queryFn: async (): Promise<GWAsset[]> => {
      if (isDemoMode()) return MOCK_ASSETS
      const enabledNetworks = networks.filter(n => n.enabled)
      if (enabledNetworks.length === 0) return []
      const results = await Promise.all(enabledNetworks.map(n => getAssets(n.id)))
      return results.flat()
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: tokenStorage.hasTokens() ? 1 : false,
  })
}

export const useTokens = useAllAssets
