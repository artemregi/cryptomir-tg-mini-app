import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions, useWithdrawals } from '../hooks/useTransactions'
import { formatDateGroup, formatDateShort, shortenAddress } from '../utils/format'
import type { GWTransactionWithOps, GWWithdrawal } from '../types'

type FilterType = 'all' | 'deposit' | 'withdrawal'

interface DisplayItem {
  id: string
  kind: 'deposit' | 'withdrawal' | 'transfer'
  amount: number
  status: string
  address?: string
  created_at: string
}

function mapTransaction(txWrap: GWTransactionWithOps): DisplayItem {
  const tx = txWrap.transaction
  const kind = tx.type === 'deposit' ? 'deposit' : tx.type === 'withdrawal' ? 'withdrawal' : 'transfer'
  return {
    id: tx.id,
    kind,
    amount: parseFloat(tx.amount) || 0,
    status: tx.status,
    created_at: tx.created_at,
  }
}

function mapWithdrawal(w: GWWithdrawal): DisplayItem {
  return {
    id: 'w_' + w.id,
    kind: 'withdrawal',
    amount: parseFloat(w.amount) || 0,
    status: w.status,
    address: w.to_address,
    created_at: w.created_at,
  }
}

const History: React.FC = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')

  const { data: txData = [], isLoading: txLoading, error: txError, refetch: refetchTx } = useTransactions()
  const { data: wData = [], isLoading: wLoading, error: wError, refetch: refetchW } = useWithdrawals()

  const isLoading = txLoading || wLoading
  const error = txError || wError

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

  const handleRefetch = () => {
    refetchTx()
    refetchW()
  }

  // Combine and deduplicate: withdrawals appear in both txData and wData
  // Use wData for withdrawals (has to_address), txData for deposits/transfers
  const txItems = txData
    .filter(tw => tw.transaction.type !== 'withdrawal')
    .map(mapTransaction)

  const wItems = wData.map(mapWithdrawal)

  const allItems: DisplayItem[] = [...txItems, ...wItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filtered = filter === 'all'
    ? allItems
    : allItems.filter(item => item.kind === filter)

  const grouped = filtered.reduce<Record<string, DisplayItem[]>>((groups, item) => {
    const group = formatDateGroup(item.created_at)
    if (!groups[group]) groups[group] = []
    groups[group].push(item)
    return groups
  }, {})

  const handleFilterChange = (newFilter: FilterType) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    setFilter(newFilter)
  }

  const statusLabel = (status: string) => {
    if (status === 'completed') return 'Выполнено'
    if (status === 'pending' || status === 'pending_hold' || status === 'hold_confirmed' || status === 'broadcasting') return 'В обработке'
    if (status === 'failed') return 'Ошибка'
    if (status === 'cancelled') return 'Отменено'
    return status
  }

  const isPending = (status: string) =>
    status === 'pending' || status === 'pending_hold' || status === 'hold_confirmed' || status === 'broadcasting'
  const isFailed = (status: string) => status === 'failed' || status === 'cancelled'

  const getColors = (item: DisplayItem) => {
    if (isFailed(item.status)) return { color: '#DC2626', bg: '#FEF2F2' }
    if (isPending(item.status)) return { color: '#D97706', bg: '#FFFBEB' }
    if (item.kind === 'withdrawal') return { color: '#DC2626', bg: '#FEF2F2' }
    return { color: '#059669', bg: '#ECFDF5' }
  }

  const renderItem = (item: DisplayItem) => {
    const { color, bg } = getColors(item)
    const isOut = item.kind === 'withdrawal'
    const label = item.kind === 'deposit' ? 'Получено' : item.kind === 'withdrawal' ? 'Отправлено' : 'Перевод'
    const sign = isOut ? '-' : '+'

    return (
      <div
        key={item.id}
        className="flex items-center gap-3"
        style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '14px 16px' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 44, height: 44, borderRadius: 14, background: bg }}
        >
          {isOut ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{label}</span>
            {isPending(item.status) && (
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D97706', boxShadow: '0 0 4px #D97706' }} />
            )}
          </div>
          <div>
            {item.address ? (
              <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {shortenAddress(item.address, 6)}
              </span>
            ) : (
              <span style={{ fontSize: 11, background: bg, color, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>
                {statusLabel(item.status)}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
            {sign}{item.amount.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
            USDT · {formatDateShort(item.created_at)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28 animate-fade-in" style={{ background: '#F0F4FA' }}>
      <div className="px-5 pt-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div
              className="flex items-center justify-center flex-shrink-0 cursor-pointer active:opacity-70 transition-opacity"
              style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              onClick={handleBack}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>История</h1>
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>
                {allItems.length > 0 ? `${allItems.length} операций` : 'Операции'}
              </p>
            </div>
          </div>
          <div
            className="flex items-center justify-center cursor-pointer active:opacity-70 transition-opacity"
            style={{ width: 40, height: 40, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={handleRefetch}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex mb-6" style={{ gap: 3, padding: 4, background: '#F3F4F6', borderRadius: 14 }}>
          {[
            { key: 'all' as FilterType, label: 'Все' },
            { key: 'deposit' as FilterType, label: 'Получено' },
            { key: 'withdrawal' as FilterType, label: 'Отправлено' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className="flex-1 py-2 rounded-xl text-sm transition-all"
              style={{
                background: filter === key ? '#FFFFFF' : 'transparent',
                color: filter === key ? '#111827' : '#6B7280',
                fontWeight: filter === key ? 600 : 400,
                boxShadow: filter === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: 72, borderRadius: 16, background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.5s ${i * 0.1}s infinite` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-2xl p-6 text-center" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Не удалось загрузить транзакции</p>
            <button onClick={handleRefetch} style={{ fontSize: 13, color: '#2563EB', fontWeight: 600 }}>Попробовать снова</button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{ background: '#F3F4F6' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <p style={{ color: '#374151', fontWeight: 600, marginBottom: 4 }}>
              {filter === 'all' ? 'Нет транзакций' : filter === 'withdrawal' ? 'Нет отправлений' : 'Нет пополнений'}
            </p>
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
              {filter === 'all' ? 'Ваши транзакции появятся здесь' : 'Попробуйте изменить фильтр'}
            </p>
          </div>
        )}

        {/* Grouped transactions */}
        {!isLoading && !error && Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{group}</span>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
            </div>
            <div className="space-y-2.5">
              {items.map(renderItem)}
            </div>
          </div>
        ))}
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
