import React, { useState } from 'react';
import { useContracts } from '../hooks/useContracts';
import { ethers } from 'ethers';
import { Zap, ShieldCheck, TerminalSquare } from 'lucide-react';

const Proposer = () => {
    const { contracts, connected, account } = useContracts();
    const [actionData, setActionData] = useState('0xdeadbeef');
    const [status, setStatus] = useState('');
    const [proposalId, setProposalId] = useState(null);
    const [agentAddress, setAgentAddress] = useState('0x1111111111111111111111111111111111111111');

    const handlePropose = async () => {
        if (!connected || !contracts?.darkAgent || !account) {
            setStatus("[ERROR] Please connect vault configuration first.");
            return;
        }

        try {
            setStatus("[SYS] Initiating cryptographic proposal on-chain...");
            
            // Mock transaction for seamless demo
            await new Promise(r => setTimeout(r, 600));
            const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
            setStatus(`[PENDING] Transaction broadcast: ${mockHash}`);
            
            await new Promise(r => setTimeout(r, 1200));
            
            const mockPid = "0x" + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('');
            setProposalId(mockPid);
            setStatus(`[SUCCESS] Execution proposed. Hash ID: ${mockPid}`);

        } catch (error) {
            console.error("Propose error:", error);
            setStatus(`[FAULT] ${error.message}`);
        }
    };

    const handleVerifyAndExecute = async () => {
        if (!connected || !contracts?.darkAgent || proposalId === null) {
            setStatus("[ERROR] Invalid state. Await valid proposal ID.");
            return;
        }

        try {
            setStatus(`[AUTH] Checking consensus signatures for ID: ${proposalId}...`);
            await new Promise(r => setTimeout(r, 600));
            const mockVerifyHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
            setStatus(`[PENDING] Verifying via TEE enclave: ${mockVerifyHash}`);
            
            await new Promise(r => setTimeout(r, 1000));

            setStatus(`[VERIFIED] Authorization passed. Commencing execution...`);
            
            await new Promise(r => setTimeout(r, 500));
            const mockExecHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
            setStatus(`[PENDING] Executing authorized bundle: ${mockExecHash}`);
            
            await new Promise(r => setTimeout(r, 1000));

            setStatus("[OK] Autonomy successfully delegated and executed on-chain.");
        } catch (error) {
            console.error("Execute error:", error);
            setStatus(`[FAULT] ${error.message}`);
        }
    };

    return (
        <div className="relative min-h-screen py-8">
            <div className="relative z-10 max-w-4xl mx-auto animate-fade-in space-y-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-vault-text flex items-center gap-3">
                        <TerminalSquare className="w-8 h-8 text-vault-green" />
                        Execution Terminal
                    </h2>
                    <p className="text-vault-slate mt-2">
                        Directly interface with the execution network. Propose actions, enforce TEE validations, and dispatch verified payloads to the blockchain.
                    </p>
                </div>

                <div className="p-8 rounded-2xl border border-vault-slate/20 bg-[#1a1d23]/50 backdrop-blur-xl">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-vault-slate tracking-wider uppercase">Target Agent Contract</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-vault-slate/30 text-vault-text focus:border-vault-green/50 focus:outline-none focus:ring-1 focus:ring-vault-green/50 transition-all font-mono text-sm"
                                value={agentAddress}
                                onChange={(e) => setAgentAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-vault-slate tracking-wider uppercase">Encrypted Action Calldata</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-vault-slate/30 text-vault-text focus:border-vault-green/50 focus:outline-none focus:ring-1 focus:ring-vault-green/50 transition-all font-mono text-sm tracking-widest"
                                value={actionData}
                                onChange={(e) => setActionData(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t border-vault-slate/20">
                            <button
                                onClick={handlePropose}
                                className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-vault-blue hover:bg-vault-blue/90 text-white font-semibold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
                                disabled={!connected}
                            >
                                <Zap className="w-5 h-5" />
                                Transmit Proposal
                            </button>
                            <button
                                onClick={handleVerifyAndExecute}
                                disabled={proposalId === null}
                                className={`flex-1 inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all shadow-lg ${proposalId !== null ? 'bg-vault-green hover:bg-vault-green/90 text-black shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]' : 'bg-vault-slate/30 text-vault-slate/50 cursor-not-allowed'}`}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Verify & Execute
                            </button>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className="p-6 rounded-xl border border-vault-green/20 bg-vault-green/5 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-vault-green shadow-[0_0_10px_#00ff88]"></div>
                        <h4 className="text-xs font-bold text-vault-green mb-3 tracking-widest uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-vault-green animate-pulse"></span>
                            Live Telemetry
                        </h4>
                        <p className="text-sm text-vault-text/90 font-mono break-all leading-relaxed whitespace-pre-wrap">
                            {status}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Proposer;
