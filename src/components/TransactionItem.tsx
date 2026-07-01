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

  const statusColor = isFailed ? '#DC2626' : isPending ? '#D97706' : isSend ? '#DC2626' : '#059669'
  const statusBg = isFailed ? '#FEF2F2' : isPending ? '#FFFBEB' : isSend ? '#FEF2F2' : '#ECFDF5'

  const label = isSend ? 'Отправлено' : 'Получено'
  const address = isSend ? transaction.to_address : transaction.from_address
  const statusLabel = isFailed ? 'Ошибка' : isPending ? 'В обработке' : 'Выполнено'

  return (
    <div
      className="flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        padding: '14px 16px',
      }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 44, height: 44, borderRadius: 14, background: statusBg }}
      >
        {isSend ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{label}</span>
          {isPending && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#D97706', boxShadow: '0 0 4px #D97706', animation: 'pulse 1.5s ease-in-out infinite' }}
            />
          )}
        </div>
        <div>
          {address ? (
            <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {shortenAddress(address, 6)}
            </span>
          ) : (
            <span style={{ fontSize: 11, background: statusBg, color: statusColor, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Amount + date */}
      <div className="text-right flex-shrink-0">
        <div style={{ fontSize: 16, fontWeight: 700, color: statusColor, fontVariantNumeric: 'tabular-nums' }}>
          {formatAmountWithSign(transaction.amount, transaction.type)}
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
          USDT · {formatDateShort(transaction.date || transaction.created_at || '')}
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
