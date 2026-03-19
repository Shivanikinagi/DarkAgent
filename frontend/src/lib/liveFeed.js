import { buildBlinkUrl, parseBlinkFromUrl } from './policyEngine'

function capitalize(value) {
  const text = String(value || '')
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

export function decisionToStatus(decision) {
  if (decision === 'block') return 'blocked'
  if (decision === 'auto-downsize') return 'downsized'
  if (decision === 'allow-with-warning') return 'risky'
  return 'safe'
}

export function feedEntryToDraft(entry) {
  const parsedBlink = entry?.parsedBlink || {}
  return {
    title: parsedBlink.title === 'DarkAgent trading Blink' ? entry?.label || 'Incoming Blink' : parsedBlink.title,
    source: parsedBlink.sourceCategory || 'twitter',
    action: parsedBlink.action || 'swap',
    tokenIn: parsedBlink.tokenIn || 'USDC',
    tokenOut: parsedBlink.tokenOut || 'ETH',
    amount: parsedBlink.amountUsd || 0,
    protocol: capitalize(parsedBlink.protocol || 'uniswap'),
    chain: capitalize(parsedBlink.chain || 'base'),
    referralTag: parsedBlink.sourceName?.startsWith('@') ? parsedBlink.sourceName : parsedBlink.sourceName ? `@${parsedBlink.sourceName}` : '',
    tweetCopy: parsedBlink.tweetCopy || entry?.label || '',
    slippageBps: parsedBlink.slippageBps,
    liquidityUsd: parsedBlink.liquidityUsd,
  }
}

export function feedEntryToHref(entry, origin) {
  if (entry?.shareId) {
    return `/analyze/${entry.shareId}`
  }

  const blinkUrl = buildBlinkUrl(origin, feedEntryToDraft(entry))
  return `/analyze?${new URL(blinkUrl).searchParams.toString()}`
}

export function shareToEntry(share) {
  if (!share?.blinkUrl) return null
  const parsedBlink = parseBlinkFromUrl(share.blinkUrl)
  return {
    id: share.id,
    label: share.meta?.title || parsedBlink.title || 'Shared Blink',
    shareId: share.id,
    parsedBlink: {
      ...parsedBlink,
      title:
        parsedBlink.title === 'Shared trading Blink' || parsedBlink.title === 'DarkAgent trading Blink'
          ? share.meta?.title || parsedBlink.title
          : parsedBlink.title,
    },
    analysis: null,
    createdAt: share.createdAt || null,
  }
}
