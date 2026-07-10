import type { GWProfile, GWAccount, GWAsset, GWNetwork, GWTransactionWithOps, GWWithdrawal } from './types'

export const isDemoMode = () => !localStorage.getItem('cmir_access')

export const MOCK_PROFILE: GWProfile = {
  id: 'demo-user-1',
  created_at: '2026-01-15T10:30:00Z',
  updated_at: '2026-07-01T14:20:00Z',
  phone: '+7 999 123-45-67',
  email: 'artem@cryptomir.io',
  username: 'artregis',
  full_name: 'Артём Регис',
  avatar: '',
  role: 'user',
}

export const MOCK_NETWORKS: GWNetwork[] = [
  { id: 'tron-mainnet', name: 'TRON', chain_id: 728126428, enabled: true },
]

export const MOCK_ASSETS: GWAsset[] = [
  {
    id: 'usdt-trc20',
    network_id: 'tron-mainnet',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    enabled: true,
    min_withdraw_amount: '10',
    comission_fix: '1',
    comission_percentage: '0',
  },
  {
    id: 'ton-mainnet',
    network_id: 'ton-mainnet',
    name: 'Toncoin',
    symbol: 'TON',
    decimals: 9,
    enabled: false,
    min_withdraw_amount: '1',
    comission_fix: '0.1',
    comission_percentage: '0',
  },
  {
    id: 'btc-mainnet',
    network_id: 'btc-mainnet',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    enabled: false,
    min_withdraw_amount: '0.0001',
    comission_fix: '0.0001',
    comission_percentage: '0',
  },
  {
    id: 'eth-mainnet',
    network_id: 'eth-mainnet',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    enabled: false,
    min_withdraw_amount: '0.01',
    comission_fix: '0.005',
    comission_percentage: '0',
  },
]

export const MOCK_ACCOUNTS: GWAccount[] = [
  {
    id: 'acc-usdt-1',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-07-09T10:00:00Z',
    user_id: 'demo-user-1',
    asset_id: 'usdt-trc20',
    balance: '1247.83',
    type: 'user',
  },
]

export const MOCK_DEPOSIT_ADDRESS = 'TXhLgPDq8v2cHd4mPNhRkYJkZtXLa9Kmv3'

export const MOCK_TRANSACTIONS: GWTransactionWithOps[] = [
  {
    transaction: {
      id: 'tx-4',
      created_at: '2026-07-09T09:15:00Z',
      updated_at: '2026-07-09T09:15:00Z',
      asset_id: 'usdt-trc20',
      amount: '500.00',
      type: 'deposit',
      status: 'completed',
    },
    operations: [],
  },
  {
    transaction: {
      id: 'tx-3',
      created_at: '2026-07-07T18:42:00Z',
      updated_at: '2026-07-07T18:42:00Z',
      asset_id: 'usdt-trc20',
      amount: '1000.00',
      type: 'deposit',
      status: 'completed',
    },
    operations: [],
  },
  {
    transaction: {
      id: 'tx-2',
      created_at: '2026-07-05T11:20:00Z',
      updated_at: '2026-07-05T11:20:00Z',
      asset_id: 'usdt-trc20',
      amount: '247.83',
      type: 'deposit',
      status: 'completed',
    },
    operations: [],
  },
]

export const MOCK_WITHDRAWALS: GWWithdrawal[] = [
  {
    id: 'w-2',
    created_at: '2026-07-08T14:30:00Z',
    updated_at: '2026-07-08T14:31:00Z',
    user_id: 'demo-user-1',
    asset_id: 'usdt-trc20',
    wallet_id: 'wallet-1',
    to_address: 'TYn3P8vQqCqLLRJkXdmPNhRkYJkZtXab12',
    amount: '200.00',
    fee_percent: '0',
    fee_fixed: '1',
    fee_amount: '1.00',
    total_amount: '201.00',
    hold_transaction_id: 'hold-2',
    status: 'completed',
  },
  {
    id: 'w-1',
    created_at: '2026-07-06T08:55:00Z',
    updated_at: '2026-07-06T08:56:00Z',
    user_id: 'demo-user-1',
    asset_id: 'usdt-trc20',
    wallet_id: 'wallet-1',
    to_address: 'TMrv4Kp9ZxLqDw7YhJkN2cRmBs6EtUf8Qn',
    amount: '300.00',
    fee_percent: '0',
    fee_fixed: '1',
    fee_amount: '1.00',
    total_amount: '301.00',
    hold_transaction_id: 'hold-1',
    status: 'completed',
  },
]
