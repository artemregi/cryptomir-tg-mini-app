import React from 'react'
import type { Transaction } from '../types'
import { formatAmountWithSign, formatDateShort, shortenAddress } from '../utils/format'

interface TransactionItemProps {
  transaction: Transaction
  onClick?: () => void
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onClick }) => {
  const isSend = transaction.type === 'send'
  const isPending = transaction.status === 'pending'
  const isFailed = transaction.status === 'failed'

  const statusColor = isFailed
    ? '#DC2626'
    : isPending
    ? '#D97706'
    : isSend
    ? '#DC2626'
    : '#059669'

  const statusBg = isFailed
    ? '#FEF2F2'
    : isPending
    ? '#FFFBEB'
    : isSend
    ? '#FEF2F2'
    : '#ECFDF5'

  const label = isSend ? 'Отправлено' : 'Получено'
  const address = isSend ? transaction.to_address : transaction.from_address
  const statusLabel = isFailed ? 'Ошибка' : isPending ? 'В обработке' : 'Выполнено'

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer active:opacity-70 transition-opacity"
      style={{
        background: '#FFFFFF',
        border: '1px solid #F3F4F6',
      }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 44, height: 44, borderRadius: 14, background: statusBg }}
      >
        {isSend ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="17" y1="7" x2="7" y2="17"/>
            <polyline points="17 17 7 17 7 7"/>
          </svg>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{label}</span>
          {isPending && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#D97706', boxShadow: '0 0 4px #D97706', animation: 'pulse 1.5s ease-in-out infinite' }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {address ? (
            <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
              {shortenAddress(address, 6)}
            </span>
          ) : (
            <span
              style={{ fontSize: '11px', background: statusBg, color: statusColor, padding: '2px 7px', borderRadius: '6px', fontWeight: 600 }}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Amount + date */}
      <div className="text-right flex-shrink-0">
        <div
          style={{ fontSize: '15px', fontWeight: 700, color: statusColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatAmountWithSign(transaction.amount, transaction.type)}
        </div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
          {formatDateShort(transaction.date || transaction.created_at || '')}
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
