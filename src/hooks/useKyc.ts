import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cpGetKycStatus, cpSubmitKyc, cpResubmitKyc } from '../api/cardplus'
import type { CPKycSubmitParams } from '../types/cardplus'
import { tokenStorage } from '../api/client'

export const useKycStatus = () => {
  return useQuery({
    queryKey: ['cp-kyc-status'],
    queryFn: cpGetKycStatus,
    enabled: tokenStorage.hasTokens(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useSubmitKyc = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: CPKycSubmitParams) => cpSubmitKyc(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp-kyc-status'] })
    },
  })
}

export const useResubmitKyc = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: CPKycSubmitParams) => cpResubmitKyc(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp-kyc-status'] })
    },
  })
}
