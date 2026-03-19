import { useEffect, useMemo, useState, useRef } from 'react'
import { CheckCircle2, ShieldAlert, Sparkles, Shield, ShieldX, ShieldCheck, Wallet, ArrowRight, ExternalLink } from 'lucide-react'
import { parseAbi, stringToHex } from 'viem'
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { AppShell, GlowButton, StatusBadge } from '../../components/darkagent/Ui'
import {
  BASE_SEPOLIA_CHAIN_ID,
  DARKAGENT_CONTRACTS,
  DEFAULT_ENS_PROFILE,
  DEMO_AGENT_ADDRESS,
  formatUsd,
  txExplorerUrl,
} from '../../lib/product'
import { normalizePolicy } from '../../lib/policyEngine'

const PROFILE = DEFAULT_ENS_PROFILE
const BLINK_URL = 'https://x.com/agent/status/123?protocol=uniswap&chain=base&tokenIn=USDC&tokenOut=ETH&amountUsd=100&slippageBps=50&liquidityUsd=1000000&source=twitter&sender=%40AI_Agent'
const EXPECTED_AMOUNT = 100

const DARKAGENT_PROPOSE_ABI = parseAbi([
  'function propose(address agent, address user, bytes action) external returns (bytes32)',
])

export default function ExtensionDemoPage() {
  const { state, updatePolicy, analyzeBlinkUrl, executeBlinkUrl, busy: contextBusy } = useDarkAgent()
  const profile = state?.policies?.find((entry) => entry.ensName === PROFILE)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  
  // Extension state
  const [extensionOpen, setExtensionOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState(10)
  const [updatingPolicy, setUpdatingPolicy] = useState(false)
  const [executionTx, setExecutionTx] = useState(null)
  const [executing, setExecuting] = useState(false)

  // Web3 state
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()

  // Initialize slider and trigger analysis on mount automatically!
  useEffect(() => {
    if (profile?.stored) {
      const stored = normalizePolicy(profile.stored)
      const currentTwitter = stored.sourceLimits?.twitter !== undefined ? stored.sourceLimits.twitter : 300
      setSliderValue(currentTwitter)
    }
    
    // Auto-open fake agent sequence
    setTimeout(() => {
      setExtensionOpen(true)
      runAnalysis()
    }, 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runAnalysis = async () => {
    setLoadingAnalysis(true)
    try {
      const payload = await analyzeBlinkUrl({ url: BLINK_URL, ensName: PROFILE })
      setAnalysisResult(payload)
    } catch (err) {
      setAnalysisResult(err.payload || { analysis: { decision: 'block', summary: err.message } })
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Handle slider change locally, debounce policy update
  const slideTimeout = useRef(null)
  function handleSliderChange(val) {
    setSliderValue(val)
    if (slideTimeout.current) clearTimeout(slideTimeout.current)
    
    slideTimeout.current = setTimeout(async () => {
      if (!profile?.stored) return
      setUpdatingPolicy(true)
      try {
        const stored = normalizePolicy(profile.stored)
        await updatePolicy(PROFILE, {
          ...stored,
          sourceLimits: {
            ...stored.sourceLimits,
            twitter: val
          }
        })
        await runAnalysis()
      } finally {
        setUpdatingPolicy(false)
      }
    }, 500) // 500ms debounce
  }

  const verdict = analysisResult?.analysis
  const isBlocked = verdict?.decision === 'block' || verdict?.allowed === false
  const statusColor = isBlocked ? 'bg-red-500/10 border-red-500/20 text-red-100' : 'bg-vault-green/10 border-vault-green/20 text-vault-green'
  const StatusIcon = isBlocked ? ShieldX : ShieldCheck

  const handleExecution = async () => {
    if (!isConnected || isBlocked) return
    
    setExecuting(true)
    try {
      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID })
      }
      
      const actionPayload = stringToHex(JSON.stringify({ blink: BLINK_URL }))
      const walletHash = await writeContractAsync({
        address: DARKAGENT_CONTRACTS.DarkAgent,
        abi: DARKAGENT_PROPOSE_ABI,
        functionName: 'propose',
        args: [DEMO_AGENT_ADDRESS || address, address, actionPayload],
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: walletHash })
      
      const payload = await executeBlinkUrl({ url: BLINK_URL, ensName: PROFILE })
      setExecutionTx({
        walletHash,
        proofId: payload.proof?.id,
        stealthAddress: payload.execution?.stealthAddress,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <AppShell>
      <div className="relative flex h-full items-center justify-center pt-8">
        
        {/* Background Twitter Mock */}
        <div className="mx-auto w-full max-w-2xl transition-all duration-700">
          <div className="rounded-3xl border border-white/10 bg-black p-6 shadow-2xl relative overflow-hidden">
            {extensionOpen && <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] transition-all duration-500" />}
            
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="h-12 w-12 rounded-full bg-slate-800" />
              <div>
                <div className="font-bold text-white">AI Trader Agent <span className="text-slate-500 font-normal">@AI_Agent</span></div>
                <div className="text-sm text-slate-400">Found massive volume spike on $ETH. Initiating immediate arbitrage swap via Uniswap Blink.</div>
              </div>
            </div>
            
            <div className="mt-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
              <div className="text-xs uppercase tracking-widest text-blue-400">Uniswap Blink</div>
              <div className="mt-2 text-xl font-bold text-white">Swap 100 USDC for ETH</div>
              <div className="mt-1 text-sm text-slate-300">Target chain: Base Sepolia. Slippage: 0.5%</div>
              
              <button className="mt-4 w-full rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 px-4 py-3 font-semibold text-black hover:bg-slate-200">
                Execute Swap ($100.00)
              </button>
            </div>
          </div>
        </div>

        {/* Extensions Sidebar (DarkAgent) */}
        <div 
          className={`absolute right-0 top-0 h-full w-[420px] transform rounded-l-3xl border-l border-white/10 shadow-2xl transition-all duration-500 ${extensionOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ background: 'linear-gradient(180deg, rgba(16,24,39,0.95) 0%, rgba(10,15,20,0.98) 100%)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex flex-col h-full p-6 relative">
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vault-green/20 border border-vault-green/30 text-vault-green">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-white tracking-tight">DarkAgent Intercept</div>
                <div className="text-xs text-slate-400">Protective proxy extension</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-6 space-y-5 no-scrollbar pb-10">
              
              {loadingAnalysis && !analysisResult ? (
                <div className="animate-pulse rounded-2xl bg-white/5 h-24 w-full" />
              ) : analysisResult ? (
                <>
                  <div className={`rounded-2xl border px-5 py-4 ${statusColor}`}>
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-6 w-6" />
                      <div>
                        <div className="font-bold uppercase tracking-wide text-sm">{isBlocked ? 'Blocked execution' : 'Safe to execute'}</div>
                        <div className="mt-0.5 text-sm opacity-90">{verdict?.summary || (isBlocked ? 'Violates your constraints.' : 'Passed all constraints.')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">Transaction Identity</div>
                    <div className="flex items-center justify-between rounded-xl bg-black/40 border border-white/5 p-3">
                      <span className="text-sm text-slate-400">Requested</span>
                      <span className="text-sm font-bold text-white">$100.00 USDC</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-black/40 border border-white/5 p-3">
                      <span className="text-sm text-slate-400">Source Profile</span>
                      <span className="text-sm font-medium text-slate-200">Twitter (Social)</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-vault-slate font-semibold">Live Policy Adjust Tracker</div>
                      {updatingPolicy && <div className="text-[10px] text-vault-green animate-pulse uppercase">Syncing...</div>}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Twitter Limit Constraint:</span>
                        <span className={`font-mono font-bold ${sliderValue >= 100 ? 'text-vault-green' : 'text-red-400'}`}>
                          ${sliderValue}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="200" 
                        step="10"
                        value={sliderValue}
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-vault-green"
                      />
                      <div className="text-xs text-slate-500 leading-snug">Drag the slider to dynamically change the rules engine permission boundaries.</div>
                    </div>
                  </div>
                  
                  {executionTx && (
                    <div className="rounded-2xl border border-vault-green/20 bg-vault-green/5 p-4 mt-6">
                      <div className="text-sm font-bold text-vault-green flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> Agent Execute Success
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300"><span className="text-slate-500">Wallet Tx:</span> <a href={txExplorerUrl(executionTx.walletHash)} target="_blank" rel="noreferrer" className="text-vault-green hover:underline">View BaseScan ↗</a></div>
                        <div className="flex justify-between text-slate-300"><span className="text-slate-500">Proof ID:</span> <span className="font-mono">{executionTx.proofId?.slice(0,12)}...</span></div>
                      </div>
                    </div>
                  )}

                </>
              ) : null}
            </div>

            <div className="pt-4 border-t border-white/10 mt-auto">
              {!isConnected ? (
                <div className="text-center text-sm text-amber-300 py-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  Connect your wallet to execute.
                </div>
              ) : (
                <button
                  onClick={handleExecution}
                  disabled={isBlocked || executing || updatingPolicy || executionTx}
                  className={`w-full rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition ${
                    isBlocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                    executionTx ? 'bg-vault-green/20 text-vault-green cursor-default' :
                    'bg-vault-green text-black hover:bg-vault-green/90 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                  }`}
                >
                  <Wallet className="h-4 w-4" /> 
                  {executing ? 'Executing...' : executionTx ? 'Executed successfully' : isBlocked ? 'Execution Locked' : 'Safe to Sign & Execute'}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  )
}
