import { useState } from 'react'
import ConfigurePolicy from './tabs/ConfigurePolicy'
import SubmitAction from './tabs/SubmitAction'
import ProofViewer from './tabs/ProofViewer'

const TABS = [
  { id: 'policy', label: 'Configure Policy', icon: '⚙️' },
  { id: 'submit', label: 'Submit Action', icon: '🚀' },
  { id: 'proof',  label: 'Proof Viewer',  icon: '🔐' },
]

export default function App() {
  const [tab, setTab] = useState('policy')
  const [lastProof, setLastProof] = useState(null)
  const [proofHistory, setProofHistory] = useState([])

  const handleProof = (proofData) => {
    setLastProof(proofData)
    setProofHistory(prev => [proofData, ...prev])
    setTab('proof')
  }

  return (
    <div className="min-h-screen font-mono">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="relative px-6 pt-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
              🛡️
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-violet-400 bg-clip-text text-transparent">
              DarkAgent
            </h1>
          </div>
          <p className="text-gray-400 italic text-sm ml-[52px]">
            ZK Compliance Layer for AI Agents — Prove your agent followed the rules, without revealing what the rules are.
          </p>
          <div className="ml-[52px] mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Base Sepolia
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Noir ZK
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              ENS Policies
            </span>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ─────────────────────────────── */}
      <nav className="px-6 pb-2">
        <div className="max-w-5xl mx-auto flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                flex items-center gap-2
                ${tab === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-[#1A1A2E] text-gray-400 hover:text-gray-200 hover:bg-[#222244] border border-white/5'
                }
              `}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Separator ──────────────────────────────────── */}
      <div className="px-6 pb-6 pt-2">
        <div className="max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      <main className="px-6 pb-12">
        <div className="max-w-5xl mx-auto animate-fade-in" key={tab}>
          {tab === 'policy' && <ConfigurePolicy />}
          {tab === 'submit' && <SubmitAction onProof={handleProof} />}
          {tab === 'proof'  && <ProofViewer proofData={lastProof} history={proofHistory} />}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-gray-600">
          <span>DarkAgent v1.0 — ZK Compliance Layer</span>
          <div className="flex items-center gap-4">
            <span>Noir (Aztec) • Base Sepolia • Coinbase CDP • ENS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
