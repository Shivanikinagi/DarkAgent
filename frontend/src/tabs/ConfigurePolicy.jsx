import { useState, useEffect } from 'react'

const PROXY_URL = 'http://localhost:8787'

const DEMO_POLICIES = {
  defi: {
    ens_handle: 'alice.darkagent.eth',
    policy: {
      domain: 'defi',
      agent_id: 'trading_bot_v1',
      rules: [
        { rule_id: 'R01', field: 'amount_usdc', operator: 'lte', value: 300, action_on_fail: 'block' },
        { rule_id: 'R02', field: 'token_category', operator: 'not_in', value: ['meme', 'unverified'], action_on_fail: 'block' },
        { rule_id: 'R03', field: 'protocol', operator: 'in', value: ['uniswap', 'aave', 'compound'], action_on_fail: 'block' },
      ]
    }
  },
  hiring: {
    ens_handle: 'bob.darkagent.eth',
    policy: {
      domain: 'hiring',
      agent_id: 'cv_screener_v1',
      rules: [
        { rule_id: 'R01', field: 'filter_fields_used', operator: 'not_contains', value: 'location', action_on_fail: 'block', eu_ai_act_ref: 'Article 10(5)' },
        { rule_id: 'R02', field: 'filter_fields_used', operator: 'not_contains', value: 'age', action_on_fail: 'block', eu_ai_act_ref: 'Article 10(5)' },
        { rule_id: 'R03', field: 'batch_size', operator: 'lte', value: 500, action_on_fail: 'notify' },
      ]
    }
  }
}

const OPERATOR_LABELS = {
  lte: '≤',
  gte: '≥',
  eq: '=',
  neq: '≠',
  in: 'in',
  not_in: 'not in',
  contains: 'contains',
  not_contains: 'not contains',
}

export default function ConfigurePolicy() {
  const [selectedDemo, setSelectedDemo] = useState('defi')
  const [policies, setPolicies] = useState(null)
  const [loading, setLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')

  // Check server health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${PROXY_URL}/health`)
        if (res.ok) {
          setServerStatus('online')
          // Load policies from server
          const pRes = await fetch(`${PROXY_URL}/policies`)
          if (pRes.ok) {
            const data = await pRes.json()
            setPolicies(data.policies)
          }
        }
      } catch {
        setServerStatus('offline')
      }
    }
    checkHealth()
  }, [])

  const currentPolicy = DEMO_POLICIES[selectedDemo]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Server Status */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">🖥️</span>
          <div>
            <p className="text-sm font-semibold text-gray-200">Proxy Server Status</p>
            <p className="text-xs text-gray-500">Action Interceptor on port 8787</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          serverStatus === 'online'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : serverStatus === 'offline'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            serverStatus === 'online' ? 'bg-green-400 animate-pulse' :
            serverStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
          }`}></span>
          {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline — run: cd proxy && npm run dev' : 'Checking...'}
        </div>
      </div>

      {/* Domain Selector */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>📋</span> Policy Domain
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            id="policy-defi"
            onClick={() => setSelectedDemo('defi')}
            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
              selectedDemo === 'defi'
                ? 'bg-purple-600/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-[#141428] border-white/5 hover:border-purple-500/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💱</span>
              <span className="font-bold text-purple-200">DeFi Trading</span>
            </div>
            <p className="text-xs text-gray-400">
              AI trading bot policy — max spend, approved tokens/protocols
            </p>
            <p className="text-xs text-purple-400 mt-1 font-mono">alice.darkagent.eth</p>
          </button>

          <button
            id="policy-hiring"
            onClick={() => setSelectedDemo('hiring')}
            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
              selectedDemo === 'hiring'
                ? 'bg-purple-600/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-[#141428] border-white/5 hover:border-purple-500/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚖️</span>
              <span className="font-bold text-purple-200">EU AI Act — Hiring</span>
            </div>
            <p className="text-xs text-gray-400">
              CV screening agent — blocks filtering by protected attributes
            </p>
            <p className="text-xs text-purple-400 mt-1 font-mono">bob.darkagent.eth</p>
          </button>
        </div>
      </div>

      {/* Policy Details */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-purple-300 flex items-center gap-2">
            <span>🔒</span> Active Policy
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
            {currentPolicy.ens_handle}
          </span>
        </div>

        {/* Policy Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#0D0D1A] rounded-lg p-3 border border-white/5">
            <p className="text-xs text-gray-500 mb-1">Domain</p>
            <p className="text-sm font-semibold text-gray-200 capitalize">{currentPolicy.policy.domain}</p>
          </div>
          <div className="bg-[#0D0D1A] rounded-lg p-3 border border-white/5">
            <p className="text-xs text-gray-500 mb-1">Agent ID</p>
            <p className="text-sm font-semibold text-gray-200 font-mono">{currentPolicy.policy.agent_id}</p>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-[#0D0D1A] rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#111125] text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
            <div className="col-span-1">Rule</div>
            <div className="col-span-3">Field</div>
            <div className="col-span-2">Operator</div>
            <div className="col-span-3">Value</div>
            <div className="col-span-3">On Fail</div>
          </div>
          {currentPolicy.policy.rules.map((rule, i) => (
            <div
              key={rule.rule_id}
              className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center ${
                i < currentPolicy.policy.rules.length - 1 ? 'border-b border-white/5' : ''
              } hover:bg-purple-500/5 transition-colors`}
            >
              <div className="col-span-1">
                <span className="text-purple-400 font-mono text-xs font-bold">{rule.rule_id}</span>
              </div>
              <div className="col-span-3">
                <span className="text-gray-300 font-mono text-xs">{rule.field}</span>
              </div>
              <div className="col-span-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-medium">
                  {OPERATOR_LABELS[rule.operator] || rule.operator}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-yellow-300 font-mono text-xs">
                  {Array.isArray(rule.value) ? `[${rule.value.join(', ')}]` : String(rule.value)}
                </span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  rule.action_on_fail === 'block'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {rule.action_on_fail}
                </span>
                {rule.eu_ai_act_ref && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {rule.eu_ai_act_ref}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy JSON Preview */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>📄</span> Raw Policy JSON
          <span className="text-xs text-gray-500 font-normal ml-2">(stored in ENS text record: darkagent.policy)</span>
        </h2>
        <pre className="bg-[#0D0D1A] rounded-xl p-4 text-xs text-green-300 font-mono overflow-x-auto border border-white/5 leading-relaxed">
          {JSON.stringify(currentPolicy.policy, null, 2)}
        </pre>
      </div>
    </div>
  )
}
