import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cpApplyCard,
  cpGetCardInfo,
  cpGetCardBalance,
  cpGetTransactions,
  cpLockCard,
  cpTopUpCard,
} from '../api/cardplus'
import type { CPTopUpParams } from '../types/cardplus'
import { tokenStorage } from '../api/client'

const CARD_ID_KEY = 'cardplus_card_id'

export const getStoredCardId = () => localStorage.getItem(CARD_ID_KEY)

export const useApplyCard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (holderName: string) => cpApplyCard(holderName),
    onSuccess: (data) => {
      localStorage.setItem(CARD_ID_KEY, data.cardId)
      queryClient.invalidateQueries({ queryKey: ['cp-card'] })
      queryClient.invalidateQueries({ queryKey: ['cp-balance'] })
    },
  })
}

export const useCard = (cardId: string | null) => {
  return useQuery({
    queryKey: ['cp-card', cardId],
    queryFn: () => cpGetCardInfo(cardId!),
    enabled: !!cardId && tokenStorage.hasTokens(),
    staleTime: 2 * 60 * 1000,
  })
}

export const useCardBalance = (cardId: string | null) => {
  return useQuery({
    queryKey: ['cp-balance', cardId],
    queryFn: () => cpGetCardBalance(cardId!),
    enabled: !!cardId && tokenStorage.hasTokens(),
    refetchInterval: 60 * 1000,
  })
}

export const useCardTransactions = (cardId: string | null) => {
  return useQuery({
    queryKey: ['cp-transactions', cardId],
    queryFn: () => cpGetTransactions(cardId!),
    enabled: !!cardId && tokenStorage.hasTokens(),
  })
}

export const useLockCard = (cardId: string | null) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cpLockCard(cardId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp-card', cardId] })
    },
  })
}

export const useTopUpCard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: CPTopUpParams) => cpTopUpCard(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cp-balance', variables.cardId] })
      queryClient.invalidateQueries({ queryKey: ['cp-transactions', variables.cardId] })
    },
  })
}
