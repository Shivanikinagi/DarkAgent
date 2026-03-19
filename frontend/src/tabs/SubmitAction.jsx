import { useState } from 'react'

const PROXY_URL = 'http://localhost:8787'

export default function SubmitAction({ onProof }) {
  const [demo, setDemo] = useState('defi')
  const [amount, setAmount] = useState('800')
  const [token, setToken] = useState('DEGEN')
  const [protocol, setProtocol] = useState('uniswap')
  const [filterFields, setFilterFields] = useState('location,skills,experience')
  const [batchSize, setBatchSize] = useState('450')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState([])

  const ensHandle = demo === 'defi' ? 'alice.darkagent.eth' : 'bob.darkagent.eth'

  const buildPayload = () => {
    if (demo === 'defi') {
      return {
        amount_usdc: Number(amount),
        token_category: token === 'DEGEN' ? 'meme' : token === 'PEPE' ? 'meme' : 'stable',
        protocol: protocol
      }
    }
    return {
      filter_fields_used: filterFields,
      batch_size: Number(batchSize)
    }
  }

  const addStep = (step) => {
    setSteps(prev => [...prev, { ...step, timestamp: new Date().toISOString() }])
  }

  const submit = async () => {
    setLoading(true)
    setResult(null)
    setSteps([])

    const payload = buildPayload()

    addStep({ icon: '📡', text: 'Sending action payload to DarkAgent proxy...', status: 'active' })
    await new Promise(r => setTimeout(r, 300))

    addStep({ icon: '🔍', text: `Loading policy from ENS: ${ensHandle}`, status: 'active' })
    await new Promise(r => setTimeout(r, 400))

    addStep({ icon: '⚖️', text: 'Evaluating action against policy rules...', status: 'active' })

    try {
      const res = await fetch(`${PROXY_URL}/intercept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ens_handle: ensHandle,
          agent_id: 'demo_agent',
          action: payload
        })
      })

      const data = await res.json()
      setResult(data)

      if (data.status === 'BLOCKED') {
        addStep({ icon: '❌', text: `BLOCKED — Rule ${data.violated_rule}: ${data.reason}`, status: 'error' })
        if (data.eu_ref) {
          addStep({ icon: '📜', text: `EU AI Act Reference: ${data.eu_ref}`, status: 'warning' })
        }
      } else if (data.status === 'APPROVED') {
        addStep({ icon: '✅', text: `All ${data.rules_checked} rules passed — Action APPROVED`, status: 'success' })
        addStep({ icon: '🔐', text: 'Noir ZK circuit executing... Proof generated!', status: 'success' })
        addStep({ icon: '⛓️', text: `Proof submitted to ${data.chain}`, status: 'success' })
        addStep({ icon: '📝', text: `TX Hash: ${data.proof_tx}`, status: 'success' })

        if (onProof) {
          onProof(data)
        }
      }
    } catch (err) {
      addStep({ icon: '⚠️', text: `Error: ${err.message}. Is the proxy server running?`, status: 'error' })
      setResult({ status: 'ERROR', error: err.message })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Demo Selector */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>🎯</span> Select Demo Scenario
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            id="demo-defi"
            onClick={() => { setDemo('defi'); setResult(null); setSteps([]) }}
            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
              demo === 'defi'
                ? 'bg-purple-700/30 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-[#141428] border-white/5 hover:border-purple-500/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💱</span>
              <span className="font-bold text-white">DeFi Demo</span>
            </div>
            <p className="text-xs text-gray-400">AI trading bot attempting token swap</p>
          </button>

          <button
            id="demo-hiring"
            onClick={() => { setDemo('hiring'); setResult(null); setSteps([]) }}
            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
              demo === 'hiring'
                ? 'bg-purple-700/30 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-[#141428] border-white/5 hover:border-purple-500/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚖️</span>
              <span className="font-bold text-white">EU AI Act — Hiring Demo</span>
            </div>
            <p className="text-xs text-gray-400">AI CV screener filtering candidates</p>
          </button>
        </div>
      </div>

      {/* Action Configuration */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>🤖</span> Agent Action Payload
          <span className="ml-auto text-xs text-gray-500 font-normal font-mono">{ensHandle}</span>
        </h2>

        {demo === 'defi' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Agent wants to swap USDC for a token on a DeFi protocol</p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wider">USDC Amount</label>
                <input
                  id="input-amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  type="number"
                  className="w-full bg-[#0D0D1A] text-white px-4 py-2.5 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                  placeholder="USDC amount"
                />
                <p className="text-xs text-gray-600 mt-1">Policy max: 300 USDC</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wider">Token</label>
                <select
                  id="select-token"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="w-full bg-[#0D0D1A] text-white px-4 py-2.5 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                >
                  <option value="DEGEN">DEGEN (meme)</option>
                  <option value="PEPE">PEPE (meme)</option>
                  <option value="USDC">USDC (stable)</option>
                  <option value="ETH">ETH (stable)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">Policy blocks: meme, unverified</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wider">Protocol</label>
                <select
                  id="select-protocol"
                  value={protocol}
                  onChange={e => setProtocol(e.target.value)}
                  className="w-full bg-[#0D0D1A] text-white px-4 py-2.5 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                >
                  <option value="uniswap">Uniswap ✅</option>
                  <option value="aave">Aave ✅</option>
                  <option value="compound">Compound ✅</option>
                  <option value="sushiswap">SushiSwap ❌</option>
                </select>
              </div>
            </div>

            {/* Payload Preview */}
            <div className="bg-[#0D0D1A] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Action Payload Preview:</p>
              <pre className="text-xs text-cyan-300 font-mono">
{JSON.stringify(buildPayload(), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {demo === 'hiring' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">AI agent filtering CVs using specific criteria fields</p>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 text-xs font-medium">
                ⚠️ Policy blocks filtering by: <strong>location</strong> and <strong>age</strong> (EU AI Act Article 10(5))
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wider">Filter Fields Used</label>
                <input
                  id="input-filter-fields"
                  value={filterFields}
                  onChange={e => setFilterFields(e.target.value)}
                  className="w-full bg-[#0D0D1A] text-white px-4 py-2.5 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                  placeholder="comma-separated fields"
                />
                <p className="text-xs text-gray-600 mt-1">Try removing "location" to pass</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wider">Batch Size</label>
                <input
                  id="input-batch-size"
                  value={batchSize}
                  onChange={e => setBatchSize(e.target.value)}
                  type="number"
                  className="w-full bg-[#0D0D1A] text-white px-4 py-2.5 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                  placeholder="Batch size"
                />
                <p className="text-xs text-gray-600 mt-1">Policy max: 500</p>
              </div>
            </div>

            {/* Payload Preview */}
            <div className="bg-[#0D0D1A] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Action Payload Preview:</p>
              <pre className="text-xs text-cyan-300 font-mono">
{JSON.stringify(buildPayload(), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        id="btn-submit"
        onClick={submit}
        disabled={loading}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
          flex items-center justify-center gap-3
          ${loading
            ? 'bg-purple-800/50 text-gray-400 cursor-wait'
            : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99]'
          }
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Evaluating...
          </>
        ) : (
          <>
            🚀 Submit to DarkAgent
          </>
        )}
      </button>

      {/* Execution Steps */}
      {steps.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
            <span>📊</span> Execution Flow
          </h2>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg animate-fade-in ${
                  step.status === 'error'   ? 'bg-red-500/10 border border-red-500/20' :
                  step.status === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  step.status === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                  'bg-[#141428] border border-white/5'
                }`}
              >
                <span className="text-lg">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm break-all ${
                    step.status === 'error'   ? 'text-red-300' :
                    step.status === 'warning' ? 'text-yellow-300' :
                    step.status === 'success' ? 'text-green-300' :
                    'text-gray-300'
                  }`}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && result.status !== 'ERROR' && (
        <div className={`glass-card p-6 border-2 ${
          result.status === 'BLOCKED'
            ? 'border-red-500/30 bg-red-950/20'
            : 'border-green-500/30 bg-green-950/20'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{result.status === 'BLOCKED' ? '🚫' : '✅'}</span>
            <div>
              <h3 className={`text-xl font-bold ${result.status === 'BLOCKED' ? 'text-red-400' : 'text-green-400'}`}>
                {result.status}
              </h3>
              <p className="text-xs text-gray-400">
                Domain: {result.domain} • Agent: {result.agent_id}
              </p>
            </div>
          </div>

          {result.reason && (
            <div className="bg-red-900/20 rounded-lg p-3 mb-3 border border-red-500/10">
              <p className="text-red-300 text-sm font-mono">{result.reason}</p>
            </div>
          )}

          {result.eu_ref && (
            <div className="bg-yellow-900/20 rounded-lg p-3 mb-3 border border-yellow-500/10">
              <p className="text-yellow-300 text-sm">📜 EU AI Act: {result.eu_ref}</p>
            </div>
          )}

          {result.proof_tx && (
            <div className="space-y-2">
              <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/10">
                <p className="text-green-300 text-sm font-mono break-all">
                  🔐 ZK Proof TX: {result.proof_tx}
                </p>
              </div>
              {result.basescan_url && (
                <a
                  href={result.basescan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm"
                >
                  View on BaseScan →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
