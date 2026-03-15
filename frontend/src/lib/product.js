import deployment from '../contracts/deployment.json'

export const BASE_SEPOLIA_CHAIN_ID = 84532
export const BASE_SEPOLIA_LABEL = 'Base Sepolia'
export const BASE_EXPLORER_URL = 'https://sepolia.basescan.org'
export const DEFAULT_ENS_PROFILE = 'alice.eth'

export const DARKAGENT_CONTRACTS = deployment?.contracts || {}
export const DEMO_AGENT_ADDRESS =
  deployment?.agents?.demoAgent?.address || DARKAGENT_CONTRACTS?.DarkAgent || null

export function formatUsd(value) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  }).format(amount)
}

export function shortAddress(value, size = 4) {
  if (!value) return 'Not connected'
  return `${value.slice(0, 6)}...${value.slice(-size)}`
}

export function txExplorerUrl(hash) {
  if (!hash || !String(hash).startsWith('0x')) return ''
  return `${BASE_EXPLORER_URL}/tx/${hash}`
}

export function addressExplorerUrl(address) {
  if (!address || !String(address).startsWith('0x')) return ''
  return `${BASE_EXPLORER_URL}/address/${address}`
}

export function resolveSettlementLabel(mode) {
  if (mode === 'live') return 'Live settlement'
  return 'Settlement unavailable'
}
