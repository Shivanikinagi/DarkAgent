/**
 * Classify contract/RPC errors into user-friendly messages.
 * @param {Error|object} err
 * @returns {{ message: string, action: string|null }}
 */
export function classifyContractError(err) {
  if (!err) return { message: 'Unknown error occurred.', action: null }

  const code = err.code || ''
  const msg = (err.message || err.reason || '').toLowerCase()

  if (code === 'INSUFFICIENT_FUNDS' || msg.includes('insufficient funds')) {
    return { message: 'Insufficient ETH balance. Add more ETH to your wallet.', action: 'fund' }
  }
  if (msg.includes('unauthorized') || msg.includes('not authorized')) {
    return { message: 'Agent is not authorized for this wallet.', action: 'authorize' }
  }
  if (msg.includes('frozen')) {
    return { message: 'Wallet is frozen. Unfreeze to allow agent activity.', action: 'unfreeze' }
  }
  if (code === 'NETWORK_ERROR' || msg.includes('network error') || msg.includes('failed to fetch')) {
    return { message: 'Network error. Check your connection and try again.', action: 'retry' }
  }
  if (msg.includes('user rejected') || code === 4001) {
    return { message: 'Transaction rejected by user.', action: null }
  }

  return { message: err.reason || err.message || 'Unknown error occurred.', action: null }
}
