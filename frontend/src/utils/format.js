/**
 * Truncate an EVM address: 0x1234...abcd
 * @param {string} addr
 */
export function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr || ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * Format a unix timestamp as relative time ("2m ago", "3h ago", etc.)
 * @param {number} unixTs
 */
export function formatRelativeTime(unixTs) {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - unixTs
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/**
 * Format a bigint wei value as ETH string.
 * @param {bigint|number|string} wei
 */
export function formatEth(wei) {
  if (wei === undefined || wei === null) return '0.000'
  const n = typeof wei === 'bigint' ? wei : BigInt(String(wei))
  const eth = Number(n) / 1e18
  return eth.toFixed(4)
}

/**
 * Format a number as a percentage string.
 * @param {number} n  0-100
 */
export function formatPercent(n) {
  if (n === undefined || n === null || isNaN(n)) return '0.0%'
  return `${Number(n).toFixed(1)}%`
}

/**
 * Check if a string is a valid EVM address.
 * @param {string} addr
 */
export function isValidAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}
