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
    ? '#E17055'
    : isPending
    ? '#F39C12'
    : isSend
    ? '#E17055'
    : '#00B894'

  const statusBg = isFailed
    ? 'rgba(225, 112, 85, 0.1)'
    : isPending
    ? 'rgba(243, 156, 18, 0.1)'
    : isSend
    ? 'rgba(225, 112, 85, 0.1)'
    : 'rgba(0, 184, 148, 0.1)'

  const label = isSend ? 'Отправлено' : 'Получено'
  const address = isSend ? transaction.to_address : transaction.from_address
  const statusLabel = isFailed ? 'Ошибка' : isPending ? 'В обработке' : 'Выполнено'

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer active:opacity-70 transition-opacity"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 6px rgba(24,54,80,0.06)',
      }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: statusBg }}
      >
        {isSend ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="17" y1="7" x2="7" y2="17"/>
            <polyline points="17 17 7 17 7 7"/>
          </svg>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#183650' }}>{label}</span>
          {isPending && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#F39C12', boxShadow: '0 0 4px #F39C12', animation: 'pulse 1.5s ease-in-out infinite' }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {address ? (
            <span style={{ fontSize: '11px', color: '#6B8FAA', fontFamily: 'monospace' }}>
              {shortenAddress(address, 6)}
            </span>
          ) : (
            <span
              style={{ fontSize: '10px', background: statusBg, color: statusColor, padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Amount + date */}
      <div className="text-right flex-shrink-0">
        <div
          style={{ fontSize: '13px', fontWeight: 700, color: statusColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatAmountWithSign(transaction.amount, transaction.type)}
        </div>
        <div style={{ fontSize: '10px', color: '#90ABBD', marginTop: '2px' }}>
          {formatDateShort(transaction.date || transaction.created_at || '')}
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
