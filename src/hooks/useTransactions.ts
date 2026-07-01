import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getTransactions } from '../api/endpoints'
import type { Transaction, TransactionsResponse } from '../types'

export const useTransactions = (type?: 'send' | 'top_up') => {
  return useQuery({
    queryKey: ['transactions', type],
    queryFn: async (): Promise<TransactionsResponse> => {
      const response = await getTransactions({ page: 1, limit: 20, type })
      if (response.success) {
        return response.data
      }
      throw new Error('Failed to fetch transactions')
    },
    staleTime: 30 * 1000,
    retry: 2,
  })
}

export const useInfiniteTransactions = (type?: 'send' | 'top_up') => {
  return useInfiniteQuery({
    queryKey: ['transactions-infinite', type],
    queryFn: async ({ pageParam = 1 }): Promise<TransactionsResponse> => {
      const response = await getTransactions({
        page: pageParam as number,
        limit: 20,
        type,
      })
      if (response.success) {
        return response.data
      }
      throw new Error('Failed to fetch transactions')
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasNext = lastPage.pagination?.has_next ?? lastPage.has_more ?? false
      const currentPage = lastPage.pagination?.page ?? 1
      return hasNext ? currentPage + 1 : undefined
    },
    staleTime: 30 * 1000,
  })
}
