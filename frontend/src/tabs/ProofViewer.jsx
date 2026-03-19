import { useState, useEffect } from 'react'

const PROXY_URL = 'http://localhost:8787'

export default function ProofViewer({ proofData, history = [] }) {
  const [allProofs, setAllProofs] = useState([])
  const [selectedProof, setSelectedProof] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load proofs from server
  useEffect(() => {
    const loadProofs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${PROXY_URL}/proofs`)
        if (res.ok) {
          const data = await res.json()
          setAllProofs(data.proofs || [])
        }
      } catch {
        // Server offline, use local history
      } finally {
        setLoading(false)
      }
    }
    loadProofs()
  }, [proofData])

  // Select the most recent proof by default
  useEffect(() => {
    if (proofData) {
      setSelectedProof(proofData)
    }
  }, [proofData])

  const displayProofs = allProofs.length > 0 ? allProofs : history.map(h => ({
    id: h.proof_id,
    tx_hash: h.proof_tx,
    basescan_url: h.basescan_url,
    timestamp: h.timestamp,
    chain: h.chain || 'Base Sepolia',
    status: 'verified',
    domain: h.domain,
    agent_id: h.agent_id
  }))

  const currentProof = selectedProof || proofData

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Current Proof */}
      {currentProof ? (
        <div className="glass-card p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
              <span>🔐</span> ZK Compliance Proof
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Verified On-Chain
            </span>
          </div>

          {/* Proof Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <ProofField label="Status" value={currentProof.status || 'APPROVED'} color="green" />
            <ProofField label="Chain" value={currentProof.chain || 'Base Sepolia'} color="blue" />
            <ProofField label="Domain" value={currentProof.domain || '—'} />
            <ProofField label="Agent" value={currentProof.agent_id || '—'} />
            <ProofField label="Rules Checked" value={currentProof.rules_checked || '—'} />
            <ProofField label="Timestamp" value={formatTimestamp(currentProof.timestamp)} />
          </div>

          {/* TX Hash */}
          <div className="bg-[#0D0D1A] rounded-xl p-4 border border-white/5 mb-4">
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Transaction Hash</p>
            <p className="text-sm text-green-300 font-mono break-all leading-relaxed">
              {currentProof.proof_tx || currentProof.tx_hash || '—'}
            </p>
          </div>

          {/* Proof ID */}
          {currentProof.proof_id && (
            <div className="bg-[#0D0D1A] rounded-xl p-4 border border-white/5 mb-4">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Proof ID</p>
              <p className="text-sm text-purple-300 font-mono break-all">{currentProof.proof_id}</p>
            </div>
          )}

          {/* BaseScan Link */}
          {currentProof.basescan_url && (
            <a
              href={currentProof.basescan_url}
              target="_blank"
              rel="noopener noreferrer"
              id="basescan-link"
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/30 transition-all text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on BaseScan →
            </a>
          )}

          {/* What This Proves */}
          <div className="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <h3 className="text-sm font-bold text-purple-300 mb-2">What this proof means:</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                The AI agent's action was evaluated against a policy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                All policy rules passed — action was compliant
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                A Zero-Knowledge proof was generated and verified on-chain
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">🔒</span>
                The policy rules remain completely private — never revealed
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <span className="text-6xl block mb-4">🔐</span>
          <h2 className="text-xl font-bold text-gray-400 mb-2">No Proofs Yet</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Submit an action that passes all policy rules to generate a ZK compliance proof.
            Go to the <strong className="text-purple-400">Submit Action</strong> tab to get started.
          </p>
        </div>
      )}

      {/* Proof History */}
      {displayProofs.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
            <span>📜</span> Proof History
            <span className="text-xs text-gray-500 font-normal ml-2">({displayProofs.length} proofs)</span>
          </h2>
          <div className="space-y-2">
            {displayProofs.slice().reverse().map((proof, i) => (
              <button
                key={proof.id || proof.tx_hash || i}
                onClick={() => setSelectedProof({
                  ...proof,
                  proof_tx: proof.tx_hash,
                  proof_id: proof.id,
                  basescan_url: proof.basescan_url || `https://sepolia.basescan.org/tx/${proof.tx_hash}`
                })}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0D0D1A] border border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all text-left"
              >
                <span className={`w-2 h-2 rounded-full ${proof.status === 'verified' || proof.compliant ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 font-mono truncate">
                    {proof.tx_hash || '—'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {proof.agent_id || '—'} • {formatTimestamp(proof.timestamp)}
                  </p>
                </div>
                <span className="text-xs text-green-400/60 font-medium">verified</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>📊</span> What Makes DarkAgent Different
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#111125]">
                <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Tool</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Audit Trail</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Policy Private?</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold text-xs uppercase">On-chain Proof?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/5">
                <td className="px-4 py-3 text-gray-300">NeMo Guardrails</td>
                <td className="text-center px-4 py-3 text-green-400">Yes</td>
                <td className="text-center px-4 py-3 text-red-400">No</td>
                <td className="text-center px-4 py-3 text-red-400">No</td>
              </tr>
              <tr className="border-t border-white/5">
                <td className="px-4 py-3 text-gray-300">Galileo</td>
                <td className="text-center px-4 py-3 text-green-400">Yes</td>
                <td className="text-center px-4 py-3 text-red-400">No</td>
                <td className="text-center px-4 py-3 text-red-400">No</td>
              </tr>
              <tr className="border-t border-white/5 bg-purple-500/5">
                <td className="px-4 py-3 text-purple-300 font-bold">DarkAgent</td>
                <td className="text-center px-4 py-3 text-green-400 font-bold">Yes</td>
                <td className="text-center px-4 py-3 text-green-400 font-bold">YES ✓</td>
                <td className="text-center px-4 py-3 text-green-400 font-bold">YES ✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ProofField({ label, value, color }) {
  const colorClasses = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="bg-[#0D0D1A] rounded-lg p-3 border border-white/5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold font-mono ${colorClasses[color] || 'text-gray-200'}`}>
        {value}
      </p>
    </div>
  )
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}
