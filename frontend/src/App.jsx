import { useState } from "react";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Proposer from "./pages/Proposer";
import SmartWallet from "./pages/SmartWallet";
import { useContracts } from "./hooks/useContracts";
import { useSmartWallet } from "./hooks/useSmartWallet";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Wallet, Zap, LogOut, ChevronRight, CheckCircle2, ShieldAlert } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState("smartwallet");
  const { connected, connectMetaMask, account, isLive } = useContracts();
  const {
    address,
    isConnected: isSmartWalletConnected,
    isSmartWallet,
    connectSmartWallet,
  } = useSmartWallet();

  // Use either legacy MetaMask or Smart Wallet connection
  const isAnyConnected = connected || isSmartWalletConnected;
  const displayAddress = address || account;
  const displayIsLive = isLive || isSmartWalletConnected;

  const NAV_ITEMS = [
    { id: "smartwallet", label: "Agent Config", icon: Wallet },
    { id: "propose", label: "Execution Terminal", icon: Zap },
    { id: "dashboard", label: "Network Logs", icon: Activity },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "smartwallet":
        return <SmartWallet />;
      case "dashboard":
        return <Dashboard />;
      case "propose":
        return <Proposer />;
      default:
        return <SmartWallet />;
    }
  };

  return (
    <div className="flex min-h-screen bg-vault-bg text-vault-text font-sans selection:bg-vault-green/30">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-72 border-r border-vault-slate/20 bg-[#1a1d23]/80 backdrop-blur-xl flex flex-col fixed h-full z-50"
      >
        <div className="p-8 border-b border-vault-slate/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-vault-green blur-lg opacity-20 rounded-full"></div>
              <Activity className="w-8 h-8 text-vault-green relative z-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-vault-text">
              <span className="text-vault-green">Dark</span>Agent
            </h1>
          </div>
          <p className="mt-2 text-[10px] text-vault-slate font-bold uppercase tracking-[0.2em] pl-[42px]">
            Agent Infrastructure
          </p>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? "bg-vault-green/10 text-vault-green shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-vault-green/20" 
                    : "text-vault-slate hover:bg-vault-slate/10 hover:text-vault-text"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-vault-green ml-auto shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-vault-slate/20 bg-black/20">
          {isAnyConnected ? (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-vault-slate/20 bg-vault-bg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-vault-slate uppercase tracking-wider">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-vault-green/10 text-vault-green border border-vault-green/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-vault-green animate-pulse"></div>
                  {displayIsLive ? "SECURE" : "TESTNET"}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-vault-text/80 truncate pr-2">
                    {displayAddress ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : "Connected"}
                  </span>
                  {isSmartWallet && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-vault-blue/20 text-vault-blue border border-vault-blue/30">
                      SMART
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-vault-blue text-white font-medium hover:bg-vault-blue/90 transition-colors shadow-lg shadow-vault-blue/20"
                onClick={connectSmartWallet}
              >
                <Wallet className="w-4 h-4" />
                Smart Wallet
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-transparent border border-vault-slate/30 text-vault-text font-medium hover:bg-vault-slate/10 transition-colors"
                onClick={connectMetaMask}
              >
                Injected Provider
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen relative overflow-x-hidden p-8">
        {/* Decorative background elements */}
        <div className="fixed top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-vault-green/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-vault-blue/5 blur-[120px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-7xl mx-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
