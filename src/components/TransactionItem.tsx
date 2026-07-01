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
    ? 'rgba(225, 112, 85, 0.12)'
    : isPending
    ? 'rgba(243, 156, 18, 0.12)'
    : isSend
    ? 'rgba(225, 112, 85, 0.12)'
    : 'rgba(0, 184, 148, 0.12)'

  const label = isSend ? 'Отправлено' : 'Получено'
  const address = isSend ? transaction.to_address : transaction.from_address

  const statusLabel = isFailed ? 'Ошибка' : isPending ? 'В обработке' : 'Выполнено'

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer active:opacity-70 transition-opacity"
      style={{
        background: '#FFFFFF',
        border: '1px solid #BDDCF2',
      }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: statusBg }}
      >
        {isSend ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={statusColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={statusColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-text-primary text-sm font-semibold">{label}</span>
          {isPending && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#F39C12',
                boxShadow: '0 0 4px #F39C12',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {address ? (
            <span className="text-text-secondary text-xs font-mono truncate">
              {shortenAddress(address, 6)}
            </span>
          ) : (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: statusBg, color: statusColor, fontSize: '11px' }}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Amount + date */}
      <div className="text-right flex-shrink-0">
        <div
          className="text-sm font-bold"
          style={{ color: statusColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatAmountWithSign(transaction.amount, transaction.type)}
        </div>
        <div className="text-text-muted text-xs mt-0.5">
          {formatDateShort(transaction.date || transaction.created_at || '')}
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
