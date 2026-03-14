const now = Math.floor(Date.now() / 1000)

export const MOCK_AGENTS = [
  {
    address: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
    status: 'active',
    spendLimit: BigInt('500000000000000000'),   // 0.5 ETH
    dailyLimit: BigInt('2000000000000000000'),  // 2 ETH
    dailySpent: BigInt('800000000000000000'),   // 0.8 ETH
    expiresAt: now + 86400 * 25,
    capabilities: ['swap', 'transfer', 'deposit'],
    ensRecords: {
      maxSpend: '0.5',
      slippage: '0.5',
      protocols: ['uniswap', 'aave', 'compound'],
      lastUpdated: now - 3600,
      isSet: true,
    },
  },
  {
    address: '0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3',
    status: 'frozen',
    spendLimit: BigInt('1000000000000000000'),
    dailyLimit: BigInt('5000000000000000000'),
    dailySpent: BigInt('1200000000000000000'),
    expiresAt: now + 86400 * 10,
    capabilities: ['transfer'],
    ensRecords: { isSet: false },
  },
  {
    address: '0xC3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4',
    status: 'expired',
    spendLimit: BigInt('200000000000000000'),
    dailyLimit: BigInt('1000000000000000000'),
    dailySpent: BigInt('0'),
    expiresAt: now - 86400 * 2,
    capabilities: ['swap'],
    ensRecords: {
      maxSpend: '0.2',
      slippage: '1.0',
      protocols: ['uniswap'],
      lastUpdated: now - 86400 * 5,
      isSet: true,
    },
  },
]

export const MOCK_ENS_RECORDS = {
  maxSpend: '1.0',
  slippage: '0.5',
  protocols: ['uniswap', 'aave', 'compound', 'curve'],
  lastUpdated: now - 7200,
  isSet: true,
}

export const MOCK_BITGO_POLICY = {
  walletAddress: '0xDEADBEEF00000000000000000000000000000001',
  velocityLimit: '10.0',
  addressWhitelist: [
    '0xUniswapRouter000000000000000000000000001',
    '0xAavePool0000000000000000000000000000001',
  ],
  syncStatus: 'synced',
  lastSyncAt: now - 1800,
  privacyAddressCount: 3,
}

function makeActivity(type, status, agentIdx, minsAgo, txHash) {
  const agent = MOCK_AGENTS[agentIdx % MOCK_AGENTS.length]
  return {
    id: `mock-${type}-${minsAgo}`,
    type,
    agentAddress: agent.address,
    userAddress: '0xOwner0000000000000000000000000000000001',
    proposalId: `0x${Math.floor(Math.random() * 0xffffff).toString(16).padStart(64, '0')}`,
    status,
    blockNumber: 12345678 - minsAgo,
    timestamp: now - minsAgo * 60,
    txHash,
  }
}

export const MOCK_ACTIVITY_FEED = [
  makeActivity('execution', 'executed', 0, 2, '0xabc123'),
  makeActivity('verification', 'verified', 0, 5, '0xdef456'),
  makeActivity('proposal', 'proposed', 1, 8, null),
  makeActivity('freeze', 'executed', 1, 12, '0xfee789'),
  makeActivity('execution', 'executed', 2, 15, '0xaaa111'),
  makeActivity('verification', 'rejected', 1, 20, null),
  makeActivity('proposal', 'proposed', 0, 25, null),
  makeActivity('execution', 'executed', 0, 30, '0xbbb222'),
  makeActivity('verification', 'verified', 2, 35, '0xccc333'),
  makeActivity('proposal', 'proposed', 1, 40, null),
  makeActivity('execution', 'executed', 0, 45, '0xddd444'),
  makeActivity('verification', 'verified', 0, 50, '0xeee555'),
  makeActivity('proposal', 'proposed', 2, 55, null),
  makeActivity('execution', 'executed', 1, 60, '0xfff666'),
  makeActivity('freeze', 'executed', 1, 70, '0x111aaa'),
  makeActivity('execution', 'executed', 0, 80, '0x222bbb'),
  makeActivity('verification', 'verified', 2, 90, '0x333ccc'),
  makeActivity('proposal', 'proposed', 0, 100, null),
  makeActivity('execution', 'executed', 2, 110, '0x444ddd'),
  makeActivity('verification', 'rejected', 1, 120, null),
]

export const MOCK_DAILY_VOLUME = (() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    days.push({
      date: d.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 20) + 5,
      value: (Math.random() * 2 + 0.5).toFixed(4),
    })
  }
  return days
})()

export function useMockData() {
  return {
    mockAgents: MOCK_AGENTS,
    mockENSRecords: MOCK_ENS_RECORDS,
    mockBitGoPolicy: MOCK_BITGO_POLICY,
    mockDailyVolume: MOCK_DAILY_VOLUME,
    mockActivityFeed: MOCK_ACTIVITY_FEED,
  }
}
