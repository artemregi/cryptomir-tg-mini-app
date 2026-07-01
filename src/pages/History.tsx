import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInfiniteTransactions } from '../hooks/useTransactions'
import TransactionItem from '../components/TransactionItem'
import { formatDateGroup } from '../utils/format'
import type { Transaction } from '../types'

type FilterType = 'all' | 'send' | 'top_up'

const History: React.FC = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const apiFilter = filter === 'all' ? undefined : filter

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteTransactions(apiFilter)

  const handleBack = useCallback(() => {
    window.Telegram?.WebApp?.BackButton?.hide()
    navigate('/')
  }, [navigate])

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.show()
    window.Telegram?.WebApp?.BackButton?.onClick(handleBack)
    return () => {
      window.Telegram?.WebApp?.BackButton?.offClick(handleBack)
      window.Telegram?.WebApp?.BackButton?.hide()
    }
  }, [handleBack])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allTransactions = data?.pages.flatMap((page) => page.transactions ?? page.items ?? []) || []

  const groupedTransactions = allTransactions.reduce<Record<string, Transaction[]>>(
    (groups, tx) => {
      const group = formatDateGroup(tx.date || tx.created_at || '')
      if (!groups[group]) groups[group] = []
      groups[group].push(tx)
      return groups
    },
    {}
  )

  const handleFilterChange = (newFilter: FilterType) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    setFilter(newFilter)
  }

  const handleTxClick = (tx: Transaction) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
    if (tx.tx_hash) {
      window.Telegram?.WebApp?.openLink(`https://tronscan.org/#/transaction/${tx.tx_hash}`)
    }
  }

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="active:opacity-70 transition-opacity flex-shrink-0"
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '8px 10px',
                border: '1px solid #F3F4F6',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>История</h1>
              <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
                {allTransactions.length > 0 ? `${allTransactions.length} транзакций` : 'Операции'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="active:opacity-70 transition-opacity"
            style={{
              width: 36, height: 36, background: '#FFFFFF', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #F3F4F6',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75" className={isLoading ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-5"
          style={{ background: '#F3F4F6' }}
        >
          {[
            { key: 'all' as FilterType, label: 'Все' },
            { key: 'top_up' as FilterType, label: 'Получено' },
            { key: 'send' as FilterType, label: 'Отправлено' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === key ? '#FFFFFF' : 'transparent',
                color: filter === key ? '#2563EB' : '#6B7280',
                boxShadow: filter === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
                  backgroundSize: '200% 100%',
                  animation: `shimmer 1.5s ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: '#FFFFFF', border: '1px solid #F3F4F6' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: 12 }}>Не удалось загрузить транзакции</p>
            <button onClick={() => refetch()} style={{ fontSize: '13px', color: '#2563EB', fontWeight: 600 }}>
              Попробовать снова
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && allTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#F3F4F6' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <p style={{ color: '#374151', fontWeight: 600, marginBottom: 4 }}>
              {filter === 'all' ? 'Нет транзакций' : filter === 'send' ? 'Нет отправлений' : 'Нет пополнений'}
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>
              {filter === 'all' ? 'Ваши транзакции появятся здесь' : 'Попробуйте изменить фильтр'}
            </p>
          </div>
        )}

        {/* Grouped transactions */}
        {!isLoading && !error && Object.entries(groupedTransactions).map(([group, txs]) => (
          <div key={group} className="mb-5">
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {group}
              </span>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
            </div>
            <div className="space-y-2">
              {txs.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onClick={() => handleTxClick(tx)}
                />
              ))}
            </div>
          </div>
        ))}

        <div ref={loadMoreRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#2563EB', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        {!hasNextPage && allTransactions.length > 10 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', paddingTop: 12, paddingBottom: 4 }}>
            Все транзакции загружены
          </p>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default History
