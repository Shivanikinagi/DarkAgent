/**
 * Retry an async function with exponential backoff.
 * @param {() => Promise<any>} fn
 * @param {number} maxRetries
 * @param {number} baseDelayMs
 */
export async function withRetry(fn, maxRetries = 3, baseDelayMs = 500) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await sleep(baseDelayMs * Math.pow(2, i))
    }
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
