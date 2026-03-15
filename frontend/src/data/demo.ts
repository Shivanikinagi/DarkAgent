import { buildTweetText, type BlinkDraft } from '../lib/policyEngine'

export const demoBlinks: BlinkDraft[] = [
  {
    title: 'Safe (Blink wants to swap $25)',
    source: 'twitter',
    action: 'swap',
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    amount: 25,
    protocol: 'Uniswap',
    chain: 'Base',
    referralTag: '@DeepTrendBot',
    tweetCopy: 'Low-size Base rotation alert. DarkAgent should let this pass.',
    slippageBps: 8,
    liquidityUsd: 3200000,
  },
  {
    title: 'Blocked (Blink wants to swap $1,000)',
    source: 'twitter',
    action: 'swap',
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    amount: 1000,
    protocol: 'Uniswap',
    chain: 'Base',
    referralTag: '@MoonAlphaX',
    tweetCopy: 'Whale-sized Twitter Blink. DarkAgent should stop this before the wallet sees it.',
    slippageBps: 8,
    liquidityUsd: 2800000,
  }
]

export const featureHighlights = [
  {
    title: 'Source-aware firewall',
    body: 'DarkAgent catches Twitter Blinks before they reach the wallet and checks them against your saved rules.',
  },
  {
    title: 'Hard block on overspend',
    body: 'If a Twitter Blink asks for more than your ENS-linked limit, DarkAgent turns the review red and locks execution.',
  },
  {
    title: 'Explain every decision',
    body: 'Safe and blocked verdicts come with plain-language reasons so the user knows exactly why the server allowed or rejected the Blink.',
  },
]

export const productPrinciples = [
  'Built for AI-assisted trading desks, not generic wallet monitoring.',
  'Designed to make Blink risk obvious in under 15 seconds.',
  'Framed as a real operator workflow with wallet approval, settlement state, and audit trails.',
]

export function buildSharePreview(blink: BlinkDraft) {
  return {
    avatar: blink.source === 'twitter' ? 'DA' : 'MX',
    handle: blink.referralTag || '@darkagent_demo',
    name: blink.source === 'twitter' ? 'DarkAgent Signals' : 'Social Trading Feed',
    copy: buildTweetText(blink),
  }
}
